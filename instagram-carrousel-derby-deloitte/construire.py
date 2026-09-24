# Régénère source.html (frise du Derby). Usage : python3 instagram-carrousel-derby-deloitte/construire.py puis node instagram-carrousel-derby-deloitte/rendu.js
p = 'instagram-carrousel-derby-deloitte/source.html'
s = open(p).read()
head = s[:s.index('<body>')]
syms = s[s.index('<!-- Symbole Phoxia réutilisé -->'):s.index('<!-- 01 Couverture -->')]
N = '13'
I = '../assets/img/essca/'


def H(n):
    return '<div class="haut"><span class="marque"><svg viewBox="0 0 139.03 102.15"><use href="#phoxia-clair"/></svg>Phoxia × ESSCA × Deloitte</span><span class="num">%s / %s</span></div>' % (n, N)


def Hs(n):
    return '<div class="haut"><span class="marque"><svg viewBox="0 0 139.03 102.15"><use href="#phoxia"/></svg>Phoxia × ESSCA × Deloitte</span><span class="num">%s / %s</span></div>' % (n, N)


def fig(src, alt, pos='50% 50%', extra=''):
    return '<figure%s><img src="%s%s" alt="%s" style="object-position:%s"></figure>' % (extra, I, src, alt, pos)


def grid(style, figs):
    return '<div class="mosaique-match mosaique-derby" style="%s">%s</div>' % (style, ''.join(figs))


def photo(src, alt, h, pos):
    return '<img class="grande-photo" src="%s%s" alt="%s" style="height:%dpx;object-position:%s">' % (I, src, alt, h, pos)


def slide(n, theme, eti, titre, texte, contenu, bas_d, bg=''):
    h = H(n) if theme == 'encre' else Hs(n)
    st = ' style="background:%s"' % bg if bg else ''
    return '''<section class="slide %s" id="s%s"%s>
  %s
  <p class="etiquette" style="margin-top:70px">%s</p>
  <h2 style="margin-top:20px;font-size:100px">%s</h2>
  <p class="corps" style="margin-top:22px;max-width:46ch;font-size:31px">%s</p>
  %s
  <div class="bas"><span>phoxia.fr/essca</span><span>%s</span></div>
</section>

''' % (theme, n, st, h, eti, titre, texte, contenu, bas_d)


body = '<body>\n' + syms + '''<!-- 01 Couverture -->
<section class="slide encre" id="s01">
  <div class="logos">
    <div class="pastille" style="height:92px"><span class="mot" style="font-size:40px">Phoxia</span><svg viewBox="0 0 139.03 102.15" style="height:44px"><use href="#phoxia"/></svg></div>
    <span class="fois">×</span>
    <div class="pastille" style="height:92px"><img src="../assets/img/logos/essca.png" alt="ESSCA" style="height:70px"></div>
    <span class="fois">×</span>
    <div class="pastille" style="height:92px"><img src="../assets/img/logos/deloitte.png" alt="Deloitte" style="height:36px"></div>
  </div>
  ''' + photo('deloitte-trail.jpg', 'En course au 32e Derby Deloitte', 540, '45% 72%') + '''
  <p class="etiquette" style="margin-top:40px">20 au 22 juin 2025 · Gorges de l'Allier</p>
  <h1 style="margin-top:16px;font-size:112px">32<sup style="font-size:.45em">e</sup> Derby <em>Deloitte</em></h1>
  <p class="corps" style="margin-top:20px;max-width:44ch;font-size:32px">Trois jours de trail, de kayak, de VTT, d'orientation de nuit et d'accrobranche avec l'équipe La Relève. Une place obtenue grâce à l'ESSCA.</p>
  <div class="bas"><span>« On a rien 100 rien »</span><span>Glissez →</span></div>
</section>

'''

def G2(a, b, cols='1fr 1fr', h=620):
    return grid('grid-template-columns:%s;grid-template-rows:1fr;height:%dpx' % (cols, h), [a, b])


def stats(items):
    cells = ''.join('<div class="chiffre"><b style="font-size:64px">%s</b><span>%s</span></div>' % it for it in items)
    return '<div class="chiffres" style="grid-template-columns:repeat(%d,1fr);gap:18px;margin-top:32px">%s</div>' % (len(items), cells)


