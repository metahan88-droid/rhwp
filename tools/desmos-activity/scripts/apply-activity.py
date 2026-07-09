#!/usr/bin/env python3
"""Generic manifest-driven deployer for HTML-parity Desmos/Amplify activities.

Canonical implementation of the /html-to-desmos skill deployment contract —
replaces the copy-and-edit-the-reference-script workflow.

Manifest (JSON) schema — superset of the pizza/lines project manifests:
{
  "target": "<24hex activity id>",
  "expected": {"title": "...", "slideCount": 6},          # dry-run hard gate
  "guards": {
    "forbidden": ["3.375", ...],            # answer strings (student-visible)
    "guardedSlides": [0, 1, 2],             # 0-based indices checked for forbidden
    "forbiddenOldTopicTerms": ["피자", ...] # skeleton-origin vocabulary, checked on ALL slides
  },
  "title": "...", "subtitle": "...",        # optional activity retitle
  "slides": [{"index": 0, "title": "...", "state": "path.json",
              "graph": {"alias": "g1", "script": null, "exhibitMode": true},
              "notes": [{"componentId": "...", "alias": "...", "script": "...",
                          "paragraphs": ["...", ...]}],
              "inputs": [{"componentId": "...", "alias": "...", "script": null}]}],
  "inventory": "component-inventory.json"   # optional: enforce expected-set
}

Modes:
  --inventory-out FILE   claim (read-only) and dump a component inventory
                         skeleton: every student-visible component with
                         visibleText, action:"", expected:false — 실사 시작점.
  (default)              dry run: apply manifest in memory, run all guards,
                         write planned JSON. No remote mutation.
  --save                 save (finish:false→true) + fidelity byte-diff +
                         pre/post component diff (stray detection) +
                         inventory expected-set enforcement (if provided).
  --publish              publish after save (requires explicit user consent
                         per the skill's gate 8).
  --skip-ui-checks       skip per-slide preview screenshots.

Requires logged-in Chrome on CDP 9222 (chrome-debug.sh). Session revival:
claim 401 → the tool retries via ?checkAmplifyLogin=true automatically.
"""
import argparse
import copy
import json
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CRDESMOS_ROOT = Path("/Users/han/.codex/skills/crdesmos")
sys.path.insert(0, str(CRDESMOS_ROOT / "scripts"))
import crdesmos  # noqa: E402

ORIGIN = "https://classroom.amplify.com"
TEACHER_KEYS = {"teacherTips", "teacherTip", "teacherNotes"}
COMPONENT_ID = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


def stamp():
    return time.strftime("%Y%m%d_%H%M%S")


# ---------------------------------------------------------------- tree ops --
def walk_components(node, path="root"):
    """Yield ALL components by payload shape (dict carrying a UUID id).
    Never filter by key shape — hyphen-keyed types (multiple-choice,
    action-button) slipped through slash-key walkers into a published
    activity (2026-07-09 incident)."""
    if isinstance(node, dict):
        for key, value in node.items():
            if isinstance(value, dict) and isinstance(value.get("id"), str) \
                    and COMPONENT_ID.match(value["id"]):
                yield key, value, f"{path}/{key}"
            yield from walk_components(value, f"{path}/{key}")
    elif isinstance(node, list):
        for i, item in enumerate(node):
            yield from walk_components(item, f"{path}[{i}]")


def find_component_by_id(step, comp_id):
    for _, comp, _ in walk_components(step):
        if comp.get("id") == comp_id:
            return comp
    return None


def find_first_component(step, ctype):
    for key, comp, _ in walk_components(step):
        if key == ctype:
            return comp
    return None


def visible_text(comp, limit=120):
    """Best-effort student-visible text snippet of a component."""
    parts = []
    for field in ("text", "title"):
        v = comp.get(field)
        if isinstance(v, str) and v.strip():
            parts.append(v.strip())
    blob = json.dumps(comp, ensure_ascii=False)
    parts += re.findall(r'"text":\s*"([^"]{2,60})"', blob)[:6]
    seen, out = set(), []
    for p in parts:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return " | ".join(out)[:limit]


def component_inventory(data):
    """[{slideIndex, key(type), id, alias, visibleText}] for every component.
    UUID-named keys (e.g. choice children) are skipped — they live inside a
    parent component that is already listed."""
    rows = []
    for i, step in enumerate(data["steps"]):
        for key, comp, _ in walk_components(step):
            if COMPONENT_ID.match(key):
                continue
            rows.append({"slideIndex": i, "type": key, "id": comp["id"],
                         "alias": comp.get("alias"),
                         "visibleText": visible_text(comp)})
    return rows


# ---------------------------------------------------------------- doc build --
def paragraphs_doc(paragraphs):
    content = []
    for para in paragraphs:
        node = {"type": "paragraph"}
        if para:
            node["content"] = [{"type": "text", "text": para}]
        content.append(node)
    return json.dumps({"type": "doc", "content": content}, ensure_ascii=False)


