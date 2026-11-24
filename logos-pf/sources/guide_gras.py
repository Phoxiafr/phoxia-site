"""Charte d'identité Cabinet Protection Financière (HTML), construite à partir de brand.py."""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
OUT = sys.argv[1]
sys.argv = ['brand', OUT]
import brand as B
import lib
from biais import H, K, path_d

C = B.COLORS
NAV, BEI, NOI, BLA, RED = C['marine'], C['beige'], C['noir'], C['blanc'], B.RED


def inline(fn, ink, bar, **kw):
    W, Hh, body = fn(ink, bar, **kw)
    return f'<svg viewBox="0 0 {W:.1f} {Hh:.1f}" xmlns="http://www.w3.org/2000/svg">{body}</svg>', W, Hh


def construction():
    unit = 90.0
    W, Hh, body = B.lockup(NAV, RED, unit=unit)
    ts = unit / H; lead = unit * 0.46; cap_m = unit * 2 + lead; m = unit
    base = m + cap_m; gap = unit * 0.95
    mw = B.mono_w() * cap_m / H; rule_w = B.S_R * ts
    xr = m + mw + gap; xt = xr + rule_w + gap
    g = '#8C93A0'; o = []
    # zone de protection
    o.append(f'<rect x="1.5" y="1.5" width="{W - 3:.1f}" height="{Hh - 3:.1f}" fill="none" stroke="{RED}" stroke-dasharray="6 5" stroke-width="1.2"/>')
    o.append(f'<rect x="{m:.1f}" y="{m:.1f}" width="{W - 2 * m:.1f}" height="{cap_m:.1f}" fill="none" stroke="{g}" stroke-width="1"/>')
    for y in (m, m + unit, m + unit + lead, base):
        o.append(f'<line x1="0" y1="{y:.1f}" x2="{W:.1f}" y2="{y:.1f}" stroke="{g}" stroke-width=".8" stroke-dasharray="3 4"/>')
    for x in (m + mw, xr, xr + rule_w, xt):
        o.append(f'<line x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{Hh:.1f}" stroke="{g}" stroke-width=".8" stroke-dasharray="3 4"/>')
    def tag(txt, x, y, col=g, anchor='middle'):
        return lib.text('Montserrat-600', 13, txt, x, y, track=0.12, anchor=anchor, fill=col)[0]
    o.append(tag('x', m / 2, m + unit / 2 + 5, RED)); o.append(tag('x', m + 30, m / 2 + 5, RED))
    o.append(tag('x', W - m / 2, base - unit / 2 + 5)); o.append(tag('0,46 x', W - m / 2, m + unit + lead / 2 + 5))
    o.append(tag('0,95 x', m + mw + gap / 2, Hh - m / 2 + 5)); o.append(tag('0,95 x', xr + rule_w + gap / 2, Hh - m / 2 + 5))
    o.append(tag('2,46 x', m - 0, Hh - m / 2 + 5, g, 'start'))
    svgc = f'<svg viewBox="0 0 {W:.1f} {Hh:.1f}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/>{body}{"".join(o)}</svg>'
    return svgc


def detail_glyphs():
    """Planche des lettres du caractère, avec les angles AXA mis en évidence."""
    g, S, T = B.G['Bold']
    s = 0.13; x = 30; base = 150; out = []
    for ch in 'PROTECIFNAÈ':
        geo, adv = g[ch]
        out.append(f'<path fill="{NAV}" d="{path_d(geo, s, x, base)}"/>')
        x += adv * s + 14
    g2 = B.G['Regular'][0]; x = 30; base2 = 300
    for ch in 'PROTECIFNAÈ':
        geo, adv = g2[ch]
        out.append(f'<path fill="{NAV}" d="{path_d(geo, s, x, base2)}"/>')
        x += adv * s + 14
    wv = max(x, 1100)
    return f'<svg viewBox="0 0 {wv:.0f} 330" xmlns="http://www.w3.org/2000/svg">{"".join(out)}</svg>'


