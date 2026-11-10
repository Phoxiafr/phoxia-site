"""Outils de construction des logos : glyphes vectorisés, profils, barre AXA alignée."""
import math
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

import os
FD = os.environ.get('FONTS_DIR', 'fonts/')
NAVY = '#0B1F4B'
RED = '#FF1721'

_fonts = {}
def font(name):
    if name not in _fonts:
        f = TTFont(FD + name + '.ttf')
        _fonts[name] = (f, f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm)
    return _fonts[name]


class FlatPen(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.polys = []; self.cur = []
    def _moveTo(self, p): self.cur = [p]
    def _lineTo(self, p): self.cur.append(p)
    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        for i in range(1, 13):
            t = i / 12; u = 1 - t
            self.cur.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                             u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        for i in range(1, 9):
            t = i / 8; u = 1 - t
            self.cur.append((u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]))
    def _closePath(self):
        if self.cur: self.polys.append(self.cur)
        self.cur = []
    _endPath = _closePath


class Glyph:
    """Glyphe en unités de la fonte, mis à l'échelle s, origine (x, baseline)."""
    def __init__(self, fname, ch):
        f, gs, cmap, upm = font(fname)
        self.fname, self.gs, self.name = fname, gs, cmap[ord(ch)]
        self.g = gs[self.name]; self.upm = upm; self.adv = self.g.width
        p = FlatPen(gs); self.g.draw(p); self.polys = p.polys
        xs = [x for pl in self.polys for x, _ in pl]; ys = [y for pl in self.polys for _, y in pl]
        self.xmin, self.xmax, self.ymin, self.ymax = min(xs), max(xs), min(ys), max(ys)

    def xs_at(self, y):
        out = []
        for pl in self.polys:
            n = len(pl)
            for i in range(n):
                (x1, y1), (x2, y2) = pl[i], pl[(i+1) % n]
                if (y1 <= y < y2) or (y2 <= y < y1):
                    out.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        return sorted(out)

    def right(self, y):
        xs = self.xs_at(y); return xs[-1] if xs else None
    def left(self, y):
        xs = self.xs_at(y); return xs[0] if xs else None

    def stem(self, y=None):
        """Épaisseur du premier fût vertical (à 30 % de la hauteur)."""
        y = y if y is not None else self.ymax * 0.3
        xs = self.xs_at(y); return xs[1] - xs[0]

    def svg(self, s, x, y, fill=NAVY, extra=None):
        """x, y : position SVG de l'origine (ligne de base). s : px par unité."""
        sp = SVGPathPen(self.gs)
        m = (s, 0, 0, -s, x, y)
        if extra: m = extra
        self.g.draw(TransformPen(sp, m))
        return f'<path fill="{fill}" d="{sp.getCommands()}"/>'


def bar_poly(x0, base, cap, w, ang, s):
    """Barre AXA : bas gauche en (x0 unités) à y=0, haut à y=cap. ang en degrés.
    Renvoie les points en unités fonte (x, y-up)."""
    c = 1 / math.tan(math.radians(ang))
    return [(x0, 0), (x0 + w, 0), (x0 + w + cap * c, cap), (x0 + cap * c, cap)]


def poly_svg(pts, s, ox, oy, fill=RED):
    d = ' '.join(f'{ox + x*s:.2f},{oy - y*s:.2f}' for x, y in pts)
    return f'<polygon fill="{fill}" points="{d}"/>'


def place_bar_after(g, gx, gap, w, ang, cap, y0=0.0, y1=None):
    """Position x0 (unités) d'une barre posée après le glyphe g (origine gx)."""
    c = 1 / math.tan(math.radians(ang)); y1 = y1 if y1 is not None else cap
    best = -1e9
    for i in range(201):
        y = y0 + (y1 - y0) * i / 200
        r = g.right(y)
        if r is not None: best = max(best, gx + r - y * c)
    return best + gap


def place_glyph_after_bar(g, x0, w, ang, cap, gap):
    """Origine x du glyphe g placé après la barre (bord droit de la barre)."""
    c = 1 / math.tan(math.radians(ang)); best = -1e9
    for i in range(201):
        y = cap * i / 200
        l = g.left(y)
        if l is not None: best = max(best, x0 + w + y * c - l)
    return best + gap


def text(fname, s_px, string, x, y, track=0.0, anchor='middle', fill=NAVY, opacity=None):
    """Texte vectorisé. track en em. Renvoie (svg, largeur px)."""
    f, gs, cmap, upm = font(fname); s = s_px / upm
    gl = []; width = 0
    for ch in string:
        if ch == ' ':
            adv = gs[cmap[32]].width * s; gl.append((None, width)); width += adv + track * s_px; continue
        g = Glyph(fname, ch); gl.append((g, width)); width += g.adv * s + track * s_px
    width -= track * s_px
    x0 = x - width / 2 if anchor == 'middle' else (x - width if anchor == 'end' else x)
    parts = [g.svg(s, x0 + off, y, fill) for g, off in gl if g]
    op = f' opacity="{opacity}"' if opacity else ''
    return f'<g{op}>' + ''.join(parts) + '</g>', width


def text_arc(fname, s_px, string, cx, cy, r, track=0.0, top=True, fill=NAVY):
    """Texte centré sur un arc (haut : lu de gauche à droite par-dessus ; bas : par-dessous)."""
    f, gs, cmap, upm = font(fname); s = s_px / upm
    items = []; total = 0
    for ch in string:
        adv = gs[cmap[ord(ch)]].width * s
        items.append((ch, total, adv)); total += adv + track * s_px
    total -= track * s_px
    out = []
    for ch, off, adv in items:
        if ch == ' ': continue
        g = Glyph(fname, ch)
        mid = off + adv / 2 - total / 2           # abscisse curviligne du centre du glyphe
        if top:
            a = -math.pi / 2 + mid / r            # angle depuis le centre
            px, py = cx + r * math.cos(a), cy + r * math.sin(a)
            rot = a + math.pi / 2
        else:
            a = math.pi / 2 - mid / r
            px, py = cx + r * math.cos(a), cy + r * math.sin(a)
            rot = a - math.pi / 2
        co, si = math.cos(rot), math.sin(rot)
        lx = -adv / 2
        m = (co * s, si * s, si * s, -co * s, px + co * lx, py + si * lx)
        out.append(g.svg(s, 0, 0, fill, extra=m))
    return ''.join(out)