# ---------------------------------------------------------------- guards ----
def text_hits(obj, needles, path="", skip_teacher=True, skip_script=True):
    hits = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            if skip_teacher and key in TEACHER_KEYS:
                continue
            if skip_script and key == "script":
                continue
            hits += text_hits(value, needles, f"{path}.{key}",
                              skip_teacher, skip_script)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            hits += text_hits(item, needles, f"{path}[{i}]",
                              skip_teacher, skip_script)
    elif isinstance(obj, str):
        for bad in needles:
            if bad and bad in obj:
                hits.append((path, bad, obj[:90]))
    return hits


# ---------------------------------------------------------------- patching --
def apply_manifest(data, manifest, root):
    out = copy.deepcopy(data)
    if manifest.get("title"):
        out["title"] = manifest["title"]
    if manifest.get("subtitle"):
        out["subtitle"] = manifest["subtitle"]
    for slide in manifest["slides"]:
        step = out["steps"][slide["index"]]
        if slide.get("state"):
            state = json.loads((root / slide["state"]).read_text())
            graph = find_first_component(step, "input/graph")
            if graph is None:
                raise SystemExit(
                    f"slide index {slide['index']}: no input/graph component")
            graph["calculatorState"] = state
            gcfg = slide.get("graph", {})
            graph["alias"] = gcfg.get("alias")
            graph["script"] = gcfg.get("script")
            if "exhibitMode" in gcfg:
                graph["exhibitMode"] = gcfg["exhibitMode"]
        for note in slide.get("notes", []):
            comp = find_component_by_id(step, note["componentId"])
            if comp is None:
                raise SystemExit(
                    f"slide index {slide['index']}: note component "
                    f"{note['componentId']} not found")
            comp["text"] = " ".join(p for p in note["paragraphs"] if p)
            comp["doc"] = paragraphs_doc(note["paragraphs"])
            comp.setdefault("background", {"type": "blank"})
            comp.setdefault("noteType", "note")
            if note.get("alias") is not None:
                comp["alias"] = note["alias"]
            if "script" in note:
                comp["script"] = note["script"]
        for inp in slide.get("inputs", []):
            comp = find_component_by_id(step, inp["componentId"])
            if comp is None:
                raise SystemExit(
                    f"slide index {slide['index']}: input component "
                    f"{inp['componentId']} not found")
            if inp.get("alias") is not None:
                comp["alias"] = inp["alias"]
            if "script" in inp:
                comp["script"] = inp["script"]
        if slide.get("title"):
            step["title"] = slide["title"]
    return out


# ---------------------------------------------------------------- remote ----
def goto_activity(page, aid):
    # checkAmplifyLogin=true re-mints classroom session cookies from the SSO
    # cookie — without it a stale profile claim 401s (observed 2026-07-08).
    url = f"{ORIGIN}/activity/{aid}?checkAmplifyLogin=true&lang=ko"
    if not page.url.startswith(url.split("?")[0]):
        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(3500)


