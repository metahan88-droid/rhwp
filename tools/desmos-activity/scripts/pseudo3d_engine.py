#!/usr/bin/env python3
"""Shared pseudo-3D scene engine for the pizza activity redesign.

Every slide build script imports this module and composes expression lists.
Conventions match apply_pizza_3d.py (expression dicts, version-11 state).
All latex uses double-backslash Python strings.

Projection model (see ENGINE-SPEC.md):
  azimuth u (radians), tilt factor e (default 0.35), world (X, Z), base y=b.
  screen center x : c_x = X cos u + Z sin u
  depth           : d   = Z cos u - X sin u
  screen base y   : c_y = b + e*d
  vertical cylinder silhouette is invariant under u; toppings at (rho, t)
  rotate with phase (t - u).
"""

# ---------------------------------------------------------------- palette --
BG = "#171e2b"          # app background (HTML #1a202c)
PANEL = "#2d3748"       # card panel
PANEL_LINE = "#4a5568"
INK = "#e2e8f0"         # near-white text/points
MUTED = "#a0aec0"
TEAL = "#38b2ac"
TEAL_LIGHT = "#4fd1c5"
CHEESE = "#ffd166"
CHEESE_LIGHT = "#fff1a8"
SAUCE = "#e8590c"
CRUST = "#d2a35c"
CRUST_DARK = "#9a6324"
PEP = "#c0392b"
PEP_LIGHT = "#d95d39"
GHOST = "#ffe4b5"
WARN = "#ecc94b"
BAD = "#e53e3e"
SHADOW = "#0b0f16"

# Empirical (2026-07-08, live student preview): the AB two-column graph pane
# is SQUARE (~488x488 px). A locked non-square viewport gets extended, and
# px-fixed labels then overlap. Design world = square 22x22; verify renders
# at 488x488.
VIEW = {"xmin": -11, "xmax": 11, "ymin": -9.2, "ymax": 12.8}
TILT = 0.35


# ------------------------------------------------------------- primitives --
def num(value):
    s = f"{float(value):.3f}".rstrip("0").rstrip(".")
    return s or "0"


def expr(eid, latex=None, *, color=INK, hidden=None, **extra):
    item = {"type": "expression", "id": str(eid), "color": color}
    if latex is not None:
        item["latex"] = latex
    if hidden is not None:
        item["hidden"] = hidden
    item.update(extra)
    return item


def text_expr(eid, text):
    return {"type": "text", "id": str(eid), "text": text}


def folder(fid, title, collapsed=True):
    return {"type": "folder", "id": str(fid), "title": title,
            "collapsed": collapsed}


def poly(xs, ys):
    return ("\\operatorname{polygon}\\left("
            "\\left[" + ",".join(xs) + "\\right],"
            "\\left[" + ",".join(ys) + "\\right]\\right)")


def poly_pts(pts_latex):
    """polygon over a latex point-list expression (already a list of points)."""
    return "\\operatorname{polygon}\\left(" + pts_latex + "\\right)"


def rect(x0, y0, x1, y1):
    return poly([num(x0), num(x1), num(x1), num(x0)],
                [num(y0), num(y0), num(y1), num(y1)])


def seg(x1, y1, x2, y2):
    return poly([x1, x2], [y1, y2])


def fill_style(color, opacity="1", line_opacity="0", line_width="0"):
    return {"color": color, "fillOpacity": opacity, "fill": True,
            "lineOpacity": line_opacity, "lineWidth": line_width}


def stroke_style(color, width="2.5", opacity="1", dashed=False):
    d = {"color": color, "lineWidth": width, "lineOpacity": opacity}
    if dashed:
        d["lineStyle"] = "DASHED"
    return d


def label_point(eid, x, y, text, color=INK, size="1", orientation="above",
                condition="", show_point=False, **extra):
    """Invisible anchor point carrying a styled (interpolatable) label.

    Empirical (2026-07, API v1.12): pointOpacity:"0" makes the LABEL invisible
    too; hidden:true hides only the point glyph and keeps the label. Never use
    pointOpacity to hide label anchors."""
    item = expr(eid, f"\\left({x},{y}\\right)" + condition, color=color,
                label=text, showLabel=True, labelSize=size,
                labelOrientation=orientation, **extra)
    if not show_point:
        item["hidden"] = True
    return item


