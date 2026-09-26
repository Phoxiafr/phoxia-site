/* =============================================================
   Minubu : page d'accueil
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;

  function rendre() {
    var sig = document.querySelector('[data-signatures]');
    if (sig) {
      sig.innerHTML = M.menu.produits.filter(function (p) { return p.signature && M.categorieDe(p).cuisine; })
        .map(function (p) { return M.carteProduit(p); }).join('');
    }
    var lattes = document.querySelector('[data-lattes]');
    if (lattes) {
      lattes.innerHTML = ['pistachio', 'ube', 'matcha', 'tahini', 'turmeric', 'peanut']
        .map(function (id) { return M.carteProduit(M.menu.parId[id]); }).join('');
    }
    var mosaique = document.querySelector('[data-mosaique]');
    if (mosaique && !mosaique.children.length) {
      var scenes = [
        ['latte', '#F7AE93', '#9B7BC4'], ['toast', '#FCDCCD'], ['cup', '#8FC1C7', '#C49A74'],
        ['pancake', '#FFFDFB'], ['glass', '#F7AE93', '#F2B544'], ['bagel', '#FCDCCD']
      ];
      mosaique.innerHTML = scenes.map(function (s) {
        return '<a href="' + M.config.instagram + '" target="_blank" rel="noopener" style="background:' + s[1] + '" aria-label="Instagram Minubu">' + M.art[s[0]](s[2]) + '</a>';
      }).join('');
    }
  }

  /* La carte OpenStreetMap n'est chargée qu'à la demande (aucun traceur par défaut). */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-charger-carte]')) return;
    var zone = document.querySelector('[data-carte-geo]');
    var a = M.config.adresse, d = 0.006;
    var bbox = [a.lng - d, a.lat - d * 0.7, a.lng + d, a.lat + d * 0.7].join('%2C');
    zone.innerHTML = '<iframe title="Plan d’accès Minubu" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&amp;layer=mapnik&amp;marker=' + a.lat + '%2C' + a.lng + '"></iframe>';
  });

  rendre();
  document.addEventListener('minubu:langue', rendre);
  document.addEventListener('minubu:stockage', function (e) { if (e.detail.cle === 'indispo') rendre(); });
})();