def cmyk(hx):
    r, g_, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    k = 1 - max(r, g_, b)
    if k >= 1: return '0 · 0 · 0 · 100'
    c = (1 - r - k) / (1 - k); m = (1 - g_ - k) / (1 - k); y = (1 - b - k) / (1 - k)
    return ' · '.join(str(round(v * 100)) for v in (c, m, y, k))


def rgb(hx): return ' · '.join(str(int(hx[i:i + 2], 16)) for i in (1, 3, 5))


logo_w, _, _ = inline(B.lockup, BLA, RED)
cover = inline(B.lockup, BLA, RED)[0]
hero = inline(B.lockup, NAV, RED)[0]
mono_n = inline(B.monogramme, NAV, RED)[0]
type2 = inline(B.logotype, NAV, RED)[0]
type1 = inline(B.logotype_ligne, NAV, RED)[0]

tiles = ''
for key, lab, bg, ink in B.PALETTES:
    l = inline(B.lockup, C[ink], RED)[0]; mo = inline(B.monogramme, C[ink], RED)[0]
    bd = 'border:1px solid #E3DED4;' if bg in ('blanc',) else ''
    tiles += (f'<div><div class="pal" style="background:{C[bg]};{bd}"><div class="pl">{l}</div><div class="pm">{mo}</div></div>'
              f'<div class="cap">{lab}</div></div>')

monos = ''
for bg, ink, lab in ((BLA, NAV, 'Monochrome marine'), (BLA, NOI, 'Monochrome noir'), (NAV, BLA, 'Monochrome blanc'), (BEI, NAV, 'Marine sur beige, barre marine')):
    monos += f'<div><div class="pal small" style="background:{bg};border:1px solid #E3DED4"><div class="pl">{inline(B.lockup, ink, ink)[0]}</div></div><div class="cap">{lab}</div></div>'

swatches = ''
for name, hx, role in (('Bleu marine', NAV, 'Couleur principale'), ('Beige', BEI, 'Fonds, papeterie'),
                       ('Rouge AXA', RED, 'La barre uniquement'), ('Noir', NOI, 'Version sobre'),
                       ('Anthracite', C['anthracite'], 'Couleur d\'appui'), ('Vert anglais', C['vert-anglais'], 'Couleur d\'appui'),
                       ('Blanc', BLA, 'Fonds')):
    bd = 'border:1px solid #DDD;' if hx in (BLA, BEI) else ''
    swatches += (f'<div class="sw"><span style="background:{hx};{bd}"></span><b>{name}</b><em>{role}</em>'
                 f'<i>HEX {hx}<br>RVB {rgb(hx)}<br>CMJN {cmyk(hx)}</i></div>')


def donts():
    W, Hh, body = B.lockup(NAV, RED)
    base = f'<svg viewBox="0 0 {W:.1f} {Hh:.1f}" xmlns="http://www.w3.org/2000/svg" style="{{st}}">{{b}}</svg>'
    items = [
        ('Déformer ou étirer', base.format(st='transform:scaleY(1.7);width:60%', b=body)),
        ('Changer la couleur de la barre', base.format(st='', b=body.replace(RED, '#1B7F4C'))),
        ('Pivoter', base.format(st='transform:rotate(-8deg)', b=body)),
        ('Recomposer avec une autre police', '<div style="font:700 30px Mont;color:#14213D;letter-spacing:.02em">P/F <span style="font-weight:400">| Protection Financière</span></div>'),
        ('Poser sur un fond chargé', f'<div style="background:linear-gradient(120deg,#d8a,#6bd,#fd6);padding:18px">{base.format(st="", b=body)}</div>'),
        ('Ajouter ombre ou contour', base.format(st='filter:drop-shadow(4px 4px 0 #999)', b=body)),
    ]
    return ''.join(f'<div><div class="dont">{h}<span class="x">✕</span></div><div class="cap">{t}</div></div>' for t, h in items)


lock_small = inline(B.lockup, NAV, RED)[0]
mono_small = inline(B.monogramme, NAV, RED)[0]
mono_white = inline(B.monogramme, BLA, RED)[0]
mono_beige = inline(B.monogramme, BEI, RED)[0]
lock_white = inline(B.lockup, BLA, RED)[0]

html = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Charte Protection Financière</title>
<style>
@font-face{{font-family:Mont;src:url(fonts/Montserrat-400.ttf)}}
@font-face{{font-family:Mont;font-weight:600;src:url(fonts/Montserrat-600.ttf)}}
@font-face{{font-family:Biais;font-weight:700;src:url(police/PFBiais-Bold.ttf)}}
@font-face{{font-family:Biais;font-weight:400;src:url(police/PFBiais-Regular.ttf)}}
*{{box-sizing:border-box}}body{{margin:0;width:1600px;background:#F7F4EE;color:{NAV};font:400 16px/1.7 Mont,sans-serif}}
section{{padding:96px 120px;border-bottom:1px solid #E6E0D5}}
.k{{font:600 12px Mont;letter-spacing:.34em;color:#9A9384;text-transform:uppercase;margin-bottom:18px}}
h2{{font:600 36px Mont;letter-spacing:.01em;margin:0 0 18px}}
p{{max-width:860px;color:#3C4659;margin:0 0 14px}}
svg{{display:block;width:100%;height:auto}}
.cover{{background:{NAV};height:900px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:0}}
.cover .l{{width:980px}} .cover .t{{font:600 13px Mont;letter-spacing:.4em;color:{BEI};margin-top:70px;opacity:.85}}
.white{{background:#fff}}
.forms{{display:grid;grid-template-columns:1.6fr 1fr;gap:28px;margin-top:40px}}
.box{{background:#fff;border:1px solid #E6E0D5;display:flex;align-items:center;justify-content:center;padding:50px}}
.cap{{font:600 11px Mont;letter-spacing:.24em;color:#9A9384;text-transform:uppercase;margin-top:12px}}
.grid2{{display:grid;grid-template-columns:repeat(2,1fr);gap:26px;margin-top:36px}}
.pal{{height:250px;display:flex;align-items:center;justify-content:space-around;padding:0 30px}}
.pal .pl{{width:58%}} .pal .pm{{width:22%}} .pal.small{{height:170px}} .pal.small .pl{{width:70%}}
.sws{{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;margin-top:36px}}
.sw span{{display:block;height:150px}} .sw b{{display:block;font:600 15px Mont;margin-top:14px}}
.sw em{{display:block;font-style:normal;color:#9A9384;font-size:13px}} .sw i{{display:block;font:400 13px/1.7 Mont;color:#3C4659;font-style:normal;margin-top:8px}}
.spec{{font-family:Biais;line-height:1.15}}
.rules{{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:30px}}
.rules div{{background:#fff;border:1px solid #E6E0D5;padding:22px 24px;font-size:14px;color:#3C4659}}
.rules b{{display:block;color:{NAV};font:600 13px Mont;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}}
.dont{{position:relative;background:#fff;border:1px solid #E6E0D5;height:190px;display:flex;align-items:center;justify-content:center;padding:30px;overflow:hidden}}
.dont svg{{width:80%}} .x{{position:absolute;top:10px;right:14px;color:{RED};font:600 22px Mont}}
.g3{{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:36px}}
.sizes .cap{{white-space:nowrap}}.sizes{{display:flex;gap:70px;align-items:flex-end;background:#fff;border:1px solid #E6E0D5;padding:46px;margin-top:30px}}
.mock{{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:36px}}
.card{{aspect-ratio:85/55;box-shadow:0 20px 44px rgba(20,33,61,.18);border-radius:6px;overflow:hidden;position:relative}}
.card.r{{background:{NAV};display:flex;align-items:center;justify-content:center}} .card.r .m{{width:34%}}
.card.v{{background:#fff;padding:8% 8%}} .card.v .lg{{width:52%}}
.card.v .n{{font:700 24px Biais;letter-spacing:.06em;margin-top:15%}} .card.v .f{{font:600 10px Mont;letter-spacing:.26em;color:#9A9384;margin-top:6px}}
.card.v .c{{font:400 12px/1.8 Mont;color:#3C4659;margin-top:18px}} .card.v .bar{{position:absolute;right:0;top:0;bottom:0;width:10px;background:{NAV}}}
.a4{{background:#fff;aspect-ratio:210/297;box-shadow:0 20px 44px rgba(20,33,61,.14);padding:9% 9%;position:relative}}
.a4 .lg{{width:46%}} .a4 .ln{{height:7px;background:#ECE7DD;margin:9px 0;border-radius:2px}} .a4 .ft{{position:absolute;bottom:6%;left:9%;right:9%;border-top:1px solid #E6E0D5;padding-top:12px;font:400 10px Mont;color:#9A9384}}
.mail{{background:#fff;border:1px solid #E6E0D5;padding:30px 34px;font-size:14px;color:#3C4659}}
.mail .sig{{display:flex;align-items:center;gap:22px;margin-top:22px;border-top:1px solid #E6E0D5;padding-top:22px}} .mail .sig .lg{{width:260px}}
.avatar{{display:flex;gap:28px;align-items:center}} .avatar div{{flex:none;width:170px;height:170px;border-radius:50%;display:flex;align-items:center;justify-content:center}} .avatar svg{{width:66%}}
.plate{{background:linear-gradient(135deg,#1C2B4C,#0E172C);aspect-ratio:3/2;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 14px #182542,0 20px 44px rgba(0,0,0,.25)}} .plate .lg{{width:72%}}
</style></head><body>

<section class="cover"><div class="l">{cover}</div><div class="t">CHARTE D'IDENTITÉ VISUELLE</div></section>

<section class="white"><div class="k">01 · Le logo</div><h2 style="font:700 40px Biais;letter-spacing:.06em">PROTECTION FINANCIÈRE</h2>
<p>Le monogramme P/F et le nom du cabinet, réunis par un filet. Le P et le F sont séparés par la barre AXA : droite, pleine, exactement à la hauteur des lettres et de la même épaisseur que leurs fûts. Elle rappelle le lien avec AXA ; tout le reste appartient au cabinet.</p>
<p>Les lettres sont dessinées pour Protection Financière (caractère <b>PF Biais</b>) : toutes leurs coupes reprennent l'angle de la barre AXA, 64°. Les deux mots sont en gras et calés exactement à la même largeur ; un filet fin sépare le monogramme du nom.</p>
<div class="box" style="margin-top:34px;padding:80px 120px">{hero}</div></section>

<section><div class="k">02 · Les trois formes</div><h2>Logo, monogramme, logotype</h2>
<p>Le <b>logo complet</b> est la signature par défaut. Le <b>monogramme</b> seul sert quand la place manque ou que le cabinet est déjà nommé (avatar, icône, tampon, favicon). Le <b>logotype</b> seul sert dans les textes, en pied de page ou quand le monogramme figure déjà ailleurs.</p>
<div class="forms"><div><div class="box" style="height:300px">{hero}</div><div class="cap">Logo complet</div></div>
<div><div class="box" style="height:300px"><div style="width:62%">{mono_n}</div></div><div class="cap">Monogramme</div></div></div>
<div class="grid2"><div><div class="box" style="height:220px"><div style="width:70%">{type2}</div></div><div class="cap">Logotype, deux lignes</div></div>
<div><div class="box" style="height:220px"><div style="width:88%">{type1}</div></div><div class="cap">Logotype, une ligne</div></div></div></section>

<section class="white"><div class="k">03 · Construction</div><h2>Une seule mesure : x</h2>
<p>x est la hauteur des capitales du nom. Le monogramme mesure 2,46 x (deux lignes et leur interligne de 0,46 x). Le filet est espacé de 0,95 x de part et d'autre. La zone de protection, en rouge pointillé, vaut x tout autour : rien ne doit y entrer.</p>
<div style="margin-top:30px">{construction()}</div></section>

<section><div class="k">04 · Le caractère</div><h2>PF Biais</h2>
<p>Un alphabet de titrage dessiné pour le cabinet, en deux graisses. Règle unique : l'angle de la barre AXA. Les bras du E, du F et du T sont coupés à 64° ; l'ouverture du C est symétrique, coupée à 64° en haut et en miroir en bas ; l'accent du È est une petite barre ; la jambe gauche du A suit exactement la barre. Les espaces entre les lettres sont réglés paire par paire, à l'œil, pour une texture régulière.</p>
<div class="box" style="margin-top:30px;padding:40px 50px">{detail_glyphs()}</div>
<div class="rules"><div><b>Titres</b>PF Biais Bold, capitales, interlettrage léger.</div><div><b>Sous-titres</b>PF Biais Regular, capitales.</div><div><b>Textes</b>Montserrat Regular et SemiBold, pour les courriers, plaquettes et le site.</div></div></section>

<section class="white"><div class="k">05 · Couleurs</div><h2>Une palette sobre</h2>
<p>Le bleu marine porte l'identité ; le beige l'adoucit sur papier et en fond ; le rouge AXA est réservé à la barre. Les valeurs CMJN sont indicatives : à valider sur épreuve avec l'imprimeur.</p>
<div class="sws">{swatches}</div></section>

<section><div class="k">06 · Déclinaisons</div><h2>Huit associations autorisées</h2>
<p>La barre reste toujours rouge AXA. Sur les fonds foncés, le logo passe en blanc ou en beige.</p>
<div class="grid2">{tiles}</div></section>

<section class="white"><div class="k">07 · Versions monochromes</div><h2>Une seule couleur</h2>
<p>Pour la gravure, le tampon, la broderie, le marquage ou l'impression une couleur, la barre prend la couleur des lettres.</p>
<div class="grid2">{monos}</div></section>

<section><div class="k">08 · Tailles minimales</div><h2>Rester lisible</h2>
<div class="sizes"><div><div style="width:180px">{lock_small}</div><div class="cap">Courant · 35 mm · 180 px</div></div>
<div><div style="width:110px">{lock_small}</div><div class="cap">Minimum · 25 mm · 110 px</div></div>
<div><div style="width:60px">{mono_small}</div><div class="cap">Monogramme · 12 mm</div></div>
<div><div style="width:24px">{mono_small}</div><div class="cap">Favicon · 24 px</div></div></div>
<p style="margin-top:24px">Sous 25 mm de large, on utilise le monogramme seul.</p></section>

<section class="white"><div class="k">09 · À ne pas faire</div><h2>Protéger la marque</h2>
<div class="g3">{donts()}</div></section>

<section><div class="k">10 · Applications</div><h2>La marque au quotidien</h2>
<div class="mock"><div class="card r"><div class="m">{mono_beige}</div></div>
<div class="card v"><div class="lg">{lock_small}</div><div class="n">PRÉNOM NOM</div><div class="f">ASSOCIÉ · CONSEILLER EN PATRIMOINE</div>
<div class="c">Cabinet Protection Financière<br>Téléphone · Adresse e-mail · Adresse du cabinet</div><div class="bar"></div></div></div>
<div class="mock"><div class="a4"><div class="lg">{lock_small}</div><div style="margin-top:22%"><div class="ln" style="width:40%"></div><div class="ln" style="width:30%"></div><div style="height:40px"></div>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln" style="width:70%"></div><div style="height:20px"></div><div class="ln"></div><div class="ln"></div><div class="ln" style="width:55%"></div></div>
<div class="ft">Cabinet Protection Financière · Adresse · Téléphone · Site</div></div>
<div style="display:grid;gap:30px;align-content:start"><div class="plate"><div class="lg">{lock_white}</div></div>
<div class="mail">Bonjour,<br>Vous trouverez ci-joint le document évoqué lors de notre rendez-vous.<br>Bien cordialement,
<div class="sig"><div class="lg">{lock_small}</div><div style="font-size:12px;line-height:1.7"><b style="color:{NAV}">Prénom Nom</b><br>Associé · Conseiller en patrimoine<br>Téléphone · E-mail</div></div></div>
<div class="avatar"><div style="background:{NAV}">{mono_white}</div><div style="background:{BEI}">{mono_small}</div><p style="margin:0">Avatar réseaux sociaux et icône d'application : le monogramme centré sur un rond marine ou beige.</p></div></div></div></section>
</body></html>'''
open(f'{OUT}/charte.html', 'w').write(html)
print('charte ok')
