/* =============================================================
   Minubu : atelier latte (configurateur de boisson)
   Les prix viennent exclusivement de la carte (menu-data.js).
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var e = M.echapper, L = M.L;

  var TXT = {
    fr: { e2: 'Vos réglages', ajouter: 'Ajouter · {prix}', ajoute: 'Création ajoutée au panier', enregistre: 'Création enregistrée dans vos favoris',
          commander: 'Commander', supprimer: 'Supprimer', indispo: 'Victime de son succès', creation: 'Création' },
    en: { e2: 'Your settings', ajouter: 'Add · {prix}', ajoute: 'Creation added to your bag', enregistre: 'Creation saved to your favourites',
          commander: 'Order', supprimer: 'Delete', indispo: 'Sold out for now', creation: 'Creation' }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var BASES = ['pistachio', 'ube', 'matcha', 'tahini', 'turmeric', 'peanut', 'blue', 'chai', 'latte', 'flatwhite', 'macchiato', 'chocolat']
    .map(function (id) { return M.menu.parId[id]; }).filter(Boolean);
  var TEINTES_LAIT = { vache: '#FFFDF8', avoine: '#F3E6CF', coco: '#FFFFFF' };

  var etat = { base: BASES[0].id, choix: {} };
  function initChoix() {
    var p = M.menu.parId[etat.base];
    var anciens = etat.choix;
    etat.choix = {};
    (p.options || []).forEach(function (o) {
      var existe = anciens[o.id] && o.choix.some(function (c) { return c.id === anciens[o.id]; });
      etat.choix[o.id] = existe ? anciens[o.id] : o.choix[0].id;
    });
  }

  /* ---------- Gobelet animé ---------- */
  function scene() {
    return '<svg class="gobelet" viewBox="0 0 220 300" aria-hidden="true">' +
      '<defs><clipPath id="verre"><path d="M42 50h136l-16 214c-1 9-8 16-17 16H75c-9 0-16-7-17-16z"/></clipPath>' +
      '<linearGradient id="reflet" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".15" stop-color="#fff" stop-opacity=".45"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="vapeur" fill="none" stroke="#641D30" stroke-width="3" stroke-linecap="round" opacity=".6"><path d="M90 36c-8-10 8-14 0-26"/><path d="M110 36c-8-10 8-14 0-26"/><path d="M130 36c-8-10 8-14 0-26"/></g>' +
      '<path class="paille" d="M128 70l26-66h14" fill="none" stroke="#641D30" stroke-width="8" stroke-linecap="round"/>' +
      '<path class="paille" d="M128 70l26-66h14" fill="none" stroke="#F7AE93" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M42 50h136l-16 214c-1 9-8 16-17 16H75c-9 0-16-7-17-16z" fill="#fff"/>' +
      '<g clip-path="url(#verre)">' +
        '<rect class="liquide" x="0" y="120" width="220" height="200" fill="#C49A74"/>' +
        '<rect class="lait" x="0" y="96" width="220" height="40" fill="#FFFDF8" opacity=".85"/>' +
        '<rect class="mousse" x="0" y="80" width="220" height="22" fill="#FBF1E6"/>' +
        '<g class="glacons" fill="#fff" fill-opacity=".75" stroke="#641D30" stroke-opacity=".35" stroke-width="2">' +
          '<rect x="70" y="96" width="30" height="30" rx="6" transform="rotate(-12 85 111)"/><rect x="112" y="108" width="28" height="28" rx="6" transform="rotate(14 126 122)"/><rect x="88" y="140" width="26" height="26" rx="6" transform="rotate(6 101 153)"/></g>' +
        '<rect x="0" y="0" width="220" height="300" fill="url(#reflet)"/>' +
      '</g>' +
      '<rect x="52" y="176" width="116" height="44" rx="4" fill="#FFFDFB" stroke="#641D30" stroke-width="2.5"/>' +
      '<text class="nom-gobelet" x="110" y="206" text-anchor="middle" font-family="Gochi Hand, cursive" font-size="24" fill="#641D30">minubu</text>' +
      '<path d="M42 50h136l-16 214c-1 9-8 16-17 16H75c-9 0-16-7-17-16z" fill="none" stroke="#641D30" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M36 50h148" stroke="#641D30" stroke-width="5" stroke-linecap="round"/>' +
      '</svg>' +
      '<div class="atelier__etiquette"><div><span data-sous-titre></span><strong data-titre-boisson></strong></div><div class="atelier__prix" data-prix-boisson></div></div>';
  }

  function majScene() {
    var p = M.menu.parId[etat.base];
    var svg = document.querySelector('.gobelet');
    var froid = etat.choix.temp === 'froid';
    svg.querySelector('.liquide').setAttribute('fill', p.couleur || '#C49A74');
    svg.querySelector('.lait').setAttribute('fill', TEINTES_LAIT[etat.choix.lait] || '#FFFDF8');
    svg.querySelector('.lait').setAttribute('opacity', etat.choix.lait ? '.85' : '0');
    svg.querySelector('.mousse').style.opacity = froid ? 0 : 1;
    svg.querySelector('.glacons').style.opacity = froid ? 1 : 0;
    svg.querySelector('.vapeur').style.display = froid ? 'none' : '';
    svg.querySelectorAll('.paille').forEach(function (el) { el.style.display = froid ? '' : 'none'; });
    // Petit effet de remplissage à chaque changement
    var liq = svg.querySelector('.liquide');
    liq.style.transition = 'none'; liq.style.y = '300px'; void liq.getBoundingClientRect();
    requestAnimationFrame(function () { liq.style.transition = ''; liq.style.y = (froid ? 104 : 120) + 'px'; });
    var prenom = document.getElementById('prenom-gobelet').value.trim();
    svg.querySelector('.nom-gobelet').textContent = prenom || 'minubu';
    document.querySelector('[data-titre-boisson]').textContent = L(p.nom);
    document.querySelector('[data-sous-titre]').textContent = libelleReglages();
    var pu = M.menu.prixLigne(p, etat.choix);
    document.querySelector('[data-prix-boisson]').textContent = M.prix(pu);
    document.querySelector('[data-ajouter]').textContent = x('ajouter', { prix: M.prix(pu) });
    document.querySelector('[data-ajouter]').disabled = !M.estDisponible(p.id);
  }

  function libelleReglages() {
    var p = M.menu.parId[etat.base];
    return (p.options || []).map(function (o) {
      var c = o.choix.filter(function (y) { return y.id === etat.choix[o.id]; })[0];
      return c ? L(c.label) : '';
    }).filter(Boolean).join(' · ');
  }

  function rendreBases() {
    document.querySelector('[data-bases]').innerHTML = BASES.map(function (p) {
      var dispo = M.estDisponible(p.id);
      return '<button type="button" class="base" data-base="' + p.id + '" aria-pressed="' + (etat.base === p.id) + '"' + (dispo ? '' : ' disabled title="' + x('indispo') + '"') + '>' +
        '<i style="background:' + p.couleur + '"></i><strong>' + e(L(p.nom)) + '</strong><small>' + (dispo ? M.prix(p.prix) : x('indispo')) + '</small></button>';
    }).join('');
  }

  function rendreOptions() {
    var p = M.menu.parId[etat.base];
    var zone = document.querySelector('[data-options]');
    zone.innerHTML = '<div class="etape__titre"><span class="etape__numero">2</span><h2>' + x('e2') + '</h2></div>' +
      (p.options || []).map(function (o) {
        return '<fieldset class="groupe-options" style="margin-top:0;margin-bottom:18px"><legend>' + e(L(o.label)) + '</legend><div class="choix-grille">' +
          o.choix.map(function (c) {
            var idc = 'at-' + o.id + '-' + c.id;
            return '<div class="choix"><input type="radio" name="at-' + o.id + '" id="' + idc + '" value="' + c.id + '" data-option="' + o.id + '"' + (etat.choix[o.id] === c.id ? ' checked' : '') + '>' +
              '<label for="' + idc + '"><span>' + e(L(c.label)) + '</span>' + (c.prix ? '<small>+' + M.prix(c.prix) + '</small>' : '') + '</label></div>';
          }).join('') + '</div></fieldset>';
      }).join('');
  }

  /* ---------- Favoris ---------- */
  function favoris() { return M.stock.lire('favoris', []); }
  function rendreFavoris() {
    var f = favoris();
    document.querySelector('[data-zone-favoris]').hidden = !f.length;
    document.querySelector('[data-favoris]').innerHTML = f.map(function (fav, i) {
      var p = M.menu.parId[fav.base];
      if (!p) return '';
      return '<div class="favori"><i style="background:' + p.couleur + '"></i><div><strong>' + e(fav.titre) + '</strong><small>' + e(L(p.nom)) + ' · ' + e(M.prix(M.menu.prixLigne(p, fav.choix))) + '</small></div>' +
        '<button class="bouton bouton--plein bouton--petit" type="button" data-commander-favori="' + i + '">' + x('commander') + '</button>' +
        '<button class="bouton-rond bouton-rond--clair" type="button" data-supprimer-favori="' + i + '" aria-label="' + x('supprimer') + '" style="width:38px;height:38px">' + M.art.icones.poubelle + '</button></div>';
    }).join('');
  }

  function ligneCourante() {
    var p = M.menu.parId[etat.base];
    var prenom = document.getElementById('prenom-gobelet').value.trim();
    var titre = document.getElementById('nom-creation').value.trim();
    return { id: p.id, choix: JSON.parse(JSON.stringify(etat.choix)), qte: 1, perso: { prenom: prenom, couleur: p.couleur, titre: titre ? titre + ' (' + L(p.nom) + ')' : '' } };
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-base]');
    if (b) { etat.base = b.getAttribute('data-base'); initChoix(); rendreBases(); rendreOptions(); majScene(); return; }
    if (ev.target.closest('[data-ajouter]')) {
      var l = ligneCourante();
      if (!l.perso.titre) delete l.perso.titre;
      M.panier.ajouter(l); M.toast(x('ajoute')); return;
    }
    if (ev.target.closest('[data-favori]')) {
      var lc = ligneCourante();
      var f = favoris();
      f.unshift({ base: lc.id, choix: lc.choix, prenom: lc.perso.prenom, titre: document.getElementById('nom-creation').value.trim() || x('creation') + ' ' + (f.length + 1) });
      M.stock.ecrire('favoris', f.slice(0, 12));
      rendreFavoris(); M.toast(x('enregistre'), 'coeur'); return;
    }
    var cf = ev.target.closest('[data-commander-favori]');
    if (cf) {
      var fav = favoris()[+cf.getAttribute('data-commander-favori')];
      var p = M.menu.parId[fav.base];
      if (!M.estDisponible(p.id)) { M.toast(x('indispo'), 'info'); return; }
      M.panier.ajouter({ id: fav.base, choix: fav.choix, qte: 1, perso: { prenom: fav.prenom, couleur: p.couleur, titre: fav.titre + ' (' + L(p.nom) + ')' } });
      M.toast(x('ajoute')); return;
    }
    var sf = ev.target.closest('[data-supprimer-favori]');
    if (sf) { var liste = favoris(); liste.splice(+sf.getAttribute('data-supprimer-favori'), 1); M.stock.ecrire('favoris', liste); rendreFavoris(); }
  });
  document.addEventListener('change', function (ev) {
    var o = ev.target.getAttribute('data-option');
    if (o) { etat.choix[o] = ev.target.value; majScene(); }
  });
  document.getElementById('prenom-gobelet').addEventListener('input', function () {
    document.querySelector('.gobelet .nom-gobelet').textContent = this.value.trim() || 'minubu';
  });

  var prenomConnu = M.stock.lire('client', {}).prenom;
  if (prenomConnu) document.getElementById('prenom-gobelet').value = prenomConnu;
  var demande = new URLSearchParams(location.search).get('base');
  if (demande && BASES.some(function (b) { return b.id === demande; })) etat.base = demande;

  document.querySelector('[data-scene]').innerHTML = scene();
  initChoix();
  function tout() { rendreBases(); rendreOptions(); majScene(); rendreFavoris(); }
  tout();
  document.addEventListener('minubu:langue', tout);
  document.addEventListener('minubu:stockage', function (ev) { if (ev.detail.cle === 'indispo') { rendreBases(); majScene(); } });
})();
