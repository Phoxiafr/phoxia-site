"""Déclinaisons couleur du logo Fût rouge : emblème empilé et cercle (encadré)."""
import sys, os, math, json, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
OUT = sys.argv[1]
_argv = sys.argv; sys.argv = ['ident', tempfile.mkdtemp()]
import ident                     # réutilise le caractère PF Biais et le monogramme
sys.argv = _argv
import lib
from biais import H, path_d
from shapely.ops import unary_union

RED = '#FF1721'
PALETTES = [  # nom, fond, encre
    ('blanc',        '#FFFFFF', '#0B1F4B'),
    ('ivoire',       '#F5F0E6', '#0B1F4B'),
    ('sable',        '#E6DDCF', '#0B1F4B'),
    ('gris-perle',   '#CFCFCD', '#FFFFFF'),
    ('pierre',       '#8E867D', '#FFFFFF'),
    ('anthracite',   '#2A2D33', '#FFFFFF'),
    ('noir',         '#0B0B0C', '#FFFFFF'),
    ('marine',       '#0B1F4B', '#FFFFFF'),
    ('bleu-roi',     '#1B3F86', '#FFFFFF'),
    ('vert-anglais', '#123B2F', '#FFFFFF'),
]

M_INK, M_BAR, _, _ = ident.fut_rouge('Medium')


def monogram(cap_px, cx, base, ink):
    a, wp = ident.draw(M_INK, M_BAR, cap_px, cx, base, ink)
    return a


def embleme(bg, ink):
    W, Hh = 600, 400
    body = monogram(112, W / 2, 196, ink)
    t, tw = ident.text_line('Regular', 'PROTECTION FINANCIÈRE', 15, W / 2, 252, ink, track_em=0.34)
    sub, sw = lib.text('CormorantGaramond-500i', 19, 'Assurances & Patrimoine', W / 2, 284, fill=ink, opacity=.85)
    # deux filets de part et d'autre de la signature, calés sur la largeur du nom
    y, gap, x0, x1 = 279.2, 14, W / 2 - tw / 2, W / 2 + tw / 2
    rules = ''.join(f'<line x1="{a:.2f}" y1="{y}" x2="{b:.2f}" y2="{y}" stroke="{ink}" stroke-width="1" opacity=".85"/>'
                    for a, b in ((x0, W / 2 - sw / 2 - gap), (W / 2 + sw / 2 + gap, x1)))
    return (W, Hh), f'<g transform="translate(0 14)">{body}{t}{rules}{sub}</g>'


def arc(items, cx, cy, r, span_deg, top, ink):
    """items : [(fonte, taille_px, caractère)]. Le texte est réparti sur span_deg degrés."""
    data = []
    for fname, px, ch in items:
        f, gs, cmap, upm = lib.font(fname); s = px / upm
        data.append((fname, px, ch, gs[cmap[ord(ch)]].width * s))
    adv = sum(d[3] for d in data)
    track = (math.radians(span_deg) * r - adv) / (len(data) - 1)
    out = []; off = 0; total = math.radians(span_deg) * r
    for fname, px, ch, a_ in data:
        mid = off + a_ / 2 - total / 2; off += a_ + track
        if ch == ' ': continue
        g = lib.Glyph(fname, ch); s = px / g.upm
        if top:
            ang = -math.pi / 2 + mid / r; rot = ang + math.pi / 2
        else:
            ang = math.pi / 2 - mid / r; rot = ang - math.pi / 2
        px_, py_ = cx + r * math.cos(ang), cy + r * math.sin(ang)
        co, si = math.cos(rot), math.sin(rot); lx = -a_ / 2
        m = (co * s, si * s, si * s, -co * s, px_ + co * lx, py_ + si * lx)
        out.append(g.svg(s, 0, 0, ink, extra=m))
    return ''.join(out)


def small_caps(txt, fname, big, small):
    """Petites capitales façon Azoulay : initiale de chaque mot plus grande."""
    items = []; first = True
    for ch in txt:
        if ch == ' ': items.append((fname, small, ' ')); first = True; continue
        items.append((fname, big if first else small, ch)); first = False
    return items


def cercle(bg, ink):
    S = 800; c = S / 2
    body = monogram(206, c, c + 103, ink)
    top = arc(small_caps('CABINET PROTECTION FINANCIÈRE', 'CormorantGaramond-600', 46, 36),
              c, c, 284, 148, True, ink)
    bot = arc([('Jost-400', 31, ch) for ch in 'AXA ASSURANCE ET PATRIMOINE'],
              c, c, 306, 124, False, ink)
    return (S, S), body + top + bot


def svg(size, body, bg):
    W, Hh = size
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W}" height="{Hh}">'
            f'<rect width="{W}" height="{Hh}" fill="{bg}"/>{body}</svg>')


os.makedirs(OUT, exist_ok=True)
meta = []
for name, bg, ink in PALETTES:
    for kind, fn in (('embleme', embleme), ('cercle', cercle)):
        size, body = fn(bg, ink)
        open(f'{OUT}/pf-{kind}-{name}.svg', 'w').write(svg(size, body, bg))
    meta.append((name, bg, ink))
json.dump(meta, open(OUT + '/meta.json', 'w'))
print('ok', len(meta))