# ------------------------------------------------------------ projection ---
def scr_x(X, Z, u="u"):
    """screen x of world (X,Z) as latex."""
    return f"{num(X)}\\cos {u}+{num(Z)}\\sin {u}"


def depth(X, Z, u="u"):
    return f"{num(Z)}\\cos {u}-{num(X)}\\sin {u}"


def define_object(name, X, Z, base_y, e=TILT):
    """Return exprs defining c_{name}x / c_{name}y scene variables."""
    return [
        expr(f"def_{name}x", f"c_{{{name}x}}={scr_x(X, Z)}", hidden=True),
        expr(f"def_{name}y",
             f"c_{{{name}y}}={num(base_y)}+{num(e)}\\left({depth(X, Z)}\\right)",
             hidden=True),
    ]


def arc_pts(cx, cy, rx, ry, t0, t1, n=24, phase=""):
    """Latex list of points along an ellipse arc. cx/cy/rx/ry are latex or
    numbers; t0..t1 radians (floats); phase: extra latex added to angle."""
    cx = cx if isinstance(cx, str) else num(cx)
    cy = cy if isinstance(cy, str) else num(cy)
    rx = rx if isinstance(rx, str) else num(rx)
    ry = ry if isinstance(ry, str) else num(ry)
    t = (f"{num(t0)}+{num(t1 - t0)}\\frac{{\\left[0...{n}\\right]}}{{{n}}}"
         + (f"+{phase}" if phase else ""))
    return (f"\\left({cx}+{rx}\\cos\\left({t}\\right),"
            f"{cy}+{ry}\\sin\\left({t}\\right)\\right)")


def join_pts(*lists):
    return "\\operatorname{join}\\left(" + ",".join(lists) + "\\right)"


# -------------------------------------------------------------- cylinder ---
def cylinder(name, r, h, *, top_color, side_color, rim_color,
             e=TILT, ghost=False, cx=None, cy=None, extra_cond=""):
    """Pseudo-3D vertical cylinder anchored to scene vars c_{name}x/c_{name}y
    (or explicit cx/cy latex). Returns list of expression dicts.

    Draw order: shadow -> body -> bottom rim -> top disk -> top rim.
    """
    cx = cx or f"c_{{{name}x}}"
    cy = cy or f"c_{{{name}y}}"
    ery = num(e * r)
    out = []
    # ground shadow
    out.append(expr(f"{name}_shadow",
                    poly_pts(arc_pts(cx, f"{cy}-0.12", r * 1.06, e * r * 1.06,
                                     0, 6.2832)) + extra_cond,
                    **fill_style(SHADOW, "0.55")))
    body_opacity = "0.13" if ghost else "1"
    # body silhouette: front bottom arc (pi..2pi) + front top arc reversed
    bottom = arc_pts(cx, cy, r, e * r, 3.1416, 6.2832)
    top_rev = arc_pts(cx, f"{cy}+{num(h)}", r, e * r, 6.2832, 3.1416)
    out.append(expr(f"{name}_body", poly_pts(join_pts(bottom, top_rev)) + extra_cond,
                    **fill_style(side_color, body_opacity)))
    # bottom front rim
    out.append(expr(f"{name}_brim",
                    poly_pts(arc_pts(cx, cy, r, e * r, 3.1416, 6.2832)) + extra_cond,
                    **{**stroke_style(rim_color, "2.2",
                                      "0.8" if ghost else "1"),
                       "fill": False, "fillOpacity": "0"}))
    # top disk
    top_opacity = "0.13" if ghost else "1"
    out.append(expr(f"{name}_top",
                    poly_pts(arc_pts(cx, f"{cy}+{num(h)}", r, e * r, 0, 6.2832))
                    + extra_cond,
                    **fill_style(top_color, top_opacity)))
    # top rim stroke
    out.append(expr(f"{name}_trim",
                    poly_pts(arc_pts(cx, f"{cy}+{num(h)}", r, e * r, 0, 6.2832))
                    + extra_cond,
                    **{**stroke_style(rim_color, "2.6", "0.9" if ghost else "1",
                                      dashed=ghost),
                       "fill": False, "fillOpacity": "0"}))
    if ghost:
        # vertical side guides
        for side, sign in (("l", "-"), ("r", "+")):
            out.append(expr(f"{name}_side{side}",
                            seg(f"{cx}{sign}{num(r)}", cy,
                                f"{cx}{sign}{num(r)}", f"{cy}+{num(h)}")
                            + extra_cond,
                            **{**stroke_style(rim_color, "2.2", "0.85",
                                              dashed=True), "fill": False}))
    return out


