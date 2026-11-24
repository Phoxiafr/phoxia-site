"""Cabinet Protection Financière : 4 concepts de logo, sobres (couleurs AXA ou noir et blanc)."""
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
K = 1 / math.tan(math.radians(ANG))
SIN = math.sin(math.radians(ANG))
RED = '#FF1721'
THEMES = {   # nom : (fond, encre, barre)
    'axa':      ('#FFFFFF', '#00008F', RED),
    'negatif':  ('#00008F', '#FFFFFF', RED),
    'noir':     ('#FFFFFF', '#111111', RED),
    'mono':     ('#FFFFFF', '#111111', '#111111'),
}
TAG = 'ASSURANCE  ·  ÉPARGNE  ·  RETRAITE'


def gd(g, s, x, y):
    sp = SVGPathPen(g.gs); g.g.draw(TransformPen(sp, (s, 0, 0, -s, x, y))); return sp.getCommands()


def bar_pts(x0, base, h, w):
    """Barre AXA en px : bas gauche (x0, base), hauteur h, largeur horizontale w."""
    d = h * K
    return f'{x0:.2f},{base:.2f} {x0 + w:.2f},{base:.2f} {x0 + w + d:.2f},{base - h:.2f} {x0 + d:.2f},{base - h:.2f}'


def mono_layout(fname, cap_px, cx, base, gap=0.5, k=1.0, mode='between'):
    """Positions px de P, barre, F (lettres de fonte), barre = fût, alignée capitale/ligne de base."""
    P, F = Glyph(fname, 'P'), Glyph(fname, 'F')
    cap = P.ymax; st = P.stem(); s = cap_px / cap
    w = st * k / SIN
    if mode == 'between':
        x0 = place_bar_after(P, 0, gap * st, w, ANG, cap)
        fx = place_glyph_after_bar(F, x0, w, ANG, cap, gap * st)
    else:
        fx = P.adv - P.xmin * 0 + 0.05 * st
        x0 = place_bar_after(F, fx, gap * st, w, ANG, cap)
    xmin = P.xmin; xmax = max(fx + F.xmax, x0 + w + cap * K)
    ox = cx - (xmax - xmin) * s / 2 - xmin * s
    return dict(P=P, F=F, s=s, ox=ox, fx=fx, x0=x0, w=w, cap=cap, base=base,
                left=ox + xmin * s, right=ox + xmax * s, st=st)


def bar_svg(L, color):
    s = L['s']
    return f'<polygon fill="{color}" points="{bar_pts(L["ox"] + L["x0"] * s, L["base"], L["cap"] * s, L["w"] * s)}"/>'


def letters_d(L):
    s = L['s']
    return gd(L['P'], s, L['ox'], L['base']) + gd(L['F'], s, L['ox'] + L['fx'] * s, L['base'])


def t(fname, px, txt, x, y, ink, track=0.0, anchor='middle', op=None):
    return lib.text(fname, px, txt, x, y, track=track, anchor=anchor, fill=ink, opacity=op)


def rule(x1, x2, y, ink, w=1, op=None):
    o = f' opacity="{op}"' if op else ''
    return f'<line x1="{x1:.2f}" y1="{y}" x2="{x2:.2f}" y2="{y}" stroke="{ink}" stroke-width="{w}"{o}/>'


CONCEPTS = []
def concept(fn): CONCEPTS.append(fn); return fn


# 1. GRAVURE : lettres gravées comme un billet de banque ou un titre de valeur
@concept
def gravure(bg, ink, bar, uid):
    L = mono_layout('BodoniModa-700', 190, CX, 300, gap=0.32, k=0.92)
    d = letters_d(L)
    top, bot = L['base'] - L['cap'] * L['s'] - 2, L['base'] + 2
    lines = ''.join(f'<rect x="{L["left"] - 4:.1f}" y="{y:.2f}" width="{L["right"] - L["left"] + 8:.1f}" height="1.35" fill="{ink}"/>'
                    for y in [top + i * 3.1 for i in range(int((bot - top) / 3.1) + 1)])
    body = (f'<defs><clipPath id="c{uid}"><path d="{d}"/></clipPath></defs>'
            f'<g clip-path="url(#c{uid})">{lines}</g>'
            f'<path d="{d}" fill="none" stroke="{ink}" stroke-width="1.6"/>' + bar_svg(L, bar))
    body += t('Montserrat-500', 11, 'CABINET', CX, 352, ink, track=0.6)[0]
    body += t('BodoniModa-500', 34, 'PROTECTION FINANCIÈRE', CX, 398, ink, track=0.10)[0]
    tg, tw = t('Montserrat-400', 10.5, TAG, CX, 432, ink, track=0.32, op=.85)
    body += tg
    return body, 'Gravure', ("Les lettres sont gravées de fines lignes, comme un billet de banque ou un titre de valeur : "
                             "la référence universelle de la confiance financière. La barre AXA, pleine, ressort comme un sceau.")


