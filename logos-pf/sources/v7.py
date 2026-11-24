"""Protection Financière v7 : le monogramme PF seul, en noir, barre AXA entre / après / dessous."""
import sys, os, math, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib, biais
from biais import H, K, SIN, path_d
from ident_min import after, glyph_after_bar
from shapely import affinity
from shapely.ops import unary_union

OUT = sys.argv[1]
W, Hc = 800, 600
CX = W / 2
INK, RED, BG = '#111111', '#FF1721', '#FFFFFF'
g, S, T = biais.glyphs('Bold')
P0 = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0]); F0 = g['F'][0]
WB = S / SIN


def bar_px(x0, base, h, w):
    d = h * K
    return (f'<polygon fill="{RED}" points="{x0:.2f},{base:.2f} {x0 + w:.2f},{base:.2f} '
            f'{x0 + w + d:.2f},{base - h:.2f} {x0 + d:.2f},{base - h:.2f}"/>')


def mono(mode):
    """Renvoie (lettres, x0 barre ou None) en unités de fonte."""
    if mode == 'entre':
        x0 = after(P0, 0.5 * S, WB)
        F = affinity.translate(F0, xoff=glyph_after_bar(F0, x0, WB, 0.5 * S))
    else:
        F = affinity.translate(F0, xoff=g['P'][1] - g['P'][0].bounds[0] + S * 0.1)
        x0 = after(F, 0.45 * S, WB) if mode == 'apres' else None
    return unary_union([P0, F]), x0


def logo(mode, with_tag):
    letters, x0 = mono(mode)
    right = letters.bounds[2] if x0 is None else max(letters.bounds[2], x0 + WB + H * K)
    cap = 190; s = cap / H
    tot_w = right * s
    under = cap * 0.13 + S * s * 0.9 if mode == 'dessous' else 0
    tag_h = 50 if with_tag else 0
    tot_h = cap + under + tag_h
    left = CX - tot_w / 2; base = (Hc - tot_h) / 2 + cap
    out = f'<path fill="{INK}" d="{path_d(letters, s, left, base)}"/>'
    if x0 is not None:
        out += bar_px(left + x0 * s, base, cap, WB * s)
    if mode == 'dessous':
        th = S * s * 0.9; y1 = base + cap * 0.13; y0 = y1 + th; d = th * K
        r = left + tot_w
        out += (f'<polygon fill="{RED}" points="{left:.2f},{y0:.2f} {r - d:.2f},{y0:.2f} '
                f'{r:.2f},{y1:.2f} {left + d:.2f},{y1:.2f}"/>')
    if with_tag:
        y = base + under + 46
        t, tw = lib.text('Montserrat-500', 15.5, 'ASSURANCE & PATRIMOINE', CX, y, track=0.42, fill=INK)
        out += t
    return out


MODES = [('entre', 'Barre entre'), ('apres', 'Barre après'), ('dessous', 'Barre dessous')]
os.makedirs(OUT, exist_ok=True)
meta = []
for tagk, tag in (('seul', False), ('signature', True)):
    for mk, ml in MODES:
        n = f'pf-{mk}-{tagk}'
        open(f'{OUT}/{n}.svg', 'w').write(
            f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" '
            f'width="{W}" height="{Hc}"><rect width="{W}" height="{Hc}" fill="{BG}"/>{logo(mk, tag)}</svg>')
        meta.append(n)
json.dump(meta, open(OUT + '/meta.json', 'w'))
print('ok', len(meta))