def pizza_top(name, r, *, e=TILT, u="u", cx=None, cy_top=None,
              slices=10, pep_seed=((0.55, 0.5), (0.32, 1.9), (0.68, 2.8),
                                   (0.45, 3.9), (0.72, 4.7), (0.25, 5.5),
                                   (0.6, 6.0)), extra_cond=""):
    """Cheese + sauce ring + rotating slice lines + rotating pepperoni.
    Place over a cylinder top: cy_top latex (= c_y + h)."""
    cx = cx or f"c_{{{name}x}}"
    cy = cy_top or f"c_{{{name}ty}}"
    out = []
    out.append(expr(f"{name}_sauce",
                    poly_pts(arc_pts(cx, cy, r * 0.92, e * r * 0.92, 0, 6.2832))
                    + extra_cond, **fill_style(SAUCE, "0.85")))
    out.append(expr(f"{name}_cheese",
                    poly_pts(arc_pts(cx, cy, r * 0.85, e * r * 0.85, 0, 6.2832))
                    + extra_cond, **fill_style(CHEESE, "1")))
    for j in range(slices):
        ang = f"\\frac{{{2 * j}\\pi}}{{{slices}}}-{u}"
        out.append(expr(f"{name}_cut{j}",
                        seg(cx, cy,
                            f"{cx}+{num(r * 0.85)}\\cos\\left({ang}\\right)",
                            f"{cy}+{num(e * r * 0.85)}\\sin\\left({ang}\\right)")
                        + extra_cond,
                        **{**stroke_style(CRUST_DARK, "1.6", "0.65"),
                           "fill": False}))
    for i, (rho, t) in enumerate(pep_seed):
        px = f"{cx}+{num(rho * r)}\\cos\\left({num(t)}-{u}\\right)"
        py = f"{cy}+{num(e * rho * r)}\\sin\\left({num(t)}-{u}\\right)"
        out.append(expr(f"{name}_pep{i}",
                        poly_pts(arc_pts(px, py, 0.055 * r * 3.3 / 1.0,
                                         e * 0.055 * r * 3.3, 0, 6.2832, n=10))
                        + extra_cond,
                        **fill_style(PEP, "0.95")))
    return out


# ------------------------------------------------------------- app-look ----
def scene_base(title=None):
    """Background + optional top title. First expressions of every slide."""
    out = [expr("bg", rect(VIEW["xmin"] - 2, VIEW["ymin"] - 2,
                           VIEW["xmax"] + 2, VIEW["ymax"] + 2),
                **fill_style(BG))]
    if title:
        # Empirical (2026-07): labels are px-fixed; at the real 488px square
        # student pane one world unit is only ~22px, so keep the title small
        # (1.1) and centered 1.2 units below ymax to avoid spill/overlap.
        out.append(label_point("scene_title", "0", num(VIEW["ymax"] - 1.2),
                               title, color=TEAL_LIGHT, size="1.1",
                               orientation="center"))
    return out


def graph_settings(view=None):
    v = view or VIEW
    return {"viewport": dict(v), "showGrid": False, "showXAxis": False,
            "showYAxis": False, "xAxisNumbers": False, "yAxisNumbers": False,
            "userLockedViewport": True, "squareAxes": False}


