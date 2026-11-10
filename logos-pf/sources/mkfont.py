import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from biais import *
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
NAMES = {'P':'P','F':'F','E':'E','È':'Egrave','I':'I','T':'T','N':'N','A':'A','O':'O','C':'C','R':'R',' ':'space'}
for wname in WEIGHTS:
    g, S, T = glyphs(wname)
    order = ['.notdef'] + list(NAMES.values())
    fb = FontBuilder(1000, isTTF=True); fb.setupGlyphOrder(order)
    fb.setupCharacterMap({ord(c): n for c, n in NAMES.items()})
    glyf = {}; metrics = {}
    p = TTGlyphPen(None); glyf['.notdef'] = p.glyph(); metrics['.notdef'] = (500, 0)
    for ch, n in NAMES.items():
        geo, adv = g[ch]; p = TTGlyphPen(None)
        if geo is not None:
            for r in rings(geo):
                pts = []
                for x, y in r:
                    q = (round(x), round(y))
                    if not pts or pts[-1] != q: pts.append(q)
                if len(pts) > 1 and pts[0] == pts[-1]: pts.pop()
                if len(pts) < 3: continue
                p.moveTo(pts[0]); [p.lineTo(q) for q in pts[1:]]; p.closePath()
        glyf[n] = p.glyph(); metrics[n] = (round(adv), round(geo.bounds[0]) if geo is not None else 0)
    fb.setupGlyf(glyf); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=960, descent=-240)
    fam = 'PF Biais'
    fb.setupNameTable({'familyName': fam, 'styleName': wname, 'uniqueFontIdentifier': f'PFBiais-{wname}',
                       'fullName': f'{fam} {wname}', 'psName': f'PFBiais-{wname}', 'version': 'Version 0.1'})
    wc = {'Light': 300, 'Regular': 400, 'Medium': 500, 'Bold': 700}[wname]
    fb.setupOS2(sTypoAscender=960, sTypoDescender=-240, usWinAscent=960, usWinDescent=240, usWeightClass=wc, sCapHeight=700)
    fb.setupPost(); fb.save(f'{out}/PFBiais-{wname}.ttf')
print('fonts ok')
