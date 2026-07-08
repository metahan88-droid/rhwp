#!/usr/bin/env python3
"""Headless renderer for Desmos version-11 graph states.

Loads the public Desmos calculator API in headless Chromium, applies a graph
state JSON, optionally overrides slider values and advances ticker time, then
screenshots the calculator viewport. Used as the visual-verification backbone
for activity graph states before CDP deployment.

Usage:
  render_state.py STATE.json --out shot.png
      [--set u=1.2 --set K=27]        # override slider/variable values
  render_state.py STATE.json --out dir/ --sweep u=0:6.28:5
      # render 5 frames sweeping u — filenames get _0.._4 suffixes
  render_state.py STATE.json --out shot.png --tick 3000
      # run the state's ticker for ~3000ms of simulated interaction first
  render_state.py STATE.json --out shot.png --width 900 --height 620
"""
import argparse
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

API_KEY = "dcb31709b452b1cf9dc26972add0fda6"  # Desmos public demo key
PAGE = """<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0">
<div id="calc" style="width:{w}px;height:{h}px"></div>
<script src="https://www.desmos.com/api/v1.12/calculator.js?apiKey={key}"></script>
<script>
  window.Calc = Desmos.GraphingCalculator(document.getElementById('calc'), {{
    expressions: false, settingsMenu: false, zoomButtons: false,
    lockViewport: false, border: false,
  }});
  window.__ready = true;
</script></body></html>"""


def parse_setting(raw):
    name, _, value = raw.partition("=")
    return name.strip(), value.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("state")
    ap.add_argument("--out", required=True)
    ap.add_argument("--set", action="append", default=[], dest="sets",
                    help="VAR=VALUE latex override, e.g. u=1.2")
    ap.add_argument("--sweep", help="VAR=MIN:MAX:FRAMES")
    ap.add_argument("--tick", type=int, default=0,
                    help="ms of ticker simulation before screenshot")
    ap.add_argument("--width", type=int, default=1000)
    ap.add_argument("--height", type=int, default=680)
    ap.add_argument("--settle", type=float, default=1.2,
                    help="seconds to wait after setState before shot")
    args = ap.parse_args()

    state = json.loads(pathlib.Path(args.state).read_text())
    out = pathlib.Path(args.out)

    frames = [("", [])]
    if args.sweep:
        var, _, spec = args.sweep.partition("=")
        lo, hi, n = spec.split(":")
        lo, hi, n = float(lo), float(hi), int(n)
        vals = [lo + (hi - lo) * i / max(n - 1, 1) for i in range(n)]
        frames = [(f"_{i}", [(var.strip(), repr(round(v, 4)))])
                  for i, v in enumerate(vals)]

    overrides = [parse_setting(s) for s in args.sets]

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(
            viewport={"width": args.width, "height": args.height})
        page.set_content(PAGE.format(w=args.width, h=args.height, key=API_KEY),
                         wait_until="networkidle")
        page.wait_for_function("window.__ready === true", timeout=20000)

        for suffix, sweep_sets in frames:
            frame_state = json.loads(json.dumps(state))
            def norm(s):
                return s.replace(" ", "").replace("{", "").replace("}", "")

            for name, value in overrides + sweep_sets:
                prefix = norm(name) + "="
                for item in frame_state["expressions"]["list"]:
                    latex = item.get("latex", "")
                    head, eq, _ = latex.partition("=")
                    if eq and norm(head) + "=" == prefix:
                        item["latex"] = head + "=" + str(value)
                        break
                else:
                    print(f"[warn] no definition found for {name}",
                          file=sys.stderr)
            page.evaluate("s => Calc.setState(s, {allowUndo: false})",
                          frame_state)
            if args.tick:
                # Ticker in state JSON starts if playing:true; just wait it out.
                time.sleep(args.tick / 1000)
            time.sleep(args.settle)
            if out.suffix:
                dest = out if not suffix else out.with_stem(out.stem + suffix)
            else:
                out.mkdir(parents=True, exist_ok=True)
                dest = out / f"frame{suffix or '_0'}.png"
            page.locator("#calc").screenshot(path=str(dest))
            print(f"[shot] {dest}")

        errors = page.evaluate(
            "() => Calc.getExpressions().filter(e => e.type==='expression')"
            ".length")
        print(f"[info] expressions loaded: {errors}")
        browser.close()


if __name__ == "__main__":
    main()