def slide_extra(n, eti, titre, texte, a, b, bas_g, bas_d, bg=''):
    st = ' style="background:%s"' % bg if bg else ''
    return '''<section class="slide encre" id="s%s"%s>
  %s
  <p class="etiquette" style="margin-top:70px">%s</p>
  <h2 style="margin-top:20px;font-size:100px">%s</h2>
  <p class="corps" style="margin-top:22px;max-width:46ch;font-size:31px">%s</p>
  %s
  %s
  <div class="bas"><span>%s</span><span>%s</span></div>
</section>

''' % (n, st, H(n), eti, titre, texte, a, b, bas_g, bas_d)


body += slide('02', 'sable', '20 juin · 9h', "Départ pour l'<em>Allier</em>",
              "Sac sur le dos, maillot rose sur les épaules : l'équipe La Relève au complet sur le quai, direction Chanteuges.",
              G2(fig('derby-gare.jpg', "L'équipe en maillot rose sur le quai de la gare", '38% 55%'),
                 fig('derby-depart-couloir.jpg', 'En route vers le quai', '50% 50%'), '1.7fr 1fr'), 'Jour 1')

body += slide('03', 'encre', '20 juin · 16h', 'Premier <em>trail</em>',
              "Dès l'arrivée, départ sous l'arche du Derby pour 14,65 km de sentiers et de balises en 2h39.",
              grid('grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;height:640px',
                   [fig('deloitte-trail.jpg', 'En course avec le dossard du Derby', '40% 72%', ' style="grid-row:1 / 3"'),
                    fig('derby-trail20-equipe.jpg', "L'équipe au départ du trail", '50% 45%'),
                    fig('deloitte-orientation.jpg', "L'équipe à une balise d'orientation", '55% 60%'),
                    fig('derby-trail20-depart.jpg', "Le départ sous l'arche du Derby", '50% 50%'),
                    fig('derby-trail20-prairie.jpg', 'Dans les prairies de Haute-Loire', '50% 55%')]), 'Jour 1')

body += slide('04', 'sable', '20 juin · 19h', 'Premier <em>kayak</em>',
              "À peine le trail fini, cap sur l'Allier : première descente en kayak, avant la nuit.",
              G2(fig('derby-kayak-20.jpg', "Descente de l'Allier en kayak", '50% 60%'),
                 fig('derby-kayak-equipe.jpg', "L'équipe avant la descente en kayak"), '1.6fr 1fr'), 'Jour 1')

body += slide_extra('05', '20 juin · 23h', "L'épreuve <em>nocturne</em>",
                    "Frontale sur la tête et carte en main : une course d'orientation de nuit, balise après balise.",
                    grid('grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr;height:420px;margin-top:30px',
                         [fig('derby-nuit-selfie.jpg', 'Au départ de la nocturne, frontale allumée'),
                          fig('derby-nuit-carte.jpg', 'Lecture de carte à la frontale', '50% 40%'),
                          fig('derby-nuit-groupe.jpg', "L'équipe au départ de la nocturne")]),
                    stats([('11,75', 'km parcourus'), ('485 m', 'de dénivelé positif'), ('1h52', 'de course'), ('8', 'balises récupérées')]),
                    'Record perso sur 10 km', 'Jour 1', bg='#0b1224')

body += slide('06', 'sable', '21 juin · 8h', "Retour sur l'<em>eau</em>",
              "Réveil matinal et deuxième épreuve de kayak sur l'Allier, entre les gorges et les rapides.",
              photo('derby-kayak-21.jpg', "Kayak sur l'Allier le matin du 21 juin", 600, '45% 55%'), 'Jour 2')

body += slide('07', 'encre', '21 juin · 9h', 'Dans les <em>arbres</em>',
              "Enchaînement direct avec l'accrobranche : tyrolienne, filets et passerelles au-dessus du sol.",
              grid('grid-template-columns:1fr 1fr;grid-template-rows:1fr 1.6fr;height:640px',
                   [fig('derby-accro-tyrolienne.jpg', "Tyrolienne pendant l'épreuve d'accrobranche", '50% 50%', ' style="grid-column:1 / 3"'),
                    fig('derby-accro-selfie.jpg', 'Selfie dans les filets', '50% 40%'),
                    fig('derby-accro-arbre.jpg', "L'équipe dans les arbres", '50% 60%')]), 'Jour 2')