def panel(eid, x0, y0, x1, y1, color=PANEL, opacity="0.92"):
    return expr(eid, rect(x0, y0, x1, y1), **fill_style(color, opacity))


def pill(name, x0, y0, x1, y1, color, text_latex, condition, size="1.15"):
    """Status pill: colored rounded-ish bar + dynamic label, gated by cond."""
    return [
        expr(f"{name}_bg", rect(x0, y0, x1, y1) + condition,
             **fill_style(color, "0.22")),
        expr(f"{name}_edge", rect(x0, y0, x1, y1) + condition,
             **{**stroke_style(color, "2.2", "0.9"), "fill": False,
                "fillOpacity": "0"}),
        label_point(f"{name}_txt", num((x0 + x1) / 2), num((y0 + y1) / 2),
                    text_latex, color=color, size=size, orientation="center",
                    condition=condition),
    ]


def button(name, x0, y0, x1, y1, caption, action_latex, color=TEAL,
           caption_color=INK, size="1.3", condition=""):
    """In-graph clickable button: filled rect + label; click runs action.
    clickableInfo lives on the FILL expression."""
    fill = expr(f"{name}_fill", rect(x0, y0, x1, y1) + condition,
                **fill_style(color, "0.85"))
    fill["clickableInfo"] = {"enabled": True, "latex": action_latex}
    edge = expr(f"{name}_edge", rect(x0, y0, x1, y1) + condition,
                **{**stroke_style(color, "2", "1"), "fill": False,
                   "fillOpacity": "0"})
    cap = label_point(f"{name}_cap", num((x0 + x1) / 2), num((y0 + y1) / 2),
                      caption, color=caption_color, size=size,
                      orientation="center", condition=condition)
    return [fill, edge, cap]


def orbit_dial(y=-7.6, half_width=4.0, u_max=0.7):
    """Drag-to-rotate control. Defines u_x (draggable) and u.
    Returns exprs; u = (u_max/half_width) * u_x."""
    k = num(u_max / half_width)
    hw = num(half_width)
    out = [
        expr("uxdef", "u_{x}=0",
             slider={"hardMin": True, "hardMax": True,
                     "min": f"-{hw}", "max": hw}, hidden=True),
        expr("udef", f"u={k}u_{{x}}", hidden=True),
        expr("dial_track", seg(f"-{hw}", num(y), hw, num(y)),
             **{**stroke_style(PANEL_LINE, "6", "0.9"), "fill": False}),
        expr("dial_handle", f"\\left(u_{{x}},{num(y)}\\right)",
             color=TEAL_LIGHT, pointSize="16", dragMode="X"),
        label_point("dial_hint", "0", num(y - 0.85),
                    "◀ 핸들을 좌우로 드래그해서 돌려보세요 ▶", color=MUTED,
                    size="0.9"),
    ]
    return out


def ticker(handler_latex, min_step_ms=16, playing=True):
    """Empirical (2026-07, API v1.12): a ticker with open:false does NOT run
    after setState — the ticker must be open to exist/play. The expressions
    panel is hidden in activity graphs, so open:true is invisible to
    students. Never set open back to False."""
    return {"handlerLatex": handler_latex,
            "minStepLatex": str(min_step_ms), "playing": playing,
            "open": True}


def state(expr_list, *, view=None, tick=None, seed="pizza-v2"):
    st = {"version": 11, "randomSeed": seed,
          "graph": graph_settings(view),
          "expressions": {"list": expr_list}}
    if tick:
        st["expressions"]["ticker"] = tick
    return st


def renumber(expr_list):
    """Give every expression a unique sequential id (keeps symbolic ids as
    id-prefix for debuggability)."""
    for i, item in enumerate(expr_list, 1):
        item["id"] = f"{i}_{item['id']}" if item.get("id") else str(i)
    return expr_list


def save_state(st, path):
    import json
    import pathlib
    pathlib.Path(path).write_text(
        json.dumps(st, ensure_ascii=False, indent=1))
    print(f"[state] {path} ({len(st['expressions']['list'])} exprs)")
