/* =============================================================
   Minubu : écran cuisine (back-office de démonstration)
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var e = M.echapper, L = M.L, I = M.art.icones;

  var TXT = {
    fr: {
      nouvelles: 'Nouvelles', preparation: 'En préparation', pretes: 'Prêtes',
      lancer: 'Lancer', prete: 'Prête', remise: 'Remise au client', annuler: 'Annuler', annulerConfirm: 'Annuler la commande {c} ?',
      table: 'Table {n}', retrait: 'Retrait {h}', asap: 'Dès que possible', cadeau: 'Carte cadeau', retard: 'En retard',
      vide: 'Rien pour l’instant', kCommandes: 'Commandes du jour', kCa: 'Chiffre d’affaires', kPanier: 'Panier moyen', kPourboires: 'Pourboires',
      pause: 'Mettre en pause', reprendre: 'Reprendre les commandes', pauseOk: 'Commandes en ligne en pause', repriseOk: 'Commandes en ligne rouvertes',
      aucuneVente: 'Pas encore de vente aujourd’hui.', sonOk: 'Son activé : un signal retentit à chaque nouvelle commande.',
      testOk: 'Commande test ajoutée', purgerConfirm: 'Effacer toutes les commandes de démonstration ?', nouvelle: 'Nouvelle commande {c}'
    },
    en: {
      nouvelles: 'New', preparation: 'In progress', pretes: 'Ready',
      lancer: 'Start', prete: 'Ready', remise: 'Handed over', annuler: 'Cancel', annulerConfirm: 'Cancel order {c}?',
      table: 'Table {n}', retrait: 'Pickup {h}', asap: 'ASAP', cadeau: 'Gift card', retard: 'Late',
      vide: 'Nothing yet', kCommandes: 'Orders today', kCa: 'Revenue', kPanier: 'Average basket', kPourboires: 'Tips',
      pause: 'Pause ordering', reprendre: 'Resume ordering', pauseOk: 'Online ordering paused', repriseOk: 'Online ordering resumed',
      aucuneVente: 'No sales yet today.', sonOk: 'Sound on: a chime plays for every new order.',
      testOk: 'Test order added', purgerConfirm: 'Clear all demo orders?', nouvelle: 'New order {c}'
    }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var son = false, audio;
  function carillon() {
    if (!son) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [660, 880].forEach(function (f, i) {
        var o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, audio.currentTime + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.3, audio.currentTime + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + i * 0.18 + 0.4);
        o.connect(g).connect(audio.destination);
        o.start(audio.currentTime + i * 0.18); o.stop(audio.currentTime + i * 0.18 + 0.45);
      });
    } catch (err) { /* audio indisponible */ }
  }

  function duJour(c) {
    var d = new Date(c.cree), a = new Date();
    return d.toDateString() === a.toDateString();
  }
  function echeance(c) {
    if (c.mode === 'table' || !c.creneau) return c.cree + 15 * 60000;
    var n = M.maintenant();
    var aujourdhui = new Date(Date.UTC(n.annee, n.mois - 1, n.jour)).toISOString().slice(0, 10);
    if (c.creneau.date !== aujourdhui) return Infinity;
    return Date.now() + (c.creneau.minutes - n.minutes) * 60000;
  }

  function bon(c) {
    var lieu = c.mode === 'table' ? x('table', { n: e(c.table) }) : c.mode === 'cadeau' ? x('cadeau') : c.creneau && c.creneau.asap ? x('asap') : x('retrait', { h: M.hhmm(c.creneau.minutes) });
    var retard = c.statut !== 'prete' && echeance(c) < Date.now();
    var actions = {
      recue: '<button class="bouton bouton--plein bouton--petit" data-action="preparation">' + I.feu + x('lancer') + '</button>',
      preparation: '<button class="bouton bouton--plein bouton--petit" data-action="prete">' + I.sac_pret + x('prete') + '</button>',
      prete: '<button class="bouton bouton--peche bouton--petit" data-action="recuperee">' + I.coche + x('remise') + '</button>'
    };
    return '<article class="bon" data-statut="' + c.statut + '" data-id="' + c.id + '"' + (retard ? ' data-retard' : '') + '>' +
      '<div class="bon__tete"><span class="bon__code">' + e(c.code) + '</span><span class="bon__heure">' + lieu + '</span></div>' +
      '<div class="petit doux" style="margin:-4px 0 8px">' + e(c.client.prenom) + ' · ' + new Date(c.cree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + (retard ? ' · <strong style="color:var(--alerte)">' + x('retard') + '</strong>' : '') + '</div>' +
      '<ul>' + c.lignes.map(function (l) {
        return '<li><strong>' + l.qte + ' ×</strong> ' + e(l.nom) + (l.options ? '<small>' + e(l.options) + '</small>' : '') + '</li>';
      }).join('') + '</ul>' +
      (c.note ? '<div class="bon__note">✎ ' + e(c.note) + '</div>' : '') +
      '<div class="bon__actions">' + (actions[c.statut] || '') + '<button class="bouton-texte petit" data-action="annulee">' + x('annuler') + '</button></div></article>';
  }

  function rendreTableau() {
    var toutes = M.commandes.toutes();
    var actives = toutes.filter(function (c) { return ['recue', 'preparation', 'prete'].indexOf(c.statut) > -1 && c.mode !== 'cadeau'; })
      .sort(function (a, b) { return echeance(a) - echeance(b); });
    var colonnes = [['recue', x('nouvelles')], ['preparation', x('preparation')], ['prete', x('pretes')]];
    document.querySelector('[data-tableau]').innerHTML = colonnes.map(function (col) {
      var liste = actives.filter(function (c) { return c.statut === col[0]; });
      return '<section class="colonne"><h2>' + col[1] + '<span>' + liste.length + '</span></h2>' +
        (liste.length ? liste.map(bon).join('') : '<p class="petit doux centre" style="padding:24px 0">' + x('vide') + '</p>') + '</section>';
    }).join('');

    var jour = toutes.filter(function (c) { return duJour(c) && c.statut !== 'annulee'; });
    var ca = jour.reduce(function (s, c) { return s + c.total - c.pourboire; }, 0);
    var tips = jour.reduce(function (s, c) { return s + c.pourboire; }, 0);
    document.querySelector('[data-kpis]').innerHTML = [
      [x('kCommandes'), jour.length], [x('kCa'), M.prix(ca)], [x('kPanier'), M.prix(jour.length ? Math.round(ca / jour.length) : 0)], [x('kPourboires'), M.prix(tips)]
    ].map(function (k) { return '<div class="kpi"><small>' + k[0] + '</small><strong>' + k[1] + '</strong></div>'; }).join('');

    var compte = {};
    jour.forEach(function (c) { c.lignes.forEach(function (l) { compte[l.id] = (compte[l.id] || 0) + l.qte; }); });
    var top = Object.keys(compte).sort(function (a, b) { return compte[b] - compte[a]; }).slice(0, 6);
    var max = top.length ? compte[top[0]] : 1;
    document.querySelector('[data-top]').innerHTML = top.length ? top.map(function (id) {
      var p = M.menu.parId[id];
      return '<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.92rem"><span>' + e(L(p.nom)) + '</span><strong>' + compte[id] + '</strong></div>' +
        '<div style="height:8px;border-radius:4px;background:var(--peche-pale);margin-top:4px"><div style="height:100%;width:' + Math.round(compte[id] / max * 100) + '%;background:var(--terracotta);border-radius:4px"></div></div></div>';
    }).join('') : '<p class="doux petit">' + x('aucuneVente') + '</p>';

    var pause = M.commandesEnPause();
    var bp = document.querySelector('[data-pause-bouton]');
    bp.innerHTML = (pause ? I.lecture : I.pause) + (pause ? x('reprendre') : x('pause'));
    bp.className = 'bouton bouton--petit ' + (pause ? 'bouton--peche' : 'bouton--plein');
  }

  function rendreDispos() {
    var indispo = M.stock.lire('indispo', {});
    document.querySelector('[data-dispos]').innerHTML = M.menu.produits.map(function (p) {
      return '<label class="dispo"><span>' + e(L(p.nom)) + '</span><span class="interrupteur"><input type="checkbox" data-dispo="' + p.id + '"' + (indispo[p.id] ? '' : ' checked') + ' aria-label="' + e(L(p.nom)) + '"><span></span></span></label>';
    }).join('');
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('.bon [data-action]');
    if (a) {
      var bonEl = a.closest('[data-id]');
      var c = M.commandes.lire(bonEl.getAttribute('data-id'));
      var statut = a.getAttribute('data-action');
      if (statut === 'annulee' && !window.confirm(x('annulerConfirm', { c: c.code }))) return;
      M.commandes.statut(c.id, statut);
      rendreTableau();
      return;
    }
    if (ev.target.closest('[data-pause-bouton]')) {
      var p = !M.commandesEnPause();
      M.stock.ecrire('pause', p);
      M.toast(p ? x('pauseOk') : x('repriseOk'), p ? 'pause' : 'lecture');
      rendreTableau();
      return;
    }
    if (ev.target.closest('[data-son]')) { son = true; carillon(); M.toast(x('sonOk'), 'cloche'); return; }
    if (ev.target.closest('[data-test]')) { commandeTest(); return; }
    if (ev.target.closest('[data-export]')) { exporter(); return; }
    if (ev.target.closest('[data-purger]') && window.confirm(x('purgerConfirm'))) { M.stock.ecrire('commandes', []); rendreTableau(); }
  });

  document.addEventListener('change', function (ev) {
    var d = ev.target.closest('[data-dispo]');
    if (!d) return;
    var indispo = M.stock.lire('indispo', {});
    if (d.checked) delete indispo[d.getAttribute('data-dispo')]; else indispo[d.getAttribute('data-dispo')] = true;
    M.stock.ecrire('indispo', indispo);
  });

  function commandeTest() {
    var noms = ['Léa', 'Karim', 'Chloé', 'Yanis', 'Inès', 'Hugo', 'Sarah', 'Nabil'];
    var possibles = [
      [{ id: 'benedicte', choix: { garniture: 'saumon', pain: 'levain' } }, { id: 'pistachio', choix: { temp: 'froid', lait: 'avoine' } }],
      [{ id: 'turkish', choix: { pain: 'levain' } }, { id: 'flatwhite', choix: { temp: 'chaud', lait: 'vache' } }, { id: 'pancakes' }],
      [{ id: 'avocado', choix: { pain: 'sg', extras: ['saumon'] } }, { id: 'matcha', choix: { temp: 'froid', lait: 'coco', sucre: 'peu' } }],
      [{ id: 'ube', choix: { temp: 'froid', lait: 'avoine', sucre: 'normal' } }, { id: 'latte', choix: { style: 'cappuccino', temp: 'chaud', lait: 'vache' } }]
    ];
    var choixLignes = possibles[Math.floor(Math.random() * possibles.length)];
    var n = M.maintenant();
    var surTable = Math.random() > 0.5;
    var lignes = choixLignes.map(function (l) {
      var p = M.menu.parId[l.id];
      var ligne = { id: l.id, choix: l.choix || {}, qte: 1, note: '' };
      var pu = M.menu.prixLigne(p, ligne.choix);
      return { id: l.id, choix: ligne.choix, qte: 1, nom: L(p.nom), options: M.libelleOptions(ligne), prixUnitaire: pu, cuisine: !!M.categorieDe(p).cuisine };
    });
    var st = lignes.reduce(function (s, l) { return s + l.prixUnitaire; }, 0);
    M.commandes.creer({
      id: 'c' + Date.now().toString(36), code: M.commandes.nouveauCode(), cree: Date.now(), statut: 'recue', historique: { recue: Date.now() },
      mode: surTable ? 'table' : 'emporter', table: surTable ? String(Math.ceil(Math.random() * 14)) : null,
      creneau: surTable ? null : { date: new Date(Date.UTC(n.annee, n.mois - 1, n.jour)).toISOString().slice(0, 10), minutes: Math.ceil((n.minutes + 20) / 15) * 15, asap: false },
      client: { prenom: noms[Math.floor(Math.random() * noms.length)] }, note: Math.random() > 0.6 ? 'Sans coriandre svp' : '',
      lignes: lignes, sousTotal: st, remise: 0, pourboire: 0, total: st, demo: true, test: true
    });
    carillon();
    M.toast(x('testOk'));
    rendreTableau();
  }

  function exporter() {
    var lignes = [['code', 'date', 'mode', 'table', 'creneau', 'client', 'statut', 'articles', 'sous_total', 'remise', 'pourboire', 'total']];
    M.commandes.toutes().forEach(function (c) {
      lignes.push([c.code, new Date(c.cree).toISOString(), c.mode, c.table || '', c.creneau ? c.creneau.date + ' ' + M.hhmm(c.creneau.minutes) : '', c.client.prenom, c.statut,
        c.lignes.map(function (l) { return l.qte + 'x ' + l.nom; }).join(' | '), (c.sousTotal / 100).toFixed(2), (c.remise / 100).toFixed(2), (c.pourboire / 100).toFixed(2), (c.total / 100).toFixed(2)]);
    });
    var csv = lignes.map(function (l) { return l.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'minubu-commandes-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  var connues = M.commandes.toutes().map(function (c) { return c.id; });
  document.addEventListener('minubu:stockage', function (ev) {
    if (ev.detail.cle === 'commandes') {
      M.commandes.toutes().forEach(function (c) {
        if (connues.indexOf(c.id) === -1) { connues.push(c.id); carillon(); M.toast(x('nouvelle', { c: c.code }), 'cloche'); }
      });
      rendreTableau();
    }
    if (ev.detail.cle === 'indispo') rendreDispos();
    if (ev.detail.cle === 'pause') rendreTableau();
  });
  document.addEventListener('minubu:langue', function () { rendreTableau(); rendreDispos(); });

  rendreTableau();
  rendreDispos();
  setInterval(rendreTableau, 30000);
})();
