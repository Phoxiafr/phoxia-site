"""Protection Financière v8 : lettres P et F dessinées à la main (courbes de Bézier), trois dessins originaux.

Valeurs : élégance, confiance, durée ; droit (pas d'italique) ; noir + barre AXA.
Chaque dessin a sa propre règle, et l'angle de la barre AXA (64°) revient dans les détails.
"""
import sys, os, math, json
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union

OUT = sys.argv[1]
W, Hc = 800, 600
INK, RED, BG = '#111111', '#FF1721', '#FFFFFF'
ANG = 64.0; K = 1 / math.tan(math.radians(ANG)); SIN = math.sin(math.radians(ANG))
CAP = 240.0          # hauteur de capitale, en unités de dessin (y vers le haut, ligne de base = 0)


class Shape:
    """Chemin simple : M/L/C/Z, produit le SVG et une géométrie pour mesurer les écarts."""
    def __init__(self): self.subs = []; self.cur = None
    def M(self, x, y): self.cur = [('M', (x, y))]; self.subs.append(self.cur); return self
    def L(self, x, y): self.cur.append(('L', (x, y))); return self
    def C(self, a, b, c, d, x, y): self.cur.append(('C', (a, b, c, d, x, y))); return self
    def Z(self): return self

    def polys(self):
        out = []
        for sub in self.subs:
            pts = []; last = None
            for op, a in sub:
                if op in 'ML': pts.append(a); last = a
                else:
                    p0 = last; p1, p2, p3 = (a[0], a[1]), (a[2], a[3]), (a[4], a[5])
                    for i in range(1, 21):
                        t = i / 20; u = 1 - t
                        pts.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                                    u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
                    last = p3
            out.append(Polygon(pts).buffer(0))
        return out

    def geo(self):
        """Pair-impair : les sous-chemins intérieurs creusent les extérieurs."""
        g = None
        for p in self.polys():
            g = p if g is None else g.symmetric_difference(p)
        return g

    def d(self, s, ox, oy):
        X = lambda v: f'{ox + v * s:.2f}'; Y = lambda v: f'{oy - v * s:.2f}'
        out = []
        for sub in self.subs:
            for op, a in sub:
                if op in 'ML': out.append(f'{op}{X(a[0])},{Y(a[1])}')
                else: out.append(f'C{X(a[0])},{Y(a[1])} {X(a[2])},{Y(a[3])} {X(a[4])},{Y(a[5])}')
            out.append('Z')
        return ' '.join(out)


def shift(sh, dx):
    n = Shape()
    for sub in sh.subs:
        c = []
        for op, a in sub:
            a = list(a)
            for i in range(0, len(a), 2): a[i] += dx
            c.append((op, tuple(a)))
        n.subs.append(c)
    return n


class Group(list):
    """Plusieurs formes, chacune remplie séparément (pas d'annulation où elles se chevauchent)."""
    def geo(self): return unary_union([sh.geo() for sh in self])
    def paths(self, s, ox, oy, fill):
        return ''.join(f'<path fill="{fill}" fill-rule="evenodd" d="{sh.d(s, ox, oy)}"/>' for sh in self)


def merge(*shapes): return Group(shapes)


def gshift(g, dx): return Group(shift(sh, dx) for sh in g)


def profile(geo, y, side):
    inter = geo.intersection(LineString([(-1e5, y), (1e5, y)]))
    if inter.is_empty: return None
    b = inter.bounds
    return b[2] if side == 'r' else b[0]


def bar_after(geo, gap, w):
    best = -1e9
    for i in range(121):
        y = CAP * i / 120; r = profile(geo, y, 'r')
        if r is not None: best = max(best, r - y * K)
    return best + gap


def glyph_after_bar(geo, x0, w, gap):
    best = -1e9
    for i in range(121):
        y = CAP * i / 120; l = profile(geo, y, 'l')
        if l is not None: best = max(best, x0 + w + y * K - l)
    return best + gap


