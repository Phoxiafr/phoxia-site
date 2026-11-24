"""Protection Financière v6 : identité de marque en noir, caractère maison PF Biais + barre AXA."""
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
G = {w: biais.glyphs(w) for w in ('Bold', 'Medium', 'Regular')}
TAG = 'ASSURANCE & PATRIMOINE'


def word(weight, txt, track=0.0):
    g = G[weight][0]; x = 0; parts = []
    for ch in txt:
        geo, adv = g[ch]
        if geo is not None: parts.append(affinity.translate(geo, xoff=x))
        x += adv + track
    geo = unary_union(parts)
    return affinity.translate(geo, xoff=-geo.bounds[0])


def width(geo): return geo.bounds[2] - geo.bounds[0]


def bar_px(x0, base, h, w, fill=RED):
    d = h * K
    return (f'<polygon fill="{fill}" points="{x0:.2f},{base:.2f} {x0 + w:.2f},{base:.2f} '
            f'{x0 + w + d:.2f},{base - h:.2f} {x0 + d:.2f},{base - h:.2f}"/>')


def draw(geo, s, x, base, fill=INK):
    return f'<path fill="{fill}" d="{path_d(geo, s, x, base)}"/>'


def tag(x, y, size, anchor='middle', track=0.32):
    return lib.text('Montserrat-500', size, TAG, x, y, track=track, anchor=anchor, fill=INK)


LOGOS = []
def logo(fn): LOGOS.append(fn); return fn


@logo
def signature_point(_):
    """Comme le point de Deloitte : le nom, la barre AXA en ponctuation finale."""
    S = G['Bold'][1]
    geo = word('Bold', 'PROTECTION FINANCIÈRE', track=10)
    w = S / SIN; x0 = after(geo, 0.6 * S, w)
    cap = 38; s = cap / H
    tot = (x0 + w + H * K) * s
    left = CX - tot / 2; base = 300
    out = draw(geo, s, left, base) + bar_px(left + x0 * s, base, cap, w * s)
    t, tw = tag(left, base + 40, 11.5, 'start', 0.42)
    return out + t, 'La Ponctuation', ("Le nom en capitales maison, et la barre AXA en ponctuation finale, comme le point de Deloitte. "
                                     "Une signature qu'on reconnaît en un coup d'œil, sur une plaque, un mail ou une façade.")


@logo
def bloc(_):
    """Deux lignes justifiées, la barre AXA court sur toute la hauteur du bloc."""
    S = G['Bold'][1]
    l1 = word('Bold', 'PROTECTION'); l2 = word('Bold', 'FINANCIÈRE')
    target = max(width(l1), width(l2))
    def justify(txt, geo):
        n = len(txt) - 1
        return word('Bold', txt, track=(target - width(geo)) / n)
    l1, l2 = justify('PROTECTION', l1), justify('FINANCIÈRE', l2)
    cap = 64; s = cap / H; lead = cap * 0.42
    blockh = cap * 2 + lead
    barw = S / SIN * s * 1.5
    gap = S * s * 0.9
    tot = target * s + gap + barw + blockh * K
    left = CX - tot / 2; top = 300 - blockh / 2 - 14
    b1 = top + cap; b2 = b1 + lead + cap
    out = draw(l1, s, left, b1) + draw(l2, s, left, b2)
    # la barre part de la ligne de base du bas et monte jusqu'au haut des capitales du haut,
    # posée contre le bloc au plus près des deux lignes
    out += bar_px(left + target * s + gap, b2, blockh, barw)
    t, _ = tag(left, b2 + 38, 11.5, 'start', 0.38)
    return out + t, 'Le Bloc', ("Le nom sur deux lignes calées au millimètre, et une barre AXA qui tient tout le bloc. "
                               "Compact, solide, institutionnel : la carrure d'un grand cabinet.")


