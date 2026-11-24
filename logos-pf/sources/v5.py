"""Protection Financière v5 : 4 caractères à courbes travaillées x 3 placements de la barre AXA."""
import sys, os, math, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib
from lib import Glyph, place_bar_after, place_glyph_after_bar
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = sys.argv[1]
W, Hc = 800, 600
CX = W / 2
ANG = 64.0
K = 1 / math.tan(math.radians(ANG)); SIN = math.sin(math.radians(ANG))
RED = '#FF1721'
THEMES = {'axa': ('#FFFFFF', '#00008F', RED), 'negatif': ('#00008F', '#FFFFFF', RED), 'noir': ('#FFFFFF', '#111111', RED)}

# caractère du monogramme, du nom, de la signature ; écarts et épaisseur de barre
FONTS = [
    ('gloock',   'Gloock',    'Gloock-400',           'Gloock-400',            'CormorantGaramond-500i', 0.55, 0.85),
    ('playfair', 'Playfair',  'PlayfairDisplay-700i', 'PlayfairDisplay-600',   'PlayfairDisplay-600i',   0.30, 0.85),
    ('fraunces', 'Fraunces',  'Fraunces-600',         'Fraunces-600',          'CormorantGaramond-500i', 0.36, 0.80),
    ('dmserif',  'DM Serif',  'DMSerifDisplay-400',   'DMSerifDisplay-400',    'DMSerifDisplay-400i',    0.40, 0.85),
]
MODES = [('entre', 'Barre entre P et F'), ('apres', 'Barre après PF'), ('dessous', 'Barre sous PF')]


def gd(g, s, x, y):
    sp = SVGPathPen(g.gs); g.g.draw(TransformPen(sp, (s, 0, 0, -s, x, y))); return sp.getCommands()


def bar_pts(x0, base, h, w):
    d = h * K
    return f'{x0:.2f},{base:.2f} {x0 + w:.2f},{base:.2f} {x0 + w + d:.2f},{base - h:.2f} {x0 + d:.2f},{base - h:.2f}'


def monogram(fname, mode, cap_px, cx, base, gap, k, ink, bar):
    P, F = Glyph(fname, 'P'), Glyph(fname, 'F')
    cap = P.ymax; st = P.stem(); s = cap_px / cap; w = st * k / SIN
    if mode == 'entre':
        x0 = place_bar_after(P, 0, gap * st, w, ANG, cap)
        fx = place_glyph_after_bar(F, x0, w, ANG, cap, gap * st)
        xmax = max(fx + F.xmax, x0 + w + cap * K)
    else:
        # P et F rapprochés au plus juste : écart mini mesuré entre les profils
        best = -1e9
        for i in range(101):
            y = cap * i / 100; r = P.right(y); l = F.left(y)
            if r is not None and l is not None: best = max(best, r - l)
        fx = best + st * 0.55
        xmax = fx + F.xmax
        if mode == 'apres':
            x0 = place_bar_after(F, fx, gap * st, w, ANG, cap)
            xmax = max(xmax, x0 + w + cap * K)
    xmin = P.xmin
    ox = cx - (xmax - xmin) * s / 2 - xmin * s
    out = f'<path fill="{ink}" d="{gd(P, s, ox, base)}{gd(F, s, ox + fx * s, base)}"/>'
    left, right = ox + xmin * s, ox + xmax * s
    if mode in ('entre', 'apres'):
        out += f'<polygon fill="{bar}" points="{bar_pts(ox + x0 * s, base, cap * s, w * s)}"/>'
        below = base
    else:
        # barre couchée : parallélogramme horizontal, extrémités taillées à l'angle AXA
        th = st * k * s * 0.95; y1 = base + cap_px * 0.16; y0 = y1 + th; d = th * K
        out += (f'<polygon fill="{bar}" points="{left:.2f},{y0:.2f} {right - d:.2f},{y0:.2f} '
                f'{right:.2f},{y1:.2f} {left + d:.2f},{y1:.2f}"/>')
        below = y0
    return out, left, right, below


def logo(font, mode, ink, bar):
    key, label, fmono, fname, ftag, gap, k = font
    cap_px = 168
    body, l, r, below = monogram(fmono, mode, cap_px, CX, 0, gap, k, ink, bar)
    name, nw = lib.text(fname, 25, 'PROTECTION FINANCIÈRE', CX, below + 64, track=0.2, fill=ink)
    tag, tw = lib.text(ftag, 24, 'Assurance & Patrimoine', CX, below + 104, fill=ink, opacity=.9)
    y = below + 97.5
    rules = ''.join(f'<line x1="{a:.2f}" y1="{y}" x2="{b:.2f}" y2="{y}" stroke="{ink}" stroke-width=".9"/>'
                    for a, b in ((CX - nw / 2, CX - tw / 2 - 16), (CX + tw / 2 + 16, CX + nw / 2)))
    total_h = cap_px + below + 104
    top = (Hc - total_h) / 2 + cap_px
    return f'<g transform="translate(0 {top:.2f})">{body}{name}{rules}{tag}</g>'


os.makedirs(OUT, exist_ok=True)
meta = []
for font in FONTS:
    for mk, ml in MODES:
        for th, (bg, ink, bar) in THEMES.items():
            svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" '
                   f'width="{W}" height="{Hc}"><rect width="{W}" height="{Hc}" fill="{bg}"/>{logo(font, mk, ink, bar)}</svg>')
            open(f'{OUT}/pf-{font[0]}-{mk}-{th}.svg', 'w').write(svg)
        meta.append((font[0], font[1], mk, ml))
json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok', len(meta))