# ---------------------------------------------------------------- 1. GLYPTIQUE
# Lettres « gravées dans la pierre » : fûts légèrement cintrés qui s'évasent aux extrémités,
# comme les inscriptions romaines. Permanence, solidité, transmission.
def glyptique():
    w, fl, wa = 34.0, 3.5, 2.6
    def stem(x):
        return Shape().M(x - fl, 0).C(x + wa, 70, x + wa, CAP - 70, x - fl, CAP).L(x + w + fl, CAP) \
                      .C(x + w - wa, CAP - 70, x + w - wa, 70, x + w + fl, 0).Z()
    bt, bb, br = CAP, 98.0, 186.0                 # haut, bas, bord droit de la panse
    th, tr = 13.0, 36.0                           # finesse horizontale, épaisseur à droite
    my = (bt + bb) / 2
    bowl = (Shape().M(w - 2, bt).L(98, bt).C(158, bt, br, bt - 34, br, my).C(br, bb + 34, 158, bb, 98, bb).L(w - 2, bb)
            .M(w - 2, bt - th).L(98, bt - th).C(138, bt - th, br - tr, bt - 40, br - tr, my)
            .C(br - tr, bb + 40, 138, bb + th, 98, bb + th).L(w - 2, bb + th))
    P = merge(stem(0), bowl)
    a = 17.0
    def arm(x0, top, L):
        # bord supérieur droit, bord inférieur qui s'évase vers la droite, extrémité taillée à l'angle AXA
        e = a + 4
        return (Shape().M(x0, top).L(x0 + L + e * K, top).L(x0 + L, top - e)
                .C(x0 + L * 0.6, top - a - 1, x0 + 30, top - a, x0, top - a).Z())
    F = merge(stem(0), arm(w - 2, CAP, 128), arm(w - 2, bb + a, 104))
    return P, F, w, 'Glyptique', ("Des fûts légèrement cintrés qui s'évasent aux extrémités, comme une inscription "
                                 "gravée dans la pierre : la permanence, ce qu'on transmet. Les bras du F sont taillés à l'angle de la barre AXA.")


# ---------------------------------------------------------------- 2. COUTURE
# Didone dessinée sur mesure : pleins puissants, déliés très fins, empattements filiformes.
# Les becs du F sont taillés à l'angle de la barre AXA.
def couture():
    w, hs, sw = 40.0, 3.0, 24.0                   # fût, épaisseur d'empattement, débord d'empattement
    def stem(x, top_serif=True):
        s = Shape().M(x - sw, 0).L(x + w + sw, 0).L(x + w + sw, hs).L(x + w, hs).L(x + w, CAP - hs) \
                   .L(x + w + (sw if top_serif else 0), CAP - hs).L(x + w + (sw if top_serif else 0), CAP) \
                   .L(x - sw, CAP).L(x - sw, CAP - hs).L(x, CAP - hs).L(x, hs).L(x - sw, hs).Z()
        return s
    bt, bb, br = CAP, 104.0, 192.0
    th, tr = 4.0, 46.0
    my = (bt + bb) / 2 + 2
    bowl = (Shape().M(w - 1, bt).L(92, bt).C(160, bt, br, bt - 30, br, my).C(br, bb + 28, 160, bb, 92, bb).L(w - 1, bb)
            .M(w - 1, bt - th).L(92, bt - th).C(130, bt - th, br - tr, bt - 26, br - tr, my)
            .C(br - tr, bb + 30, 130, bb + th, 92, bb + th).L(w - 1, bb + th))
    P = merge(stem(0, top_serif=False), bowl)
    # F : bras filiformes terminés par un bec descendant, taillé à l'angle AXA
    def arm(y_top, L, beak, t):
        x0 = w - 1; xe = x0 + L
        return (Shape().M(x0, y_top).L(xe, y_top).L(xe, y_top - beak).L(xe - 6, y_top - beak)
                .L(xe - 6 - (beak - t) * K * 0.55, y_top - t).L(x0, y_top - t).Z())
    def mid(y_c, L, beak, t):
        x0 = w - 1; xe = x0 + L
        return (Shape().M(x0, y_c + t / 2).L(xe - 8, y_c + t / 2).L(xe - 3, y_c + beak).L(xe, y_c + beak)
                .L(xe, y_c - beak).L(xe - 3, y_c - beak).L(xe - 8, y_c - t / 2).L(x0, y_c - t / 2).Z())
    F = merge(stem(0, top_serif=False), arm(CAP, 150, 50, 4.0), mid(bb + 2, 108, 17, 4.0))
    return P, F, w, 'Couture', ("Une Didone dessinée sur mesure : pleins puissants, déliés comme un fil, empattements filiformes. "
                               "Le registre des grandes maisons ; les becs du F reprennent l'angle de la barre AXA.")


