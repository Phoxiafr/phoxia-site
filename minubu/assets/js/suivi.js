/* =============================================================
   Minubu : suivi de commande en temps réel
   Le statut est mis à jour par l'écran cuisine (cuisine.html).
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var e = M.echapper, I = M.art.icones;

  var TXT = {
    fr: {
      merci: 'Merci {prenom} !', votreCode: 'Votre numéro de commande', montrez: 'Montrez-le au comptoir',
      introuvable: 'Commande introuvable', introuvableTexte: 'Ce lien ne correspond à aucune commande sur cet appareil.',
      mesCommandes: 'Vos dernières commandes', aucune: 'Aucune commande pour le moment.', commander: 'Commander',
      recue: 'Commande reçue', recueT: 'L’équipe a bien reçu votre commande.',
      preparation: 'En préparation', preparationT: 'Barista et cuisine s’activent.',
      prete: 'Prête !', preteRetrait: 'Votre commande vous attend au comptoir.', preteTable: 'On vous l’apporte à table.',
      recuperee: 'Bonne dégustation', recupereeT: 'Merci d’être passé chez Minubu.',
      annulee: 'Commande annulée', annuleeT: 'Contactez l’équipe au comptoir si besoin.',
      cadeauEnvoye: 'Carte cadeau confirmée', cadeauEnvoyeT: 'Elle sera envoyée par e-mail à la date choisie.',
      retrait: 'Retrait', asap: 'dès que possible', table: 'Table {n}', aujourdhui: 'aujourd’hui',
      detail: 'Détail', total: 'Total payé', remise: 'Boisson offerte', pourboire: 'Pourboire',
      gain: '+{n} tampon(s) sur votre carte fidélité', recompense: 'Bravo : une boisson offerte vous attend dans votre espace fidélité !',
      demo: 'Démo : ouvrez l’<a href="cuisine.html" target="_blank">écran cuisine</a> dans un autre onglet et faites avancer la commande, ce suivi se met à jour instantanément.',
      notif: 'Me prévenir quand c’est prêt', notifOk: 'Vous serez prévenu sur cet appareil.', notifTitre: 'Minubu : votre commande est prête !',
      recommander: 'Recommander la même chose', ajoute: 'Commande ajoutée au panier', voir: 'Voir'
    },
    en: {
      merci: 'Thank you {prenom}!', votreCode: 'Your order number', montrez: 'Show it at the counter',
      introuvable: 'Order not found', introuvableTexte: 'This link doesn’t match any order on this device.',
      mesCommandes: 'Your recent orders', aucune: 'No orders yet.', commander: 'Order',
      recue: 'Order received', recueT: 'The team has received your order.',
      preparation: 'Being prepared', preparationT: 'Barista and kitchen are on it.',
      prete: 'Ready!', preteRetrait: 'Your order is waiting at the counter.', preteTable: 'We’re bringing it to your table.',
      recuperee: 'Enjoy', recupereeT: 'Thanks for visiting Minubu.',
      annulee: 'Order cancelled', annuleeT: 'Please speak to the team at the counter.',
      cadeauEnvoye: 'Gift card confirmed', cadeauEnvoyeT: 'It will be emailed on the chosen date.',
      retrait: 'Pickup', asap: 'as soon as possible', table: 'Table {n}', aujourdhui: 'today',
      detail: 'Details', total: 'Total paid', remise: 'Free drink', pourboire: 'Tip',
      gain: '+{n} stamp(s) on your loyalty card', recompense: 'Well done: a free drink is waiting in your rewards area!',
      demo: 'Demo: open the <a href="cuisine.html" target="_blank">kitchen screen</a> in another tab and move the order along, this page updates instantly.',
      notif: 'Notify me when it’s ready', notifOk: 'You’ll be notified on this device.', notifTitre: 'Minubu: your order is ready!',
      recommander: 'Order the same again', ajoute: 'Order added to your bag', voir: 'View'
    }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var zone = document.querySelector('[data-suivi]');
  var dernierStatut = null;

  // Retour de Stripe Checkout : on enregistre la commande mise en attente
  (function retourPaiement() {
    if (!params.get('session_id')) return;
    var attente = M.stock.lire('commandeEnAttente', null);
    if (attente && attente.id === id && !M.commandes.lire(id)) {
      attente.stripeSession = params.get('session_id');
      M.commandes.creer(attente);
      if (attente.codeFidelite) M.fidelite.utiliser(attente.codeFidelite);
      var r = M.fidelite.crediter(attente.boissons, attente.code);
      M.stock.ecrire('dernierGain', { commande: attente.id, tampons: r.f.membre ? attente.boissons : 0, recompenses: r.nouvelles });
      M.stock.ecrire('commandeEnAttente', null);
      M.panier.vider();
    }
  })();

  function heureCreneau(c) {
    if (!c) return '';
    if (c.asap) return x('asap');
    var n = M.maintenant();
    var aujourdhui = new Date(Date.UTC(n.annee, n.mois - 1, n.jour)).toISOString().slice(0, 10);
    var d = new Date(c.date + 'T12:00:00Z');
    var jour = c.date === aujourdhui ? x('aujourdhui') : M.t('jours')[d.getUTCDay()].toLowerCase() + ' ' + d.getUTCDate() + ' ' + M.t('mois')[d.getUTCMonth()];
    return jour + ', ' + M.hhmm(c.minutes);
  }

  function listeCommandes() {
    var toutes = M.commandes.toutes().slice(0, 8);
    zone.innerHTML = '<h1 style="font-size:2.4rem">' + x('mesCommandes') + '</h1>' +
      (toutes.length ? '<div class="grille">' + toutes.map(function (c) {
        return '<a class="carte" href="suivi.html?id=' + encodeURIComponent(c.id) + '" style="padding:18px 20px;display:flex;justify-content:space-between;gap:12px;align-items:center">' +
          '<span><strong style="font-family:var(--police-titre);font-size:1.2rem;color:var(--encre)">' + e(c.code) + '</strong><br><small class="doux">' + new Date(c.cree).toLocaleString(M.langue() === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) + ' · ' + x(c.statut) + '</small></span>' +
          '<span class="produit__prix">' + M.prix(c.total) + '</span></a>';
      }).join('') + '</div>' : '<div class="vide">' + M.art.cup() + '<p>' + x('aucune') + '</p><a class="bouton bouton--plein" href="carte.html">' + x('commander') + '</a></div>');
  }

  function rendre() {
    if (!id) { listeCommandes(); return; }
    var c = M.commandes.lire(id);
    if (!c) {
      zone.innerHTML = '<div class="vide">' + M.art.cup() + '<h1 style="font-size:2rem">' + x('introuvable') + '</h1><p>' + x('introuvableTexte') + '</p><a class="bouton bouton--plein" href="carte.html">' + x('commander') + '</a></div>';
      return;
    }
    var etapes = ['recue', 'preparation', 'prete', 'recuperee'];
    var rang = etapes.indexOf(c.statut);
    var icones = { recue: I.coche, preparation: I.feu, prete: I.sac_pret, recuperee: I.coeur };
    var textes = {
      recue: x('recueT'), preparation: x('preparationT'),
      prete: c.mode === 'table' ? x('preteTable') : x('preteRetrait'), recuperee: x('recupereeT')
    };
    var frise;
    if (c.mode === 'cadeau') {
      frise = '<ol class="frise"><li data-etat="fait"><span class="frise__point">' + I.cadeau + '</span><div><strong>' + x('cadeauEnvoye') + '</strong><small>' + x('cadeauEnvoyeT') + '</small></div></li></ol>';
    } else if (c.statut === 'annulee') {
      frise = '<div class="message message--alerte">' + I.info + '<span><strong>' + x('annulee') + '</strong><br>' + x('annuleeT') + '</span></div>';
    } else {
      frise = '<ol class="frise">' + etapes.map(function (s, i) {
        var et = i < rang || (i === rang && s === 'recuperee') ? 'fait' : i === rang ? 'encours' : 'avenir';
        if (s === 'prete' && i === rang) et = 'fait';
        var h = c.historique && c.historique[s] ? ' · ' + new Date(c.historique[s]).toLocaleTimeString(M.langue() === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
        return '<li data-etat="' + et + '"><span class="frise__point">' + icones[s] + '</span><div><strong>' + x(s) + '</strong><small>' + textes[s] + h + '</small></div></li>';
      }).join('') + '</ol>';
    }
    var gain = M.stock.lire('dernierGain', null);
    var gainHtml = '';
    if (gain && gain.commande === c.id) {
      if (gain.tampons) gainHtml += '<div class="message message--succes">' + I.etoile + '<span>' + x('gain', { n: gain.tampons }) + '</span></div>';
      if (gain.recompenses) gainHtml += '<div class="message message--succes">' + I.cadeau + '<span><a href="fidelite.html">' + x('recompense') + '</a></span></div>';
    }
    var peutNotifier = 'Notification' in window && Notification.permission !== 'denied' && c.mode !== 'cadeau' && rang < 2;

    zone.innerHTML =
      '<div class="ticket">' +
        '<div class="ticket__tete"><div class="main" style="color:var(--peche)">' + x('merci', { prenom: e(c.client.prenom) }) + '</div>' +
          '<div class="petit" style="opacity:.8">' + x('votreCode') + '</div><div class="ticket__code">' + e(c.code) + '</div>' +
          '<div class="petit" style="opacity:.8">' + (c.mode === 'table' ? x('table', { n: e(c.table) }) : c.mode === 'cadeau' ? '' : x('montrez') + ' · ' + x('retrait') + ' ' + heureCreneau(c.creneau)) + '</div></div>' +
        '<div class="ticket__corps">' +
          gainHtml + frise +
          (peutNotifier ? '<button class="bouton bouton--contour bouton--petit" type="button" data-notifier style="margin-bottom:20px">' + I.cloche + x('notif') + '</button>' : '') +
          (c.demo ? '<div class="message message--info">' + I.info + '<span>' + x('demo') + '</span></div>' : '') +
          '<h2 style="font-size:1.3rem;margin-top:8px">' + x('detail') + '</h2>' +
          c.lignes.map(function (l) {
            return '<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px dashed var(--ligne)"><span><strong>' + l.qte + ' × ' + e(l.nom) + '</strong>' + (l.options ? '<br><small class="doux">' + e(l.options) + '</small>' : '') + '</span><span style="white-space:nowrap">' + M.prix(l.prixUnitaire * l.qte) + '</span></div>';
          }).join('') +
          '<div class="recap espace-haut">' +
            (c.remise ? '<div class="recap__remise"><span>' + x('remise') + '</span><span>−' + M.prix(c.remise) + '</span></div>' : '') +
            (c.pourboire ? '<div><span>' + x('pourboire') + '</span><span>' + M.prix(c.pourboire) + '</span></div>' : '') +
            '<div class="recap__total"><span>' + x('total') + '</span><span>' + M.prix(c.total) + '</span></div></div>' +
          (c.mode !== 'cadeau' ? '<button class="bouton bouton--peche bouton--large" type="button" data-recommander>' + x('recommander') + '</button>' : '') +
        '</div>' +
      '</div>';

    if (dernierStatut && dernierStatut !== c.statut && c.statut === 'prete') {
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
      if ('Notification' in window && Notification.permission === 'granted') {
        try { new Notification(x('notifTitre'), { body: c.code, icon: 'assets/img/icone-192.png' }); } catch (err) { /* ignoré */ }
      }
    }
    dernierStatut = c.statut;
  }

  zone.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-notifier]')) {
      Notification.requestPermission().then(function (p) { if (p === 'granted') M.toast(x('notifOk'), 'cloche'); rendre(); });
    }
    if (ev.target.closest('[data-recommander]')) {
      var c = M.commandes.lire(id);
      c.lignes.forEach(function (l) {
        if (l.cadeau || !M.estDisponible(l.id)) return;
        M.panier.ajouter({ id: l.id, choix: l.choix, qte: l.qte, note: l.note, perso: l.perso });
      });
      M.toast(x('ajoute'));
      M.ouvrirPanier();
    }
  });

  rendre();
  document.addEventListener('minubu:langue', rendre);
  document.addEventListener('minubu:stockage', function (ev) { if (ev.detail.cle === 'commandes') rendre(); });
})();
