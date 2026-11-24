"""Identité Cabinet Protection Financière : logo principal, monogramme, logotype, palettes.

Caractère : PF Biais (dessiné pour le cabinet). Approche optique : chaque paire de lettres
est espacée en mesurant la surface blanche entre elles, pas seulement les bords.
"""
import sys, os, math, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import biais
from biais import H, K, SIN, path_d, profile
from shapely import affinity
from shapely.ops import unary_union

OUT = sys.argv[1]
RED = '#FF1721'
G = {w: biais.glyphs(w) for w in ('Bold', 'Regular')}


# ------------------------------------------------------------------ espacement optique
def _gaps(a, b, dx):
    out = []
    for i in range(1, 70):
        y = H * i / 70
        r = profile(a, y, 'r'); l = profile(b, y, 'l')
        if r is not None and l is not None: out.append(l + dx - r)
    return out


def _metric(gs, cap):
    m = min(gs); c = [min(g, cap) for g in gs]
    return 0.45 * m + 0.55 * sum(c) / len(c)


def pair_dx(a, b, target, cap):
    """Décalage de b (dessiné à l'origine) pour que l'espace optique entre a et b vaille target."""
    lo, hi = a.bounds[2] - b.bounds[0] - 400, a.bounds[2] - b.bounds[0] + 1200
    for _ in range(40):
        mid = (lo + hi) / 2
        gs = _gaps(a, b, mid)
        if not gs: return a.bounds[2] - b.bounds[0] + target
        if _metric(gs, cap) < target or min(gs) < 0.62 * target: lo = mid
        else: hi = mid
    return (lo + hi) / 2


def word(weight, txt, extra=0.0):
    """Mot composé avec espacement optique ; extra = interlettrage ajouté (unités)."""
    g, S, T = G[weight]
    target = S * {'Bold': 1.12, 'Regular': 1.55}[weight] + extra
    cap = S * {'Bold': 2.3, 'Regular': 3.2}[weight]
    parts = []; prev = None; x_space = 0
    for ch in txt:
        geo, adv = g[ch]
        if geo is None: x_space = adv; continue
        geo = affinity.translate(geo, xoff=-geo.bounds[0])
        if prev is None: dx = 0
        else: dx = pair_dx(prev, geo, target, cap) + x_space
        x_space = 0
        geo = affinity.translate(geo, xoff=dx)
        parts.append(geo); prev = geo
    return unary_union(parts)


def width(g): return g.bounds[2] - g.bounds[0]


def justify(weight, txt, w_target):
    lo, hi = -200.0, 900.0
    for _ in range(30):
        mid = (lo + hi) / 2
        if width(word(weight, txt, mid)) < w_target: lo = mid
        else: hi = mid
    return word(weight, txt, (lo + hi) / 2)


# ------------------------------------------------------------------ éléments du logo (unités)
def monogram():
    g, S, T = G['Bold']
    P = affinity.translate(g['P'][0], xoff=-g['P'][0].bounds[0]); F = g['F'][0]
    w = S / SIN
    def after(geo, gap):
        best = -1e9
        for i in range(141):
            y = H * i / 140; r = profile(geo, y, 'r')
            if r is not None: best = max(best, r - y * K)
        return best + gap
    x0 = after(P, 0.52 * S)
    best = -1e9
    for i in range(141):
        y = H * i / 140; l = profile(F, y, 'l')
        if l is not None: best = max(best, x0 + w + y * K - l)
    F = affinity.translate(F, xoff=best + 0.52 * S)
    bar = biais.para(x0, 0, H, w)
    return unary_union([P, F]), bar


MONO, BAR = monogram()
L1 = word('Bold', 'PROTECTION')
L2 = justify('Regular', 'FINANCIÈRE', width(L1))            # les deux lignes ont la même largeur
S_B, S_R = G['Bold'][1], G['Regular'][1]


def draw(geo, s, x, base, fill):
    return f'<path fill="{fill}" d="{path_d(geo, s, x - geo.bounds[0] * s, base)}"/>'


def bar_draw(s, x_mono_left, base, fill):
    pts = ' '.join(f'{x_mono_left + (px - MONO.bounds[0]) * s:.2f},{base - py * s:.2f}'
                   for px, py in list(BAR.exterior.coords)[:-1])
    return f'<polygon fill="{fill}" points="{pts}"/>'


def mono_w(): return max(MONO.bounds[2], BAR.bounds[2]) - MONO.bounds[0]