@logo
def trait_union(_):
    """La barre AXA remplace l'espace entre les deux mots."""
    S = G['Bold'][1]
    a = word('Bold', 'PROTECTION', track=8); b = word('Bold', 'FINANCIÈRE', track=8)
    w = S / SIN
    x0 = after(a, 0.55 * S, w)
    dx = glyph_after_bar(b, x0, w, 0.55 * S)
    b = affinity.translate(b, xoff=dx)
    cap = 38; s = cap / H
    tot = (b.bounds[2]) * s
    left = CX - tot / 2; base = 296
    out = draw(unary_union([a, b]), s, left, base) + bar_px(left + x0 * s, base, cap, w * s)
    t, _ = tag(CX, base + 44, 11.5, 'middle', 0.45)
    return out + t, 'Le Trait d\'union', ("La barre AXA prend la place de l'espace entre les deux mots : "
                                         "PROTECTION/FINANCIÈRE. Le lien entre le cabinet et AXA, dit en un seul geste.")


@logo
def monogramme(_):
    """Grand monogramme P/F, nom en dessous : l'emblème pour les petits formats et les réseaux."""
    g, S, T = G['Bold']
    P = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0]); F = g['F'][0]
    w = S / SIN; x0 = after(P, 0.5 * S, w)
    F = affinity.translate(F, xoff=glyph_after_bar(F, x0, w, 0.5 * S))
    cap = 150; s = cap / H
    tot = max(F.bounds[2], x0 + w + H * K) * s
    left = CX - tot / 2; base = 268
    out = draw(unary_union([P, F]), s, left, base) + bar_px(left + x0 * s, base, cap, w * s)
    name = word('Medium', 'PROTECTION FINANCIÈRE', track=60)
    ns = 22 / H; nw = width(name) * ns
    out += draw(name, ns, CX - nw / 2, base + 64)
    t, _ = tag(CX, base + 98, 11, 'middle', 0.5)
    return out + t, 'Le Monogramme', ("P/F en capitales maison très affirmées, la barre au centre. "
                                    "L'emblème pour l'avatar, l'application, le tampon ; le nom complet l'accompagne.")


@logo
def horizontal(_):
    """Emblème + nom, comme les en-têtes des grands cabinets."""
    g, S, T = G['Bold']
    P = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0]); F = g['F'][0]
    w = S / SIN; x0 = after(P, 0.5 * S, w)
    F = affinity.translate(F, xoff=glyph_after_bar(F, x0, w, 0.5 * S))
    l1 = word('Bold', 'PROTECTION', track=6); l2 = word('Regular', 'FINANCIÈRE', track=6)
    cap_t = 30; ts = cap_t / H; lead = 14
    cap_m = cap_t * 2 + lead; s = cap_m / H
    mono_w = max(F.bounds[2], x0 + w + H * K) * s
    sep = 34
    tot = mono_w + sep * 2 + max(width(l1), width(l2)) * ts
    left = CX - tot / 2; base = 300 + cap_m / 2
    out = draw(unary_union([P, F]), s, left, base) + bar_px(left + x0 * s, base, cap_m, w * s)
    xr = left + mono_w + sep
    out += f'<rect x="{xr:.2f}" y="{base - cap_m:.2f}" width="1.4" height="{cap_m:.2f}" fill="{INK}"/>'
    tx = xr + sep
    out += draw(l1, ts, tx, base - cap_m + cap_t) + draw(l2, ts, tx, base)
    t, _ = tag(left, base + 42, 11, 'start', 0.42)
    return out + t, "L'En-tête", ("Emblème P/F à gauche, nom à droite : PROTECTION en gras, FINANCIÈRE en regular, "
                                 "deux graisses du même caractère. Pour le papier à en-tête, le site, la signature mail.")


os.makedirs(OUT, exist_ok=True)
meta = []
for i, fn in enumerate(LOGOS, 1):
    body, name, desc = fn(None)
    open(f'{OUT}/pf-v6-{i}.svg', 'w').write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" '
        f'width="{W}" height="{Hc}"><rect width="{W}" height="{Hc}" fill="{BG}"/>{body}</svg>')
    meta.append((i, name, desc))
json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok', len(meta))