body += slide('08', 'sable', '21 juin · 10h', 'Trail avec <em>vue</em>',
              'Deuxième trail, cette fois sur les hauteurs : pause photo face aux monts de Haute-Loire.',
              G2(fig('derby-trail10-panorama.jpg', "L'équipe face au panorama", '50% 55%'),
                 fig('derby-trail10-miroir.jpg', 'Selfie dans un miroir de rue', '50% 45%'), '1.6fr 1fr'), 'Jour 2')

body += slide_extra('09', '21 juin · 14h', 'Étape <em>VTT</em>',
                    'Casque sur la tête, boucle entre Langeac et Chanteuges : ma plus longue sortie vélo à ce jour.',
                    photo('derby-vtt-equipe.jpg', "L'équipe au départ de l'étape VTT", 470, '50% 45%'),
                    stats([('16,79', 'km à vélo'), ('373 m', 'de dénivelé'), ('1h45', "d'effort")]),
                    'phoxia.fr/essca', 'Jour 2')

body += slide('10', 'sable', '21 juin · 17h', 'Dernier <em>trail</em>',
              "Troisième trail du week-end, les jambes lourdes mais le sourire intact, jusqu'à l'arche d'arrivée.",
              G2(fig('derby-trail21-equipe.jpg', "L'équipe avant le dernier trail", '50% 55%'),
                 fig('derby-trail21-arche.jpg', "Retour sous l'arche du Derby", '50% 55%')), 'Jour 2')

body += slide('11', 'encre', '21 juin · Le soir', 'Sous le <em>chapiteau</em>',
              "Après l'effort, la soirée du Derby et la remise des prix sur scène, avec les équipes de toute la France.",
              G2(fig('derby-soiree-selfie.jpg', 'Selfie devant le plan du 32e Derby Deloitte', '40% 50%'),
                 fig('derby-scene.jpg', 'Remise des prix sur la scène du Derby 2025', '45% 62%')), 'Jour 2', bg='#1a0f2e')

body += slide('12', 'sable', '22 juin · 10h', 'Fin du <em>Derby</em>',
              'Départ à 10h : trois jours dans les jambes, quelques siestes bien méritées et beaucoup de souvenirs dans le train du retour.',
              G2(fig('derby-train-sieste.jpg', 'Sieste dans le train du retour', '50% 55%'),
                 fig('derby-train-selfie.jpg', "Selfie de l'équipe dans le train", '40% 50%'), '1.5fr 1fr', 600), 'Jour 3')

body += '''<section class="slide encre" id="s13">
  <svg class="filigrane" viewBox="0 0 139.03 102.15"><use href="#phoxia-clair"/></svg>
  %s
  <p class="etiquette" style="margin-top:70px">Le Derby en chiffres</p>
  <div class="chiffres" style="margin-top:30px">
    <div class="chiffre"><b>32<sup style="font-size:.45em">e</sup></b><span>édition du Derby Deloitte</span></div>
    <div class="chiffre"><b>3</b><span>jours, du 20 au 22 juin 2025</span></div>
    <div class="chiffre"><b>8</b><span>épreuves : 3 trails, 2 kayaks, VTT, nocturne et accrobranche</span></div>
    <div class="chiffre"><b style="font-size:84px">La Relève</b><span>« On a rien 100 rien »</span></div>
  </div>
  <p class="citation" style="font-size:58px;margin-top:60px">Encore une fois, c'est le <em>réseau</em> de l'ESSCA qui m'a ouvert la porte.</p>
  <p class="signature" style="margin-top:30px">Mathieu Barthélémy, fondateur de Phoxia</p>
  <div class="bas"><span>Merci l'ESSCA et Deloitte</span><span>@phoxia.fr</span></div>
</section>

</body>
</html>
''' % H('13')

head = head.replace('/* Trois piliers */', '''.mosaique-derby { margin-top: 32px; }

  /* Trois piliers */''', 1)
open(p, 'w').write(head + body)
