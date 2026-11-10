import sys, math, os
sys.path.insert(0, os.path.dirname(__file__))
from lib import *

OUT = sys.argv[1]
W, H = 600, 400


def mono(fname, mode='between', ang=64, k=1.0, g1=0.55, g2=0.55, kern=0.0):
    """Monogramme P F + barre. mode : 'between' (P/F) ou 'after' (PF/).
    La barre fait exactement la hauteur de capitale ; son épaisseur perpendiculaire
    vaut k fois le fût du P ; les écarts sont mesurés au plus près, en fraction du fût."""
    P, F = Glyph(fname, 'P'), Glyph(fname, 'F')
    cap = P.ymax; st = P.stem()
    w = st * k / math.sin(math.radians(ang))
    if mode == 'between':
        x0 = place_bar_after(P, 0, g1 * st, w, ang, cap)
        fx = place_glyph_after_bar(F, x0, w, ang, cap, g2 * st)
    else:
        fx = P.adv + kern * st
        x0 = place_bar_after(F, fx, g1 * st, w, ang, cap)
    bar = bar_poly(x0, 0, cap, w, ang, 1)
    xmin = P.xmin
    xmax = max(fx + F.xmax, max(p[0] for p in bar))
    return dict(P=P, F=F, fx=fx, bar=bar, cap=cap, st=st, xmin=xmin, xmax=xmax, w=w, ang=ang)


def draw_mono(m, cap_px, cx=None, baseline=0, left=None, ink=NAVY):
    s = cap_px / m['cap']
    width = (m['xmax'] - m['xmin']) * s
    ox = (cx - width / 2 if left is None else left) - m['xmin'] * s
    parts = [m['P'].svg(s, ox, baseline, ink), m['F'].svg(s, ox + m['fx'] * s, baseline, ink),
             poly_svg(m['bar'], s, ox, baseline)]
    return ''.join(parts), width, ox, s


def hair(x1, y1, x2, y2, w=1, ink=NAVY, op=None):
    o = f' opacity="{op}"' if op else ''
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{ink}" stroke-width="{w}"{o}/>'


