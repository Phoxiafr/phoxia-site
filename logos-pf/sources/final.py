"""Cabinet Protection Financière : logo final (Glyptique) et ses déclinaisons officielles."""
import sys, os, math, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
OUT = sys.argv[1]
_a = sys.argv; sys.argv = ['v8', tempfile.mkdtemp()]
import v8
sys.argv = _a
import lib
from v8 import CAP, K, SIN, gshift, profile, bar_after, glyph_after_bar

NOIR, ROUGE, BLANC = '#111111', '#FF1721', '#FFFFFF'
TAG = 'ASSURANCE & PATRIMOINE'

# ---------- géométrie du monogramme, en unités (ligne de base y = 0, capitale y = CAP)
P, F, STEM, _, _ = v8.glyptique()
gP, gF = P.geo(), F.geo()
WB = STEM * 0.95 / SIN
GAP = STEM * 0.62
X0 = bar_after(gP, GAP, WB)
DX = glyph_after_bar(gF, X0, WB, GAP)
FS = gshift(F, DX)
XMIN = min(gP.bounds[0], FS.geo().bounds[0])
XMAX = max(FS.geo().bounds[2], X0 + WB + CAP * K)
MW = XMAX - XMIN                       # largeur du monogramme (unités)


def mono(ink, bar, s, left, base):
    """Monogramme posé avec son bord gauche en `left`, ligne de base en `base`, échelle s px/unité."""
    ox = left - XMIN * s
    x0 = ox + X0 * s; w = WB * s; h = CAP * s; d = h * K
    pts = f'{x0:.2f},{base:.2f} {x0 + w:.2f},{base:.2f} {x0 + w + d:.2f},{base - h:.2f} {x0 + d:.2f},{base - h:.2f}'
    return P.paths(s, ox, base, ink) + FS.paths(s, ox, base, ink) + f'<polygon fill="{bar}" points="{pts}"/>'


def signature(ink, width, x, y, size):
    """« ASSURANCE & PATRIMOINE » en Marcellus (capitales glyptiques), justifié sur `width`."""
    _, w0 = lib.text('Marcellus-400', size, TAG, 0, 0, track=0)
    tr = (width - w0) / (len(TAG) - 1) / size
    svg, _ = lib.text('Marcellus-400', size, TAG, x, y, track=tr, anchor='start', fill=ink)
    return svg


def doc(w, h, body, bg=None):
    r = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{r}{body}</svg>')


def logo(ink, bar, bg=None, with_sig=False, cap_px=240):
    s = cap_px / CAP; mw = MW * s
    m = cap_px * 0.55                                   # zone de protection
    sig_h = cap_px * 0.30 if with_sig else 0
    w, h = mw + 2 * m, cap_px + sig_h + 2 * m
    base = m + cap_px
    body = mono(ink, bar, s, m, base)
    if with_sig:
        body += signature(ink, mw, m, base + cap_px * 0.30, cap_px * 0.092)
    return doc(w, h, body, bg)


def icone(size=1024, bg=NOIR, ink=BLANC, bar=ROUGE):
    cap_px = size * 0.36; s = cap_px / CAP; mw = MW * s
    base = size / 2 + cap_px / 2
    return doc(size, size, mono(ink, bar, s, (size - mw) / 2, base), bg)


def construction():
    cap_px = 300; s = cap_px / CAP; mw = MW * s
    m = 150; W, H = mw + 2 * m, cap_px + 2 * m
    base = m + cap_px; ox = m - XMIN * s
    g = '#9AA0A6'
    out = []
    for y, lab in ((base, 'LIGNE DE BASE'), (base - cap_px, 'HAUTEUR DE CAPITALE'), (base - 98 * s, 'PANSE / BRAS')):
        out.append(f'<line x1="20" y1="{y:.2f}" x2="{W - 20:.2f}" y2="{y:.2f}" stroke="{g}" stroke-width="1" stroke-dasharray="4 5"/>')
        out.append(lib.text('Montserrat-500', 10, lab, W - 20, y - 7, track=0.2, anchor='end', fill=g)[0])
    # angle de la barre
    bx = ox + X0 * s
    gx = bx - 14
    out.append(f'<line x1="{gx - 70 * K:.2f}" y1="{base + 70:.2f}" x2="{gx + (cap_px + 60) * K:.2f}" y2="{base - cap_px - 60:.2f}" '
               f'stroke="{ROUGE}" stroke-width="1" stroke-dasharray="5 4"/>')
    r = 56; a = math.radians(64)
    out.append(f'<path d="M{bx + r:.2f},{base} A{r},{r} 0 0 0 {bx + r * math.cos(a):.2f},{base - r * math.sin(a):.2f}" '
               f'fill="none" stroke="{ROUGE}" stroke-width="1.2"/>')
    out.append(mono(NOIR, ROUGE, s, m, base))
    out.append(lib.text('Montserrat-600', 12, '64°', bx + r + 8, base - 16, anchor='start', fill=ROUGE)[0])
    # épaisseurs : fût = barre
    st = STEM * s
    out.append(f'<line x1="{ox:.2f}" y1="{base + 34:.2f}" x2="{ox + st:.2f}" y2="{base + 34:.2f}" stroke="{NOIR}" stroke-width="1.2"/>')
    out.append(f'<line x1="{bx:.2f}" y1="{base + 34:.2f}" x2="{bx + WB * s:.2f}" y2="{base + 34:.2f}" stroke="{NOIR}" stroke-width="1.2"/>')
    out.append(lib.text('Montserrat-500', 10, 'FÛT', ox + st / 2, base + 54, track=0.2, fill=NOIR)[0])
    out.append(lib.text('Montserrat-500', 10, 'BARRE', bx + WB * s / 2, base + 54, track=0.2, fill=NOIR)[0])
    return doc(W, H, ''.join(out), BLANC)


os.makedirs(OUT + '/svg', exist_ok=True)
files = {
    'pf-logo-noir':                 logo(NOIR, ROUGE),
    'pf-logo-noir-fond-blanc':      logo(NOIR, ROUGE, BLANC),
    'pf-logo-blanc-fond-noir':      logo(BLANC, ROUGE, NOIR),
    'pf-logo-blanc':                logo(BLANC, ROUGE),
    'pf-logo-mono-noir':            logo(NOIR, NOIR),
    'pf-logo-mono-blanc':           logo(BLANC, BLANC),
    'pf-signature-noir-fond-blanc': logo(NOIR, ROUGE, BLANC, True),
    'pf-signature-blanc-fond-noir': logo(BLANC, ROUGE, NOIR, True),
    'pf-signature-noir':            logo(NOIR, ROUGE, None, True),
    'pf-signature-blanc':           logo(BLANC, ROUGE, None, True),
    'pf-icone-noir':                icone(),
    'pf-icone-blanc':               icone(bg=BLANC, ink=NOIR),
    'pf-construction':              construction(),
}
for n, svg in files.items():
    open(f'{OUT}/svg/{n}.svg', 'w').write(svg)
print('ok', len(files), 'MW', round(MW, 1))
