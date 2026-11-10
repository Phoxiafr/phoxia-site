"""PF Biais : caractère de titrage dessiné pour Protection Financière.

Règle unique : l'angle de la barre AXA (64°) est l'ADN du caractère.
Les extrémités des bras, la jambe gauche du A, la coupe du C et l'accent
sont taillés à cet angle ; la barre a l'épaisseur des fûts.
"""
import math
from shapely.geometry import Polygon, box, Point
from shapely.ops import unary_union
from shapely import affinity
from shapely.geometry.polygon import orient

ANG = 64.0
K = 1 / math.tan(math.radians(ANG))      # décalage horizontal par unité de hauteur
SIN = math.sin(math.radians(ANG))
H = 700                                   # hauteur de capitale
OV = 10                                   # dépassement optique des rondes

WEIGHTS = {
    'Bold':    dict(S=124, T=108, sb=46),
    'Medium':  dict(S=92,  T=80,  sb=44),
    'Regular': dict(S=62,  T=54,  sb=40),
    'Light':   dict(S=34,  T=30,  sb=36),
}


def arm(x0, y0, x1, t):
    """Bras horizontal, extrémité droite taillée en biais (parallèle à la barre)."""
    return Polygon([(x0, y0), (x1, y0), (x1 + t * K, y0 + t), (x0, y0 + t)])


def para(xb, y0, y1, w, k=K):
    """Parallélogramme oblique : bas [xb, xb+w] en y0, haut décalé de (y1-y0)*k."""
    d = (y1 - y0) * k
    return Polygon([(xb, y0), (xb + w, y0), (xb + w + d, y1), (xb + d, y1)])


def ellipse(cx, cy, rx, ry):
    return affinity.scale(Point(cx, cy).buffer(1, 128), rx, ry)


def bowl(x0, yb, yt, xr, S, T):
    """Panse en D : rectangle + demi-ellipse, contre-forme concentrique."""
    R = (yt - yb) / 2; cy = (yt + yb) / 2
    outer = unary_union([box(x0, yb, xr - R, yt), ellipse(xr - R, cy, R, R)])
    ri_x, ri_y = R - S, R - T
    inner = unary_union([box(x0 + S - 1, yb + T, xr - R, yt - T), ellipse(xr - R, cy, ri_x, ri_y)])
    return outer.difference(inner)