def svgdoc(body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<rect width="{W}" height="{H}" fill="{bg}"/>{body}</svg>')


LOGOS = []
def logo(fn):
    LOGOS.append(fn); return fn

CX = W / 2

# 01 Garalde, barre entre P et F
@logo
def l01(ink):
    m = mono('CormorantGaramond-600', 'between', ang=64, k=1.0, g1=0.6, g2=0.5)
    a, wd, _, _ = draw_mono(m, 118, cx=CX, baseline=212, ink=ink)
    t, tw = text('CormorantGaramond-600', 21, 'PROTECTION FINANCIÈRE', CX, 268, track=0.32, fill=ink)
    rule = hair(CX - tw / 2, 236, CX + tw / 2, 236, 0.8, ink, .55)
    sub, _ = text('Montserrat-400', 9.5, 'PRÉVOYANCE  ·  PATRIMOINE', CX, 294, track=0.42, fill=ink, opacity=.7)
    return a + rule + t + sub, 'Garalde · P / F', "Barre entre les deux lettres, logée sous la panse du P. Garamond, filet fin et capitales espacées : le registre d'une gestion privée."

# 02 Garalde, barre après
@logo
def l02(ink):
    m = mono('CormorantGaramond-600', 'after', ang=64, k=1.0, g1=0.5, kern=0.1)
    a, wd, _, _ = draw_mono(m, 118, cx=CX, baseline=212, ink=ink)
    t, tw = text('CormorantGaramond-600', 21, 'PROTECTION FINANCIÈRE', CX, 268, track=0.32, fill=ink)
    rule = hair(CX - tw / 2, 236, CX + tw / 2, 236, 0.8, ink, .55)
    sub, _ = text('Montserrat-400', 9.5, 'PRÉVOYANCE  ·  PATRIMOINE', CX, 294, track=0.42, fill=ink, opacity=.7)
    return a + rule + t + sub, 'Garalde · PF /', "Même dessin que la 01 avec la barre après le F, nichée sous ses bras. Pour comparer les deux placements à l'identique."

# 03 Le fût du F devient la barre AXA
@logo
def l03(ink):
    fname = 'Montserrat-500'
    P, F = Glyph(fname, 'P'), Glyph(fname, 'F')
    cap, st = P.ymax, P.stem(); ang = 64; c = 1 / math.tan(math.radians(ang))
    w = st * 1.05 / math.sin(math.radians(ang))
    # bras du F mesurés sur la fonte
    rows = [y for y in range(0, int(cap) + 1) if (F.right(y) or 0) - (F.left(y) or 0) > st * 1.6]
    groups = []
    for y in rows:
        if groups and y - groups[-1][-1] <= 2: groups[-1].append(y)
        else: groups.append([y])
    (m0, m1), (t0, t1) = (groups[0][0], groups[0][-1]), (groups[-1][0], groups[-1][-1] + 1)
    topLen = F.right(cap - 5) - F.left(cap - 5) - st
    midLen = F.right((m0 + m1) / 2) - F.left((m0 + m1) / 2) - st
    x0 = place_bar_after(P, 0, 0.8 * st, w, ang, cap)
    s = 120 / cap; xmax = x0 + w + cap * c + topLen
    width = (xmax - P.xmin) * s; ox = CX - width / 2 - P.xmin * s; base = 205
    def X(u): return ox + u * s
    def Y(v): return base - v * s
    def arm(v0, v1, L):
        xl = x0 + w / 2 + v1 * c; xr = x0 + w + v1 * c + L
        xr0 = x0 + w + v0 * c + L if False else xr
        return (f'<polygon fill="{ink}" points="{X(x0 + w/2 + v0*c):.2f},{Y(v0):.2f} {X(xr):.2f},{Y(v0):.2f} '
                f'{X(xr):.2f},{Y(v1):.2f} {X(xl):.2f},{Y(v1):.2f}"/>')
    body = P.svg(s, ox, base, ink) + arm(t0, cap, topLen) + arm(m0, m1 + 1, midLen)
    body += poly_svg(bar_poly(x0, 0, cap, w, ang, 1), s, ox, base)
    t, tw = text('Montserrat-500', 13.5, 'PROTECTION FINANCIÈRE', CX, 262, track=0.42, fill=ink)
    sub, _ = text('CormorantGaramond-500i', 17, 'Assurances & Patrimoine', CX, 290, fill=ink, opacity=.8)
    return body + t + sub, 'Fût rouge', "La barre AXA devient le fût du F : le P, puis un F dont la colonne est rouge. Un monogramme propriétaire, lisible et unique."

# 04 Didone horizontale
@logo
def l04(ink):
    m = mono('BodoniModa-700', 'after', ang=64, k=0.9, g1=0.30, kern=-0.06)
    a, wd, ox, s = draw_mono(m, 92, left=70, baseline=236, ink=ink)
    xr = 70 + wd + 30
    l = hair(xr, 236 - 92, xr, 236, 1, ink, .6)
    t1, w1 = text('BodoniModa-500', 25, 'PROTECTION', xr + 28, 180, track=0.12, anchor='start', fill=ink)
    t2, w2 = text('BodoniModa-500', 25, 'FINANCIÈRE', xr + 28, 212, track=0.12, anchor='start', fill=ink)
    t3, _ = text('Montserrat-400', 8.6, 'PRÉVOYANCE · PATRIMOINE', xr + 29, 236, track=0.3, anchor='start', fill=ink, opacity=.7)
    body = a + l + t1 + t2 + t3
    # recentrage horizontal
    tot = (xr + 28 + max(w1, w2)) - 70
    return f'<g transform="translate({(W - tot) / 2 - 70:.2f} 0)">{body}</g>', 'Didone', "Pleins et déliés très contrastés, la barre a l'épaisseur exacte des fûts. Verrouillage horizontal pour en-têtes, vitrine, cartes de visite."

# 05 Playfair P/F empilé, sous-ligne rouge courte
@logo
def l05(ink):
    m = mono('PlayfairDisplay-700', 'between', ang=64, k=0.95, g1=0.4, g2=0.36)
    a, wd, _, _ = draw_mono(m, 112, cx=CX, baseline=206, ink=ink)
    t, tw = text('PlayfairDisplay-600', 19, 'PROTECTION FINANCIÈRE', CX, 258, track=0.2, fill=ink)
    sub, _ = text('Montserrat-400', 9.5, 'ASSURANCES  &  PATRIMOINE', CX, 286, track=0.42, fill=ink, opacity=.7)
    return a + t + sub, 'Transitionnelle · P / F', "Playfair, plus charpentée et très lisible. La barre s'emboîte entre P et F pour former un bloc compact, idéal en icône."

# 06 Italique
@logo
def l06(ink):
    m = mono('PlayfairDisplay-600i', 'between', ang=66, k=0.95, g1=0.30, g2=0.30)
    a, wd, _, _ = draw_mono(m, 116, cx=CX, baseline=206, ink=ink)
    t, tw = text('CormorantGaramond-600i', 30, 'Protection Financière', CX, 256, fill=ink)
    sub, sw = text('Montserrat-400', 9, 'PRÉVOYANCE · PATRIMOINE', CX, 284, track=0.4, fill=ink, opacity=.7)
    r = hair(CX - tw / 2, 280.5, CX - sw / 2 - 12, 280.5, .8, ink, .5) + hair(CX + sw / 2 + 12, 280.5, CX + tw / 2, 280.5, .8, ink, .5)
    return a + t + sub + r, 'Italique', "Lettres italiques, barre entre P et F. Plus chaleureux et personnel : la signature d'un conseiller."

# 07 Géométrique fine
@logo
def l07(ink):
    m = mono('Jost-300', 'between', ang=64, k=1.0, g1=1.5, g2=1.5)
    a, wd, _, _ = draw_mono(m, 112, cx=CX, baseline=200, ink=ink)
    t, tw = text('CormorantGaramond-600', 20, 'PROTECTION FINANCIÈRE', CX, 254, track=0.42, fill=ink)
    sub, _ = text('Jost-400', 10, 'CONSEIL EN ASSURANCE & PATRIMOINE', CX, 280, track=0.36, fill=ink, opacity=.7)
    return a + t + sub, 'Épure', "Capitales géométriques fines, beaucoup d'air, barre au même trait que les lettres. Contemporain et haut de gamme."

# 08 Sceau
@logo
def l08(ink):
    cy = 200; R = 150
    m = mono('CormorantGaramond-700', 'between', ang=64, k=1.0, g1=0.42, g2=0.42)
    a, wd, _, _ = draw_mono(m, 66, cx=CX, baseline=cy + 33, ink=ink)
    ring = (f'<circle cx="{CX}" cy="{cy}" r="{R}" fill="none" stroke="{ink}" stroke-width="1.6"/>'
            f'<circle cx="{CX}" cy="{cy}" r="{R - 6}" fill="none" stroke="{ink}" stroke-width=".6"/>'
            f'<circle cx="{CX}" cy="{cy}" r="{R - 46}" fill="none" stroke="{ink}" stroke-width=".8"/>')
    top = text_arc('CormorantGaramond-600', 19, 'PROTECTION FINANCIÈRE', CX, cy, R - 34, track=0.17, top=True, fill=ink)
    bot = text_arc('Montserrat-500', 10.5, 'PRÉVOYANCE & PATRIMOINE', CX, cy, R - 21, track=0.26, top=False, fill=ink)
    dots = ''.join(f'<circle cx="{CX + sx * (R - 26):.2f}" cy="{cy}" r="2.4" fill="{RED}"/>' for sx in (-1, 1))
    return ring + top + bot + dots + a, 'Sceau', "Format rond, en écho au logo circulaire de l'agence. Texte dessiné lettre à lettre sur le cercle. Avatar, tampon, signature mail."

# 09 Arche
@logo
def l09(ink):
    m = mono('Marcellus-400', 'between', ang=64, k=1.0, g1=0.45, g2=0.45)
    a, wd, _, _ = draw_mono(m, 78, cx=CX, baseline=200, ink=ink)
    aw, top, bot = 88, 62, 232
    arch = (f'<path d="M{CX - aw},{bot} V{top + aw} A{aw},{aw} 0 0 1 {CX + aw},{top + aw} V{bot}" fill="none" stroke="{ink}" stroke-width="1.4"/>'
            f'<path d="M{CX - aw + 7},{bot} V{top + aw} A{aw - 7},{aw - 7} 0 0 1 {CX + aw - 7},{top + aw} V{bot}" fill="none" stroke="{ink}" stroke-width=".6"/>')
    base = hair(CX - aw - 22, bot, CX + aw + 22, bot, 1.4, ink)
    t, tw = text('Marcellus-400', 19, 'PROTECTION FINANCIÈRE', CX, 272, track=0.3, fill=ink)
    sub, _ = text('Montserrat-400', 9.5, 'PRÉVOYANCE  ·  PATRIMOINE', CX, 297, track=0.42, fill=ink, opacity=.7)
    return arch + base + a + t + sub, 'Arche', "Une arche, comme l'entrée d'une maison solide : P/F en est la clé. Institutionnel et rassurant, sans le cliché du bouclier."

# 10 Bloc typographique justifié
@logo
def l10(ink):
    m = mono('Prata-400', 'after', ang=64, k=1.0, g1=0.36, kern=-0.1)
    a, wd, ox, s = draw_mono(m, 104, left=0, baseline=0, ink=ink)
    # deux lignes justifiées exactement à la largeur du monogramme
    def just(word, size, y, x0):
        f0, wd0 = text('Montserrat-500', size, word, 0, 0, track=0, anchor='start')
        n = len(word) - 1; tr = (wd - wd0) / n / size
        g, _ = text('Montserrat-500', size, word, x0, y, track=tr, anchor='start', fill=ink)
        return g
    x0 = CX - wd / 2
    body = f'<g transform="translate({x0:.2f} 196)">{a}</g>'
    body += hair(x0, 220, x0 + wd, 220, 1, ink, .55)
    body += just('PROTECTION', 13.5, 250, x0) + just('FINANCIÈRE', 13.5, 274, x0)
    return body, 'Bloc justifié', "PF/ en Didone douce, et le nom en deux lignes calées exactement sur la largeur du monogramme. Rigueur et précision, comme un bon conseil."


os.makedirs(OUT + '/svg', exist_ok=True)
meta = []
for i, fn in enumerate(LOGOS, 1):
    for mode, ink, bg in (('clair', NAVY, '#FBFAF7'), ('marine', '#FFFFFF', NAVY)):
        body, name, desc = fn(ink)
        open(f'{OUT}/svg/logo-{i:02d}-{mode}.svg', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n' + svgdoc(body, bg))
    meta.append((i, name, desc))
import json; json.dump(meta, open(OUT + '/meta.json', 'w'), ensure_ascii=False)
print('ok', len(LOGOS))
