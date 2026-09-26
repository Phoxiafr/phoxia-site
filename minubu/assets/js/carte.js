/* =============================================================
   Minubu : page carte (filtres, recherche, commande à table)
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var t = M.t, L = M.L, e = M.echapper;

  var TXT = {
    fr: {
      emporter: 'À emporter', surPlace: 'Sur place', mode: 'Votre commande', table: 'N° de table', valider: 'Valider',
      tableActive: 'Vous commandez depuis la table {n}. On vous apporte tout.', changer: 'Changer',
      aucun: 'Rien ne correspond à votre recherche.', effacer: 'Effacer les filtres',
      cuisineFermee: 'La cuisine est fermée pour le moment : vous pouvez commander pour un créneau ultérieur, entre {d} et {f}.',
      tableInvalide: 'Indiquez un numéro de table valide.', tableOk: 'Table {n} enregistrée'
    },
    en: {
      emporter: 'Takeaway', surPlace: 'Dine in', mode: 'Your order', table: 'Table no.', valider: 'Confirm',
      tableActive: 'You’re ordering from table {n}. We’ll bring everything over.', changer: 'Change',
      aucun: 'Nothing matches your search.', effacer: 'Clear filters',
      cuisineFermee: 'The kitchen is closed right now: you can order for a later slot, between {d} and {f}.',
      tableInvalide: 'Please enter a valid table number.', tableOk: 'Table {n} saved'
    }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var filtres = {};
  var requete = '';
  var modeSurPlaceSaisie = false;

  function normaliser(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function correspond(p) {
    if (filtres.veg && p.tags.indexOf('veg') === -1) return false;
    if (filtres.sg && p.tags.indexOf('sg') === -1) return false;
    if (filtres.vegetal && p.tags.indexOf('vegetal') === -1) return false;
    if (filtres.new && p.tags.indexOf('new') === -1) return false;
    if (filtres['sans-arachides'] && (p.allergenes || []).indexOf('arachides') > -1) return false;
    if (!requete) return true;
    var foin = normaliser([p.nom.fr, p.nom.en, p.desc && p.desc.fr, p.desc && p.desc.en, L(M.categorieDe(p).label),
      p.tags.indexOf('sg') > -1 ? 'sans gluten gluten-free' : '', p.tags.indexOf('veg') > -1 ? 'vegetarien vegetarian vege' : '',
      p.tags.indexOf('vegetal') > -1 ? 'avoine coco oat coconut vegan' : ''].join(' '));
    return normaliser(requete).split(/\s+/).every(function (mot) { return foin.indexOf(mot) > -1; });
  }

  function rendreOnglets() {
    var nav = document.querySelector('[data-onglets]');
    nav.innerHTML = M.menu.categories.map(function (c) {
      return '<a class="onglet" href="#' + c.id + '" data-onglet="' + c.id + '">' + e(L(c.label)) + '</a>';
    }).join('');
  }

  function rendreMode() {
    var zone = document.querySelector('[data-mode]');
    var table = M.table();
    if (table) {
      zone.innerHTML = '<span data-icone="table" style="width:24px;color:var(--terracotta)"></span><span style="flex:1">' + e(x('tableActive', { n: table })) + '</span>' +
        '<button class="bouton-texte" type="button" data-changer-mode>' + x('changer') + '</button>';
    } else {
      zone.innerHTML = '<strong>' + x('mode') + '</strong>' +
        '<div class="segment" role="group"><button type="button" data-mode-choix="emporter" aria-pressed="' + !modeSurPlaceSaisie + '">' + x('emporter') + '</button>' +
        '<button type="button" data-mode-choix="table" aria-pressed="' + modeSurPlaceSaisie + '">' + x('surPlace') + '</button></div>' +
        (modeSurPlaceSaisie ? '<form class="code-promo" data-form-table style="flex:1;min-width:220px"><label class="visuellement-cache" for="num-table">' + x('table') + '</label>' +
          '<input id="num-table" inputmode="numeric" maxlength="3" placeholder="' + x('table') + '" style="height:44px;border-radius:999px;border:1.5px solid var(--ligne);padding:0 16px;background:var(--papier)">' +
          '<button class="bouton bouton--plein bouton--petit" type="submit">' + x('valider') + '</button></form>' : '');
    }
    M.illustrer(zone);
    var pause = document.querySelector('[data-pause]');
    if (M.commandesEnPause()) { pause.hidden = false; pause.innerHTML = M.art.icones.pause + '<span>' + e(t('commandesPause')) + '</span>'; }
    else pause.hidden = true;
  }

  function rendreCarte() {
    var zone = document.querySelector('[data-carte]');
    var etat = M.etatOuverture();
    var n = M.maintenant();
    var cuisineAuj = M.plage(M.config.cuisine, n.semaine);
    var html = '', total = 0;
    M.menu.categories.forEach(function (c) {
      var produits = M.menu.produits.filter(function (p) { return p.cat === c.id && correspond(p); });
      total += produits.length;
      if (!produits.length) return;
      var compacte = c.id === 'extras' || c.id === 'fraiches';
      var alerte = '';
      if (c.cuisine && !etat.cuisine) {
        var ref = cuisineAuj || M.plage(M.config.cuisine, 0);
        alerte = '<div class="bloc-categorie__alerte">' + M.art.icones.horloge.replace('<svg', '<svg style="width:18px;flex:none;margin-top:2px"') +
          '<span>' + e(x('cuisineFermee', { d: M.hhmm(ref.debut), f: M.hhmm(ref.fin) })) + '</span></div>';
      }
      html += '<section class="bloc-categorie" id="' + c.id + '" data-bloc="' + c.id + '">' +
        '<div class="bloc-categorie__titre">' + M.art[c.art]() + '<h2>' + e(L(c.label)) + '</h2></div>' +
        (c.note ? '<p class="bloc-categorie__note">' + e(L(c.note)) + '</p>' : '<div style="height:12px"></div>') + alerte +
        '<div class="produits produits--3">' + produits.map(function (p) { return M.carteProduit(p, compacte); }).join('') + '</div></section>';
    });
    if (!total) {
      html = '<div class="vide">' + M.art.cup() + '<p>' + x('aucun') + '</p><button class="bouton bouton--contour" type="button" data-effacer>' + x('effacer') + '</button></div>';
    }
    zone.innerHTML = html;
    observer();
  }

  /* Onglet actif selon la section visible */
  var io;
  function observer() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.getAttribute('data-bloc');
        document.querySelectorAll('[data-onglet]').forEach(function (o) {
          var actif = o.getAttribute('data-onglet') === id;
          o.setAttribute('aria-current', actif ? 'true' : 'false');
          if (actif && o.scrollIntoView) {
            var nav = o.parentNode;
            nav.scrollTo({ left: o.offsetLeft - nav.clientWidth / 2 + o.clientWidth / 2, behavior: 'smooth' });
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('[data-bloc]').forEach(function (b) { io.observe(b); });
  }

  document.addEventListener('click', function (ev) {
    var f = ev.target.closest('[data-filtre]');
    if (f) {
      var cle = f.getAttribute('data-filtre');
      filtres[cle] = !filtres[cle];
      f.setAttribute('aria-pressed', String(!!filtres[cle]));
      rendreCarte();
      return;
    }
    if (ev.target.closest('[data-effacer]')) {
      filtres = {}; requete = '';
      document.querySelector('[data-recherche]').value = '';
      document.querySelectorAll('[data-filtre]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      rendreCarte();
      return;
    }
    var m = ev.target.closest('[data-mode-choix]');
    if (m) {
      modeSurPlaceSaisie = m.getAttribute('data-mode-choix') === 'table';
      rendreMode();
      if (modeSurPlaceSaisie) { var inp = document.getElementById('num-table'); if (inp) inp.focus(); }
      return;
    }
    if (ev.target.closest('[data-changer-mode]')) { M.oublierTable(); modeSurPlaceSaisie = false; rendreMode(); }
  });

  document.addEventListener('submit', function (ev) {
    if (!ev.target.matches('[data-form-table]')) return;
    ev.preventDefault();
    var v = document.getElementById('num-table').value;
    if (M.definirTable(v)) { M.toast(x('tableOk', { n: v })); modeSurPlaceSaisie = false; rendreMode(); }
    else M.toast(x('tableInvalide'), 'info');
  });

  var minuterie;
  document.querySelector('[data-recherche]').addEventListener('input', function (ev) {
    clearTimeout(minuterie);
    minuterie = setTimeout(function () { requete = ev.target.value.trim(); rendreCarte(); }, 120);
  });

  function tout() { rendreOnglets(); rendreMode(); rendreCarte(); }
  tout();
  document.addEventListener('minubu:langue', tout);
  document.addEventListener('minubu:stockage', function (ev) { if (ev.detail.cle === 'indispo' || ev.detail.cle === 'pause') { rendreMode(); rendreCarte(); } });

  // Ouverture directe d'un produit : carte.html?produit=ube
  var direct = new URLSearchParams(location.search).get('produit');
  if (direct && M.menu.parId[direct]) setTimeout(function () { M.ouvrirProduit(direct); }, 200);
  if (location.hash) setTimeout(function () { var cible = document.querySelector(location.hash); if (cible) cible.scrollIntoView(); }, 50);
})();