def glyphs(weight):
    S, T, sb = WEIGHTS[weight]['S'], WEIGHTS[weight]['T'], WEIGHTS[weight]['sb']
    g = {}
    BY = round(H * 0.40)                       # ligne des panses et bras médians
    # P
    pw = 470 + S * 0.5
    g['P'] = (unary_union([box(0, 0, S, H), bowl(0, BY - T / 2, H, pw, S, T)]), pw + sb)
    # F : bras taillés, médian calé sur le bas de la panse du P
    fw = 400 + S * 0.4
    g['F'] = (unary_union([box(0, 0, S, H), arm(0, H - T, fw, T), arm(0, BY - T / 2, fw * 0.84, T)]),
              fw + T * K * 0.5 + sb)
    # E
    ew = 410 + S * 0.4
    E = unary_union([box(0, 0, S, H), arm(0, H - T, ew, T), arm(0, BY - T / 2 + 10, ew * 0.86, T), arm(0, 0, ew * 1.03, T)])
    g['E'] = (E, ew * 1.03 + T * K * 0.6 + sb)
    # È : accent grave = petite barre inclinée dans l'autre sens
    aw = S * 0.95; ah = 150
    grave = para(ew * 0.42 + ah * K, H + 70, H + 70 + ah, aw, k=-K)
    g['È'] = (unary_union([E, grave]), g['E'][1])
    # I
    g['I'] = (box(0, 0, S, H), S + sb)
    # T : barre aux deux bouts taillés
    tw = 540 + S * 0.3
    top = para(0, H - T, H, tw, k=K)
    g['T'] = (unary_union([top, box(tw / 2 + T * K / 2 - S / 2, 0, tw / 2 + T * K / 2 + S / 2, H)]), tw + T * K + sb * 0.2)
    # N
    nw = 560 + S * 0.5
    sd = S * 1.08 / math.sin(math.atan2(H, nw - S))
    diag = Polygon([(0, H), (sd, H), (nw, 0), (nw - sd, 0)])
    g['N'] = (unary_union([box(0, 0, S, H), box(nw - S, 0, nw, H), diag]).intersection(box(0, 0, nw, H)), nw + sb)
    # A : jambe gauche à l'angle exact de la barre
    w = S / SIN; aw2 = 2 * H * K + w
    left = para(0, 0, H, w, k=K)
    right = para(aw2 - w, 0, H, w, k=-K)
    cb = box(H * 0.22 * K, 196, aw2 - H * 0.22 * K, 196 + T)
    cb = cb.intersection(unary_union([left, right]).convex_hull)
    A = unary_union([left, right, cb]).intersection(box(0, 0, aw2, H))
    g['A'] = (A, aw2 + sb * 0.2)
    # O
    ow = 720
    O = ellipse(ow / 2, H / 2, ow / 2, H / 2 + OV).difference(ellipse(ow / 2, H / 2, ow / 2 - S * 1.04, H / 2 + OV - T))
    g['O'] = (O, ow + sb)
    # C : O ouvert par une coupe parallèle à la barre
    cw = 680
    ring = ellipse(cw / 2, H / 2, cw / 2, H / 2 + OV).difference(ellipse(cw / 2, H / 2, cw / 2 - S * 1.04, H / 2 + OV - T))
    R0 = cw / 2; ccx = cw / 2; ccy = H / 2
    pt = (ccx + 0.50 * R0, ccy + 0.60 * R0); pb = (ccx + 0.50 * R0, ccy - 0.60 * R0)
    cut = Polygon([pb, pt, (pt[0] + 500 * K, pt[1] + 500), (cw + 600, pt[1] + 500),
                   (cw + 600, pb[1] - 500), (pb[0] - 500 * K, pb[1] - 500)])
    g['C'] = (ring.difference(cut), cw * 0.94 + sb)
    # R : P + jambe inclinée en sens inverse
    rleg = para(pw * 0.38, 0, BY + 10, S / SIN, k=-K)
    rleg = affinity.translate(rleg, xoff=(BY + 10) * K + 10)
    R = unary_union([g['P'][0], rleg]).intersection(box(0, 0, 2000, H))
    g['R'] = (R, max(pw, rleg.bounds[2]) + sb)
    g[' '] = (None, 260 if weight != 'Light' else 240)
    # normalisation : approche gauche commune
    out = {}
    for ch, (geo, adv) in g.items():
        if geo is None:
            out[ch] = (None, adv); continue
        minx = geo.bounds[0]
        lsb = sb * {'O': .7, 'C': .7, 'A': .25, 'T': .3}.get(ch, 1)
        rsb = sb * {'O': .7, 'C': .9, 'A': .25, 'T': .3, 'F': .6, 'E': .8, 'È': .8, 'R': .5}.get(ch, 1)
        geo = affinity.translate(geo, xoff=lsb - minx)
        out[ch] = (geo, geo.bounds[2] + rsb)
    return out, S, T


def rings(geo):
    polys = [geo] if geo.geom_type == 'Polygon' else list(geo.geoms)
    for p in polys:
        p = orient(p, sign=-1.0)               # extérieur horaire (convention TrueType)
        yield list(p.exterior.coords)[:-1]
        for i in p.interiors:
            yield list(i.coords)[:-1]


def path_d(geo, s, ox, oy):
    d = []
    for r in rings(geo):
        d.append('M' + ' L'.join(f'{ox + x * s:.2f},{oy - y * s:.2f}' for x, y in r) + 'Z')
    return ''.join(d)


def profile(geo, y, side):
    from shapely.geometry import LineString
    inter = geo.intersection(LineString([(-5000, y), (5000, y)]))
    if inter.is_empty: return None
    b = inter.bounds
    return b[2] if side == 'r' else b[0]