# 2. LE LIEN : un seul trait continu relie le P au F, la barre AXA le traverse
@concept
def lien(bg, ink, bar, uid):
    h, sw = 200, 9                          # hauteur de capitale, épaisseur du trait
    base = 300; top = base - h; mid = base - h * 0.44
    R = (mid - top) / 2
    # géométrie : P (fût + panse), trait médian qui file sous la barre et devient le bras du F
    px = 0; bx = 118                          # fin de la partie droite de la panse
    x0b = bx + R + 26                         # pied de la barre
    bw = sw * 1.25 / SIN
    fx = x0b + bw + h * K + 22                # fût du F, juste après le haut de la barre
    farm = fx + 118; fmid = fx + 96
    total = farm + sw * K
    ox = CX - total / 2
    X = lambda v: ox + v
    # P fermé, puis une seule ligne médiane qui part du fût du P, ferme sa panse,
    # passe sous la barre AXA et devient le bras médian du F
    p = (f'M{X(px + sw / 2):.2f},{base} V{top + sw / 2:.2f} H{X(bx):.2f} '
         f'A{R - sw / 2:.2f},{R - sw / 2:.2f} 0 0 1 {X(bx):.2f},{mid - sw / 2:.2f}')
    link = f'M{X(px + sw / 2):.2f},{mid - sw / 2:.2f} H{X(fmid):.2f}'
    f = f'M{X(fx + sw / 2):.2f},{base} V{top + sw / 2:.2f} H{X(farm):.2f}'
    body = (f'<path d="{p}" fill="none" stroke="{ink}" stroke-width="{sw}" stroke-linejoin="miter"/>'
            f'<path d="{link}" fill="none" stroke="{ink}" stroke-width="{sw}"/>'
            f'<path d="{f}" fill="none" stroke="{ink}" stroke-width="{sw}" stroke-linejoin="miter"/>')
    body += f'<polygon fill="{bar}" points="{bar_pts(X(x0b), base, h, bw)}"/>'
    body += t('CormorantGaramond-600', 36, 'Protection Financière', CX, 372, ink, track=0.02)[0]
    body += t('Montserrat-400', 10.5, TAG, CX, 404, ink, track=0.36, op=.85)[0]
    return body, 'Le Lien', ("Un seul trait relie le P au F et traverse la barre AXA : l'accompagnement continu d'une vie, "
                             "de l'assurance à l'épargne jusqu'à la retraite. Fin, aérien, très haut de gamme.")


# 3. LE COFFRE : bloc plein, lettres taillées dedans, la barre au centre
@concept
def coffre(bg, ink, bar, uid):
    import biais
    from shapely import affinity
    from shapely.ops import unary_union
    g, S, T = biais.glyphs('Bold')
    P = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0]); F = g['F'][0]
    cap = biais.H; w = S / SIN
    import ident_min as im
    x0 = im.after(P, 0.55 * S, w); F = affinity.translate(F, xoff=im.glyph_after_bar(F, x0, w, 0.55 * S))
    ink_geo = unary_union([P, F]); bx1 = max(ink_geo.bounds[2], x0 + w + cap * K)
    cap_px = 118; s = cap_px / cap
    mono_w = bx1 * s
    pad_x, pad_y = 46, 44
    bw, bh = mono_w + 2 * pad_x, cap_px + 2 * pad_y
    left = 120; topb = 300 - bh / 2
    ox = left + pad_x; base = topb + pad_y + cap_px
    letters = biais.path_d(ink_geo, s, ox, base)
    body = f'<rect x="{left}" y="{topb:.2f}" width="{bw:.2f}" height="{bh:.2f}" fill="{ink}"/>'
    body += f'<path d="{letters}" fill="{bg}"/>'
    body += f'<polygon fill="{bar}" points="{bar_pts(ox + x0 * s, base, cap_px, w * s)}"/>'
    tx = left + bw + 40
    body += t('Montserrat-500', 12, 'CABINET', tx, topb + 46, ink, track=0.55, anchor='start')[0]
    body += t('CormorantGaramond-600', 44, 'Protection', tx - 2, topb + 98, ink, anchor='start')[0]
    body += t('CormorantGaramond-600', 44, 'Financière', tx - 2, topb + 142, ink, anchor='start')[0]
    body += t('Montserrat-400', 9.5, TAG, tx, topb + bh - 2, ink, track=0.28, anchor='start', op=.85)[0]
    tot = (tx + 270) - left
    return (f'<g transform="translate({(W - tot) / 2 - left:.2f} 0)">{body}</g>', 'Le Coffre',
            "Un bloc plein et stable, comme une porte de coffre : les lettres y sont taillées en creux et la barre AXA "
            "en est la clé. Très fort en petit (application, réseaux, plaque d'agence).")


# 4. LA MAISON : grande capitale classique, filets, signature de maison de gestion
@concept
def maison(bg, ink, bar, uid):
    L = mono_layout('CormorantGaramond-700', 170, CX, 286, gap=0.5, k=0.9)
    body = f'<path d="{letters_d(L)}" fill="{ink}"/>' + bar_svg(L, bar)
    name, nw = t('CormorantGaramond-600', 30, 'CABINET PROTECTION FINANCIÈRE', CX, 352, ink, track=0.16)
    body += name
    tg, tw = t('CormorantGaramond-500i', 21, 'Assurance, épargne & retraite', CX, 392, ink, op=.9)
    body += tg
    y = 385.5
    body += rule(CX - nw / 2, CX - tw / 2 - 18, y, ink, .9) + rule(CX + tw / 2 + 18, CX + nw / 2, y, ink, .9)
    body += rule(CX - nw / 2, CX + nw / 2, 316, ink, .9, .5)
    return body, 'La Maison', ("Le registre des grandes maisons de gestion privée : capitales classiques, filets fins, "
                               "« Cabinet » en toutes lettres. Intemporel, statutaire, rassurant.")


def doc(body, bg):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" '
            f'width="{W}" height="{Hc}"><rect width="{W}" height="{Hc}" fill="{bg}"/>{body}</svg>')


os.makedirs(OUT, exist_ok=True)
meta = []
for i, fn in enumerate(CONCEPTS, 1):
    for th, (bg, ink, bar) in THEMES.items():
        body, name, desc = fn(bg, ink, bar, f'{i}{th}')
        dy = {1: 28, 2: 45, 4: 42}.get(i, 0)
        body = f'<g transform="translate(0 {dy})">{body}</g>'
        open(f'{OUT}/concept-{i}-{th}.svg', 'w').write(doc(body, bg))
    meta.append((i, name, desc))
json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok')
