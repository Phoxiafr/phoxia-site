"""Identité Protection Financière : logos dessinés avec le caractère PF Biais."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from biais import *
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely import affinity

OUT = sys.argv[1]
NAVY, RED, PAPER = '#0B1F4B', '#FF1721', '#FBFAF7'
W, Hc = 600, 400
G = {w: glyphs(w) for w in WEIGHTS}
SERIF = None


def word(weight, txt, track=0.0):
    """Assemble un mot ; renvoie (geometrie, largeur) en unités. track en unités."""
    g = G[weight][0]; x = 0; parts = []
    for ch in txt:
        geo, adv = g[ch]
        if geo is not None: parts.append(affinity.translate(geo, xoff=x))
        x += adv + track
    geo = unary_union(parts)
    return geo, geo.bounds[2] - geo.bounds[0], geo.bounds[0]


def bar(x0, w):
    return para(x0, 0, H, w)


def after(geo, gap, w):
    """x0 de la barre posée après geo, écart mini horizontal = gap."""
    best = -1e9
    for i in range(141):
        y = H * i / 140
        r = profile(geo, y, 'r')
        if r is not None: best = max(best, r - y * K)
    return best + gap


def glyph_after_bar(geo, x0, w, gap):
    best = -1e9
    for i in range(141):
        y = H * i / 140
        l = profile(geo, y, 'l')
        if l is not None: best = max(best, x0 + w + y * K - l)
    return best + gap


def monogram(weight, mode='between', gap=0.55):
    g, S, T = G[weight]
    P, F = g['P'][0], g['F'][0]
    w = S / SIN                       # barre : épaisseur perpendiculaire = fût
    P = affinity.translate(P, xoff=-P.bounds[0])
    if mode == 'between':
        x0 = after(P, gap * S, w)
        b = bar(x0, w)
        dx = glyph_after_bar(F, x0, w, gap * S)
        F = affinity.translate(F, xoff=dx)
    else:
        F = affinity.translate(F, xoff=g['P'][1] - g['P'][0].bounds[0] + S * 0.05)
        x0 = after(F, gap * S, w)
        b = bar(x0, w)
    ink = unary_union([P, F])
    return ink, b, S, T


def fut_rouge(weight, gap=0.75):
    """Le fût du F est la barre AXA."""
    g, S, T = G[weight]
    P = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0])
    w = S / SIN
    x0 = after(P, gap * S, w)
    b = bar(x0, w)
    BY = round(H * 0.40)
    fw = 400 + S * 0.4 - S                       # longueur des bras hors fût
    xt = x0 + w * 0.5 + (H - T) * K               # départ des bras dans la barre
    top = arm(xt, H - T, x0 + w + H * K + fw, T)
    ym = BY - T / 2
    mid = arm(x0 + w * 0.5 + ym * K, ym, x0 + w + (ym + T) * K + fw * 0.84 - T * K, T)
    ink = unary_union([P, top, mid])
    return ink, b, S, T


def place(geo, s, ox, oy, fill):
    return f'<path fill="{fill}" d="{path_d(geo, s, ox, oy)}"/>'


def draw(ink_geo, bar_geo, cap_px, cx, base, ink, left=None):
    allg = unary_union([ink_geo, bar_geo]); x0, _, x1, _ = allg.bounds
    s = cap_px / H; wpx = (x1 - x0) * s
    ox = (cx - wpx / 2 if left is None else left) - x0 * s
    return place(ink_geo, s, ox, base, ink) + place(bar_geo, s, ox, base, RED), wpx


def text_line(weight, txt, px, cx, base, ink, track_em=0.0, anchor='middle', op=None):
    s = px / H
    geo, wu, x0 = word(weight, txt, track=track_em * H)
    wpx = wu * s
    left = cx - wpx / 2 if anchor == 'middle' else cx
    o = f' opacity="{op}"' if op else ''
    return f'<g{o}>' + place(geo, s, left - x0 * s, base, ink) + '</g>', wpx


# Italique d'accompagnement (Cormorant), vectorisée via fontTools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib as serif


def italic(txt, px, cx, base, ink, op=None):
    svg, wd = serif.text('CormorantGaramond-500i', px, txt, cx, base, fill=ink, opacity=op)
    return svg


def doc(body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" width="{W}" height="{Hc}">'
            f'<rect width="{W}" height="{Hc}" fill="{bg}"/>{body}</svg>')


LOGOS = []
def logo(fn): LOGOS.append(fn); return fn
CX = W / 2


@logo
def signature(ink, bg):
    m, b, S, T = monogram('Medium', 'between', 0.5)
    a, wp = draw(m, b, 112, CX, 196, ink)
    t, tw = text_line('Regular', 'PROTECTION FINANCIÈRE', 15, CX, 252, ink, track_em=0.34)
    sub = italic('Assurances & Patrimoine', 19, CX, 284, ink, .8)
    return a + t + sub, 'Signature', "Le logo principal. P/F dessinés dans le caractère maison, la barre AXA entre les deux lettres avec l'épaisseur exacte des fûts et l'angle commun à tout l'alphabet."


@logo
def fut(ink, bg):
    m, b, S, T = fut_rouge('Medium')
    a, wp = draw(m, b, 112, CX, 196, ink)
    t, tw = text_line('Regular', 'PROTECTION FINANCIÈRE', 15, CX, 252, ink, track_em=0.34)
    sub = italic('Assurances & Patrimoine', 19, CX, 284, ink, .8)
    return a + t + sub, 'Fût rouge', "La barre AXA devient la colonne du F. Le monogramme le plus propriétaire : on ne peut pas le lire sans voir AXA, ni le confondre avec un autre."


@logo
def horizontal(ink, bg):
    m, b, S, T = monogram('Bold', 'between', 0.5)
    a, wp = draw(m, b, 96, 0, 248, ink, left=0)
    sep = 30
    t1, w1 = text_line('Bold', 'PROTECTION', 27, wp + sep * 2, 186, ink, track_em=0.06, anchor='start')
    t2, w2 = text_line('Regular', 'FINANCIÈRE', 27, wp + sep * 2, 226, ink, track_em=0.06 + 0.02, anchor='start')
    sub = serif.text('CormorantGaramond-500i', 15.5, 'Assurances & Patrimoine', wp + sep * 2, 250, anchor='start', fill=ink, opacity=.8)[0]
    line = f'<line x1="{wp + sep:.2f}" y1="152" x2="{wp + sep:.2f}" y2="248" stroke="{ink}" stroke-width="1.2" opacity=".5"/>'
    tot = wp + sep * 2 + max(w1, w2)
    return f'<g transform="translate({(W - tot) / 2:.2f} 0)">{a}{line}{t1}{t2}{sub}</g>', 'Horizontal', "Version en ligne pour l'en-tête du site, la vitrine, les signatures mail et les cartes de visite. PROTECTION en gras, FINANCIÈRE en regular : deux graisses du même caractère."


@logo
def icone(ink, bg):
    # bloc dont le côté droit est taillé à l'angle de la barre
    bw, bh, x, y = 210, 210, CX - 105 - 20, 95
    pts = f'{x},{y + bh} {x + bw - bh * K * 0.5 + 20},{y + bh} {x + bw + bh * K * 0.5 + 20},{y} {x},{y}'
    fill_blk = NAVY if ink == NAVY else '#FFFFFF'
    letters = PAPER if ink == NAVY else NAVY
    m, b, S, T = monogram('Bold', 'between', 0.5)
    a, wp = draw(m, b, 84, x + (bw + 20) / 2 - 2, y + bh / 2 + 42, letters)
    return f'<polygon fill="{fill_blk}" points="{pts}"/>' + a, 'Icône', "Le bloc marine est lui-même taillé à l'angle de la barre. Pour l'avatar des réseaux, l'icône d'application, le favicon et le tampon des documents."


@logo
def apres(ink, bg):
    m, b, S, T = monogram('Medium', 'after', 0.42)
    a, wp = draw(m, b, 112, CX, 196, ink)
    t, tw = text_line('Regular', 'PROTECTION FINANCIÈRE', 15, CX, 252, ink, track_em=0.34)
    sub = italic('Assurances & Patrimoine', 19, CX, 284, ink, .8)
    return a + t + sub, 'Barre après', "Même construction avec la barre après le F, comme dans le PF TEAM. Pour comparer les deux placements à dessin égal."


@logo
def construction(ink, bg):
    m, b, S, T = monogram('Medium', 'between', 0.5)
    cap = 150; s = cap / H; base = 268
    allg = unary_union([m, b]); x0, _, x1, _ = allg.bounds
    left = CX - (x1 - x0) * s / 2
    a, wp = draw(m, b, cap, CX, base, ink)
    grid = ''
    gc = RED
    for yy in (base, base - cap, base - cap * 0.40):
        grid += f'<line x1="40" y1="{yy:.2f}" x2="560" y2="{yy:.2f}" stroke="{ink}" stroke-width=".6" stroke-dasharray="3 4" opacity=".45"/>'
    # angle : prolongement de la barre et cote
    bx = left + (b.bounds[0] - x0) * s
    grid += f'<line x1="{bx - 60 * K:.2f}" y1="{base + 60:.2f}" x2="{bx + (cap + 50) * K:.2f}" y2="{base - cap - 50:.2f}" stroke="{gc}" stroke-width=".8" stroke-dasharray="4 4"/>'
    grid += f'<path d="M{bx + 46:.2f},{base} A46,46 0 0 0 {bx + 46 * math.cos(math.radians(ANG)):.2f},{base - 46 * math.sin(math.radians(ANG)):.2f}" fill="none" stroke="{gc}" stroke-width=".8"/>'
    lab = serif.text('Montserrat-500', 10, '64°', bx + 60, base - 14, anchor='start', fill=RED)[0]
    lab += serif.text('Montserrat-500', 9, 'CAPITALE', 44, base - cap - 6, anchor='start', fill=ink, opacity=.6)[0]
    lab += serif.text('Montserrat-500', 9, 'PANSE / BRAS', 44, base - cap * 0.40 - 6, anchor='start', fill=ink, opacity=.6)[0]
    lab += serif.text('Montserrat-500', 9, 'LIGNE DE BASE', 44, base - 6, anchor='start', fill=ink, opacity=.6)[0]
    lab += serif.text('Montserrat-500', 9, 'BARRE = FÛT', 556, base + 26, anchor='end', fill=ink, opacity=.6)[0]
    return grid + a + lab, 'Construction', "Les règles du dessin : une seule hauteur, une seule épaisseur, un seul angle (64°). La barre AXA, les coupes des bras et la jambe du A partagent la même inclinaison."


os.makedirs(OUT + '/svg', exist_ok=True)
meta = []
for i, fn in enumerate(LOGOS, 1):
    for mode, ink, bg in (('clair', NAVY, PAPER), ('marine', '#FFFFFF', NAVY)):
        body, name, desc = fn(ink, bg)
        open(f'{OUT}/svg/pf-{i:02d}-{mode}.svg', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n' + doc(body, bg))
    meta.append((i, name, desc))
json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok')
