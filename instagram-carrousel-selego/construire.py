# Génère source.html du carrousel Selego. Usage : python3 instagram-carrousel-selego/construire.py puis node instagram-carrousel-selego/rendu.js
src = open('instagram-carrousel-essca/source.html').read()
head = src[:src.index('<body>')]
head = head.replace('url("polices/', 'url("../instagram-carrousel-essca/polices/')
head = head.replace('<title>Carrousel Phoxia × ESSCA × Université Laval</title>', '<title>Carrousel Selego</title>')
syms = src[src.index('<!-- Symbole Phoxia réutilisé -->'):src.index('<!-- 01 Couverture -->')]
N = '05'


def H(n, clair=True):
    sym = '#phoxia-clair' if clair else '#phoxia'
    return '<div class="haut"><span class="marque"><svg viewBox="0 0 139.03 102.15"><use href="%s"/></svg>Phoxia × Selego</span><span class="num">%s / %s</span></div>' % (sym, n, N)


body = '<body>\n' + syms + '''<!-- 01 Couverture -->
<section class="slide encre" id="s01">
  <svg class="filigrane" viewBox="0 0 139.03 102.15"><use href="#phoxia-clair"/></svg>
  <div class="logos">
    <div class="pastille" style="height:92px"><span class="mot" style="font-size:40px">Phoxia</span><svg viewBox="0 0 139.03 102.15" style="height:44px"><use href="#phoxia"/></svg></div>
    <span class="fois">×</span>
    <div class="pastille" style="height:92px"><span class="mot" style="font-size:44px;margin:0">Selego</span></div>
  </div>
  <div style="margin-top:auto">
    <p class="etiquette">Agence IA · Barcelone × Paris</p>
    <h1 style="margin-top:24px;font-size:124px">Un mois et demi<br>chez <em>Selego</em></h1>
    <p class="corps" style="margin-top:32px;max-width:32ch">Une mission à distance au sein d'une agence d'intelligence artificielle, entre Barcelone et Paris.</p>
  </div>
  <div class="bas" style="margin-top:60px"><span>Mathieu Barthélémy</span><span>Glissez →</span></div>
</section>

<!-- 02 L'agence -->
<section class="slide sable" id="s02">
  ''' + H('02', False) + '''
  <div style="margin-top:auto">
    <p class="etiquette">L'agence</p>
    <h2 style="margin-top:24px">Selego, l'IA<br>entre deux <em>capitales</em></h2>
    <hr class="filet" style="margin-top:48px;background:var(--azur)">
    <p class="corps" style="margin-top:44px">Selego est une agence spécialisée en intelligence artificielle, installée à Barcelone et à Paris.</p>
  </div>
  <div class="bas" style="margin-top:80px"><span>Barcelone</span><span>Paris</span></div>
</section>

<!-- 03 Le format -->
<section class="slide encre" id="s03">
  ''' + H('03') + '''
  <p class="etiquette" style="margin-top:80px">La mission</p>
  <h2 style="margin-top:24px">Travailler<br><em>à distance</em></h2>
  <div class="chiffres" style="margin-top:60px">
    <div class="chiffre"><b>1,5</b><span>mois de mission</span></div>
    <div class="chiffre"><b>100 %</b><span>à distance</span></div>
    <div class="chiffre" style="grid-column:1 / -1"><b style="font-size:84px">Barcelone × Paris</b><span>une équipe répartie entre l'Espagne et la France</span></div>
  </div>
  <div class="bas"><span>Selego</span><span>Agence IA</span></div>
</section>

<!-- 04 Le lien avec Phoxia -->
<section class="slide encre" id="s04" style="background:#0f1a31">
  <svg class="filigrane" viewBox="0 0 139.03 102.15"><use href="#phoxia-clair"/></svg>
  ''' + H('04') + '''
  <div style="margin-top:auto;margin-bottom:auto">
    <p class="etiquette">Et aujourd'hui</p>
    <h2 style="margin-top:24px">De Selego<br>à <em>Phoxia</em></h2>
    <p class="corps" style="margin-top:36px;max-width:34ch">L'intelligence artificielle au service des entreprises : une expérience qui nourrit aujourd'hui Phoxia, l'agence IA que j'ai fondée à Marseille.</p>
  </div>
  <div class="bas"><span>phoxia.fr</span><span>Marseille</span></div>
</section>

<!-- 05 Contact -->
<section class="slide sable" id="s05">
  ''' + H('05', False) + '''
  <div style="margin-top:auto">
    <p class="etiquette">Un projet IA ?</p>
    <h2 style="margin-top:24px">On en <em>parle</em> ?</h2>
    <span class="bouton">mathieu@phoxia.fr →</span>
    <p class="contact"><b>+33 7 82 59 09 91</b><br>phoxia.fr</p>
  </div>
  <div class="bas" style="margin-top:70px"><span class="marque" style="opacity:1"><svg viewBox="0 0 139.03 102.15"><use href="#phoxia"/></svg>@phoxia.fr</span><span>Marseille</span></div>
</section>

</body>
</html>
'''
open('instagram-carrousel-selego/source.html', 'w').write(head + body)