# ------------------------------------------------------------------ compositions (px), zone de protection incluse
def lockup(ink, bar, unit=40.0):
    """Logo principal. unit = hauteur de capitale d'une ligne du nom ; zone de protection = 1 unit."""
    ts = unit / H; lead = unit * 0.46
    cap_m = unit * 2 + lead; ms = cap_m / H
    gap = unit * 0.95
    rule_w = S_R * ts                                      # filet = épaisseur du fût de FINANCIÈRE
    mw = mono_w() * ms
    tw = width(L1) * ts
    m = unit * 1.0
    W = m * 2 + mw + gap * 2 + rule_w + tw; Hh = m * 2 + cap_m
    base = m + cap_m
    x = m
    body = draw(MONO, ms, x, base, ink) + bar_draw(ms, x, base, bar)
    xr = x + mw + gap
    body += f'<rect x="{xr:.2f}" y="{base - cap_m:.2f}" width="{rule_w:.2f}" height="{cap_m:.2f}" fill="{ink}"/>'
    xt = xr + rule_w + gap
    body += draw(L1, ts, xt, base - unit - lead, ink) + draw(L2, ts, xt, base, ink)
    return W, Hh, body


def monogramme(ink, bar, cap=200.0):
    s = cap / H; mw = mono_w() * s; m = cap * 0.4
    W = mw + 2 * m; Hh = cap + 2 * m; base = m + cap
    return W, Hh, draw(MONO, s, m, base, ink) + bar_draw(s, m, base, bar)


def logotype(ink, bar, unit=40.0):
    """PROTECTION / FINANCIÈRE seul, sur deux lignes justifiées."""
    ts = unit / H; lead = unit * 0.46; m = unit
    tw = width(L1) * ts
    W = tw + 2 * m; Hh = unit * 2 + lead + 2 * m
    b1 = m + unit; b2 = b1 + lead + unit
    return W, Hh, draw(L1, ts, m, b1, ink) + draw(L2, ts, m, b2, ink)


def logotype_ligne(ink, bar, unit=40.0):
    """PROTECTION FINANCIÈRE sur une ligne : gras + regular."""
    ts = unit / H; m = unit
    a = L1; b = word('Regular', 'FINANCIÈRE', S_R * 1.1)
    sp = unit * 0.62
    W = (width(a) + width(b)) * ts + sp + 2 * m; Hh = unit + 2 * m; base = m + unit
    return W, Hh, draw(a, ts, m, base, ink) + draw(b, ts, m + width(a) * ts + sp, base, ink)


def svg(W, Hh, body, bg=None):
    r = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ''
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {W:.1f} {Hh:.1f}" width="{W:.0f}" height="{Hh:.0f}">{r}{body}</svg>')


# ------------------------------------------------------------------ palettes
COLORS = {   # nom : HEX
    'marine': '#14213D', 'beige': '#EFE8DC', 'noir': '#111111', 'blanc': '#FFFFFF',
    'anthracite': '#2E3238', 'vert-anglais': '#1F3D33', 'rouge-axa': RED,
}
PALETTES = [  # clé, libellé, fond, encre
    ('marine-blanc',        'Marine sur blanc',          'blanc',        'marine'),
    ('marine-beige',        'Marine sur beige',          'beige',        'marine'),
    ('blanc-marine',        'Blanc sur marine',          'marine',       'blanc'),
    ('beige-marine',        'Beige sur marine',          'marine',       'beige'),
    ('noir-blanc',          'Noir sur blanc',            'blanc',        'noir'),
    ('blanc-noir',          'Blanc sur noir',            'noir',         'blanc'),
    ('blanc-anthracite',    'Blanc sur anthracite',      'anthracite',   'blanc'),
    ('beige-vert-anglais',  'Beige sur vert anglais',    'vert-anglais', 'beige'),
]

if __name__ == '__main__':
    for d in ('svg', 'svg-transparent'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
    KINDS = {'logo': lockup, 'monogramme': monogramme, 'logotype': logotype, 'logotype-ligne': logotype_ligne}
    for kind, fn in KINDS.items():
        for key, lab, bg, ink in PALETTES:
            W, Hh, body = fn(COLORS[ink], RED)
            open(f'{OUT}/svg/pf-{kind}-{key}.svg', 'w').write(svg(W, Hh, body, COLORS[bg]))
        for ink in ('marine', 'noir', 'blanc', 'beige'):
            W, Hh, body = fn(COLORS[ink], RED)
            open(f'{OUT}/svg-transparent/pf-{kind}-{ink}.svg', 'w').write(svg(W, Hh, body))
            W, Hh, body = fn(COLORS[ink], COLORS[ink])
            open(f'{OUT}/svg-transparent/pf-{kind}-{ink}-monochrome.svg', 'w').write(svg(W, Hh, body))
    json.dump({'palettes': PALETTES, 'colors': COLORS}, open(f'{OUT}/meta.json', 'w'), ensure_ascii=False)
    print('ok')