# ---------------------------------------------------------------- 3. L'ÉCHO
# Capitales géométriques pleines ; la contreforme du P est une petite barre inclinée
# à l'angle AXA : la barre rouge a son écho, en creux, dans la lettre.
def echo():
    w = 52.0
    bt, bb = CAP, 92.0; R = (bt - bb) / 2; my = (bt + bb) / 2
    bx = 112.0                                     # début de l'arrondi
    P = Shape().M(0, 0).L(w, 0).L(w, bb).L(bx, bb).C(bx + R * 0.56, bb, bx + R, my - R * 0.44, bx + R, my) \
               .C(bx + R, my + R * 0.44, bx + R * 0.56, bt, bx, bt).L(0, bt).Z()
    # contreforme : parallélogramme à l'angle AXA, centré dans la panse
    ch, cw = 86.0, 30.0
    cx = (w + bx + R) / 2 + 2 - (cw + ch * K) / 2
    cy = my - ch / 2
    P.M(cx, cy).L(cx + cw, cy).L(cx + cw + ch * K, cy + ch).L(cx + ch * K, cy + ch).Z()
    a = 44.0
    F = (Shape().M(0, 0).L(w, 0).L(w, bb).L(122, bb).L(122 + a * K, bb + a).L(w, bb + a).L(w, bt - a)
         .L(150, bt - a).L(150 + a * K, bt).L(0, bt).Z())
    P, F = Group([P]), Group([F])
    return P, F, w, "L'Écho", ("Capitales pleines et géométriques ; le creux du P est une petite barre inclinée à l'angle AXA. "
                              "La barre rouge a son écho, en négatif, dans la lettre : un détail qu'on découvre, puis qu'on n'oublie plus.")


def build(fn, mode):
    P, F, stem_w, name, desc = fn()
    gP = P.geo(); gF = F.geo()
    wb = stem_w * 0.95 / SIN
    if mode == 'entre':
        x0 = bar_after(gP, stem_w * 0.62, wb)
        dx = glyph_after_bar(gF, x0, wb, stem_w * 0.62)
    else:
        best = -1e9
        for i in range(121):
            y = CAP * i / 120; r = profile(gP, y, 'r'); l = profile(gF, y, 'l')
            if r is not None and l is not None: best = max(best, r - l)
        dx = best + stem_w * 1.05
        x0 = bar_after(gshift(F, dx).geo(), stem_w * 0.55, wb)
    Fs = gshift(F, dx)
    xmin = min(gP.bounds[0], 0)
    xmax = max(Fs.geo().bounds[2], x0 + wb + CAP * K)
    s = 1.0; base = Hc / 2 + CAP / 2 - 10
    ox = W / 2 - (xmax - xmin) * s / 2 - xmin * s
    bar = (f'{ox + x0:.2f},{base:.2f} {ox + x0 + wb:.2f},{base:.2f} {ox + x0 + wb + CAP * K:.2f},{base - CAP:.2f} '
           f'{ox + x0 + CAP * K:.2f},{base - CAP:.2f}')
    svg = (P.paths(s, ox, base, INK) + Fs.paths(s, ox, base, INK) +
           f'<polygon fill="{RED}" points="{bar}"/>')
    return svg, name, desc


os.makedirs(OUT, exist_ok=True)
meta = []
for i, fn in enumerate((glyptique, couture, echo), 1):
    for mode in ('entre', 'apres'):
        svg, name, desc = build(fn, mode)
        open(f'{OUT}/pf-{i}-{mode}.svg', 'w').write(
            f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" '
            f'width="{W}" height="{Hc}"><rect width="{W}" height="{Hc}" fill="{BG}"/>{svg}</svg>')
        meta.append((f'pf-{i}-{mode}', name, desc))
json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok', len(meta))