def save_payload(page, aid, data, finish):
    for attempt in (1, 2):
        _, token = crdesmos.claim_target(page, aid, f"save{attempt}")
        result = crdesmos.ev(page, crdesmos.SAVE_JS,
                             [aid, {"finish": finish, "editToken": token,
                                    "data": data}])
        if result.get("status") == 200 and "OK" in result.get("body", ""):
            return
        print(f"[warn] save attempt {attempt} failed: "
              f"{result.get('status')} {result.get('body', '')[:120]}")
        time.sleep(1.5)
    raise SystemExit("save failed twice")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--out-root", default=".",
                    help="backups/ reports/ 및 매니페스트 상대경로의 기준 디렉토리")
    ap.add_argument("--inventory-out",
                    help="실사 모드: 인벤토리 스켈레톤만 덤프하고 종료")
    ap.add_argument("--save", action="store_true")
    ap.add_argument("--publish", action="store_true")
    ap.add_argument("--skip-ui-checks", action="store_true")
    args = ap.parse_args()

    root = Path(args.out_root).resolve()
    manifest = json.loads(Path(args.manifest).read_text())
    target = manifest["target"]
    if not re.fullmatch(r"[0-9a-fA-F]{24}", target):
        raise SystemExit("bad target id in manifest")
    expected = manifest.get("expected", {})
    guards = manifest.get("guards", {})
    ts = stamp()
    (root / "backups").mkdir(parents=True, exist_ok=True)
    (root / "reports").mkdir(parents=True, exist_ok=True)

    with sync_playwright() as pw:
        browser = pw.chromium.connect_over_cdp(crdesmos.CDP_URL)
        page = browser.contexts[0].new_page()
        goto_activity(page, target)
        data, _ = crdesmos.claim_target(page, target, "read")

        print(f"[target] {target} | title: {data.get('title', '')[:60]} "
              f"| slides: {len(data['steps'])}")
        if expected.get("title") and data.get("title") != expected["title"] \
                and manifest.get("title") != expected["title"]:
            raise SystemExit(f"EXPECTED_TITLE mismatch: {data.get('title')!r}")
        if expected.get("slideCount") \
                and len(data["steps"]) != expected["slideCount"]:
            raise SystemExit(
                f"EXPECTED_SLIDE_COUNT mismatch: {len(data['steps'])}")

        if args.inventory_out:
            rows = component_inventory(data)
            for r in rows:
                r.update({"action": "", "expected": False})
            Path(args.inventory_out).write_text(
                json.dumps(rows, ensure_ascii=False, indent=1))
            print(f"[inventory] {args.inventory_out} ({len(rows)} components)"
                  " — action(keep|replace|delete)·expected를 채운 뒤 배포 진행")
            return

        backup = root / "backups" / f"{target}_pre_{ts}.json"
        backup.write_text(json.dumps(data, ensure_ascii=False))
        print(f"[backup] {backup}")

        updated = apply_manifest(data, manifest, root)

        if crdesmos.count_bold(updated) > 0:
            raise SystemExit("bold marks present — refusing to save")
        leaks = []
        for idx in guards.get("guardedSlides", []):
            leaks += text_hits(updated["steps"][idx],
                               guards.get("forbidden", []), f"steps[{idx}]")
        for idx in range(len(updated["steps"])):
            leaks += text_hits(updated["steps"][idx],
                               guards.get("forbiddenOldTopicTerms", []),
                               f"steps[{idx}]")
        if leaks:
            for path, bad, ctx in leaks[:10]:
                print(f"[leak] {bad!r} @ {path}: {ctx}")
            raise SystemExit("guard strings leak into student-visible fields")

        # inventory expected-set enforcement (if the 실사 file is provided)
        inv_path = manifest.get("inventory")
        if inv_path:
            inv = {r["id"]: r for r in
                   json.loads((root / inv_path).read_text())}
            problems = []
            for r in component_inventory(updated):
                rec = inv.get(r["id"])
                if rec is None:
                    problems.append(f"미실사 컴포넌트 {r['type']} {r['id'][:8]} "
                                    f"(slide {r['slideIndex'] + 1})")
                elif not rec.get("expected") or rec.get("action") == "delete":
                    problems.append(
                        f"expected 아님/삭제 예정인데 잔존: {r['type']} "
                        f"{r['id'][:8]} (slide {r['slideIndex'] + 1})")
            if problems:
                for p in problems[:10]:
                    print(f"[inventory] {p}")
                raise SystemExit("component inventory gate failed")

        plan = root / "reports" / f"{target}_plan_{ts}.json"
        plan.write_text(json.dumps(updated, ensure_ascii=False))
        print(f"[plan] {plan}")

        if not args.save:
            print("[dry-run] all gates passed; re-run with --save to deploy")
            return

        save_payload(page, target, updated, finish=False)
        save_payload(page, target, updated, finish=True)
        print("[saved]")
        if args.publish:
            result = crdesmos.ev(page, crdesmos.PUBLISH_JS, target)
            print(f"[publish] {result.get('status')}")

        fresh, _ = crdesmos.claim_target(page, target, "verify")
        for slide in manifest["slides"]:
            if not slide.get("state"):
                continue
            want = json.dumps(json.loads(
                (root / slide["state"]).read_text()), sort_keys=True)
            got = json.dumps(
                find_first_component(fresh["steps"][slide["index"]],
                                     "input/graph").get("calculatorState"),
                sort_keys=True)
            print(f"[verify] slide idx {slide['index']}: "
                  f"{'OK' if want == got else 'MISMATCH'}")
            if want != got:
                raise SystemExit("fidelity mismatch after save")

        pre_ids = {r["id"] for r in component_inventory(data)}
        for r in component_inventory(fresh):
            if r["id"] not in pre_ids:
                print(f"[warn] stray component appeared: {r['type']} "
                      f"{r['id'][:8]} (slide {r['slideIndex'] + 1}) — "
                      "발행 전 제거 필요")

        if not args.skip_ui_checks:
            for i, step in enumerate(fresh["steps"]):
                page.goto(f"{ORIGIN}/activity/{target}?lang=ko"
                          f"&previewScreen={step['id']}",
                          wait_until="domcontentloaded")
                page.wait_for_timeout(11000)
                shot = root / "reports" / f"{target}_slide{i + 1}_{ts}.png"
                page.screenshot(path=str(shot))
                print(f"[preview] {shot}")


if __name__ == "__main__":
    main()
