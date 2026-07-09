#!/usr/bin/env python3
"""3D line-pair scene extension over the pseudo-3D engine.

True 3D point projection (oblique, y-up world like Three.js):
  sx = x cos u + z sin u
  sy = Y0 + y + e * (z cos u - x sin u)
World budget: x,z in [-7, 7], y in [0, 6]  ->  sx in [-9.9, 9.9],
sy in [-8, 5.2]. Screen band above y~5.5 stays free for title/quiz UI.
"""
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).parent))
from pseudo3d_engine import *  # noqa: F401,F403 — palette, expr, seg, label_point, ...

Y0 = -4.5          # screen y of world floor origin
E3 = 0.35          # depth tilt

# Source-site palette (Three.js hex)
L_RED1, L_RED2 = "#ef4444", "#f87171"
L_ORG1, L_ORG2 = "#fb923c", "#fcd34d"
L_GRN1, L_GRN2 = "#10b981", "#34d399"
L_PUR1, L_PUR2 = "#8b5cf6", "#a78bfa"
PLANE_GREEN = "#047857"
MARK_YELLOW = "#fde047"
GRID_LINE = "#4b5563"


def p3x(x, z, u="u"):
    """screen x latex of world (x, ·, z); x/z latex strings or numbers."""
    x = x if isinstance(x, str) else num(x)
    z = z if isinstance(z, str) else num(z)
    return f"\\left({x}\\right)\\cos {u}+\\left({z}\\right)\\sin {u}"


def p3y(x, y, z, u="u"):
    x = x if isinstance(x, str) else num(x)
    y = y if isinstance(y, str) else num(y)
    z = z if isinstance(z, str) else num(z)
    return (f"{num(Y0)}+\\left({y}\\right)+{num(E3)}"
            f"\\left(\\left({z}\\right)\\cos {u}-\\left({x}\\right)\\sin {u}\\right)")


def line3d(name, p1, p2, color, width="6", opacity="1", dashed=False,
           extra_cond=""):
    """Solid 3D segment from p1=(x,y,z) to p2. Returns [stroke, cap1, cap2]."""
    (x1, y1, z1), (x2, y2, z2) = p1, p2
    stroke = expr(f"{name}_ln",
                  seg(p3x(x1, z1), p3y(x1, y1, z1),
                      p3x(x2, z2), p3y(x2, y2, z2)) + extra_cond,
                  **{**stroke_style(color, width, opacity, dashed=dashed),
                     "fill": False, "fillOpacity": "0"})
    caps = [expr(f"{name}_c{i}",
                 f"\\left({p3x(x, z)},{p3y(x, y, z)}\\right)" + extra_cond,
                 color=color, pointSize=str(round(float(width) * 1.4, 1)),
                 pointOpacity=opacity)
            for i, (x, y, z) in enumerate((p1, p2))]
    return [stroke] + caps


def shadow3d(name, p1, p2, extra_cond=""):
    """Floor (y=0) shadow of a segment — key 3D depth cue."""
    (x1, _, z1), (x2, _, z2) = p1, p2
    return [expr(f"{name}_sh",
                 seg(p3x(x1, z1), p3y(x1, 0, z1),
                     p3x(x2, z2), p3y(x2, 0, z2)) + extra_cond,
                 **{**stroke_style(SHADOW, "3.5", "0.5"),
                    "fill": False, "fillOpacity": "0"})]


def grid_floor(half=7, step=2):
    """Floor grid via list broadcast — 2 expressions total.
    K = [-half, -half+step, ..., half]."""
    n = int(2 * half / step)
    klist = f"\\left[{num(-half)}...{num(half)}...{n + 1}\\right]"
    # Desmos range list with count is [a...b] only; safer: explicit list
    ks = ",".join(num(-half + i * step) for i in range(n + 1))
    klist = f"\\left[{ks}\\right]"
    out = [expr("gridK", f"K_{{g}}={klist}", hidden=True)]
    # lines parallel to z-axis (x = k): endpoints (k, 0, ±half)
    out.append(expr("grid_x",
                    "\\operatorname{polygon}\\left("
                    f"\\left({p3x('K_{g}', -half)},{p3y('K_{g}', 0, -half)}\\right),"
                    f"\\left({p3x('K_{g}', half)},{p3y('K_{g}', 0, half)}\\right)"
                    "\\right)",
                    **{**stroke_style(GRID_LINE, "1", "0.35"),
                       "fill": False, "fillOpacity": "0"}))
    out.append(expr("grid_z",
                    "\\operatorname{polygon}\\left("
                    f"\\left({p3x(-half, 'K_{g}')},{p3y(-half, 0, 'K_{g}')}\\right),"
                    f"\\left({p3x(half, 'K_{g}')},{p3y(half, 0, 'K_{g}')}\\right)"
                    "\\right)",
                    **{**stroke_style(GRID_LINE, "1", "0.35"),
                       "fill": False, "fillOpacity": "0"}))
    return out


def plane_quad(name, corners, cond, color=PLANE_GREEN, opacity="0.32"):
    """Translucent plane through 4 world corners [(x,y,z)x4], gated by cond
    (e.g. '\\left\\{p_{v}=1\\right\\}')."""
    xs = ",".join(p3x(x, z) for x, y, z in corners)
    ys = ",".join(p3y(x, y, z) for x, y, z in corners)
    return [
        expr(f"{name}_fill",
             "\\operatorname{polygon}\\left("
             f"\\left[{xs}\\right],\\left[{ys}\\right]\\right)" + cond,
             **fill_style(color, opacity)),
        expr(f"{name}_edge",
             "\\operatorname{polygon}\\left("
             f"\\left[{xs}\\right],\\left[{ys}\\right]\\right)" + cond,
             **{**stroke_style(color, "2", "0.8"), "fill": False,
                "fillOpacity": "0"}),
    ]


def pulse_marker(name, p, cond, color=MARK_YELLOW):
    """Toggleable intersection marker with ticker pulse ring.
    Requires ticker time variable T in the state."""
    x, y, z = p
    return [
        expr(f"{name}_pt", f"\\left({p3x(x, z)},{p3y(x, y, z)}\\right)" + cond,
             color=color, pointSize="11"),
        expr(f"{name}_ring",
             poly_pts(arc_pts(p3x(x, z), p3y(x, y, z),
                              "0.45+0.18\\sin\\left(4T\\right)",
                              f"{num(E3)}\\left(0.45+0.18\\sin\\left(4T\\right)\\right)",
                              0, 6.2832, n=20)) + cond,
             **{**stroke_style(color, "2.2", "0.85"), "fill": False,
                "fillOpacity": "0"}),
    ]
