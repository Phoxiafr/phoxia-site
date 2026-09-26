/* =============================================================
   Minubu : carte de fidélité digitale
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var e = M.echapper, I = M.art.icones;
  var SEUIL = M.config.fidelite.tamponsPourRecompense;

  var TXT = {
    fr: {
      creer: 'Créer ma carte', prenom: 'Prénom', email: 'E-mail', consent: 'J’accepte que Minubu conserve mon prénom et mon e-mail pour gérer ma carte de fidélité. Désinscription en un clic.',
      inscription: 'Rejoignez le club', inscriptionT: 'Gratuit, sans application à installer.', bienvenue: 'Bienvenue {prenom} ! Votre carte est prête.',
      carte: 'Carte fidélité', membre: 'Membre n° {n}', reste: 'Plus que {n} boisson(s) avant la prochaine offerte', offerte: 'offerte',
      recompenses: 'Vos boissons offertes', aucuneRecompense: 'Vos codes apparaîtront ici dès votre 9e tampon.', copier: 'Copier', copie: 'Code copié',
      utiliser: 'À saisir dans le champ « Code fidélité » au moment de payer. Valable sur une boisson jusqu’à {max}.',
      historique: 'Historique', commande: 'Commande {ref}', tampons: '+{n} tampon(s)', aucunHistorique: 'Aucun passage pour le moment.',
      commander: 'Commander une boisson', demo: 'Démo : ajouter un tampon', quitter: 'Supprimer ma carte de cet appareil', quitterConfirm: 'Supprimer votre carte fidélité et vos tampons de cet appareil ?',
      erreurs: 'Merci de compléter le formulaire.', gagne: 'Bravo ! Une boisson offerte vient d’être débloquée.'
    },
    en: {
      creer: 'Create my card', prenom: 'First name', email: 'Email', consent: 'I agree that Minubu keeps my first name and email to manage my loyalty card. Unsubscribe in one click.',
      inscription: 'Join the club', inscriptionT: 'Free, no app to install.', bienvenue: 'Welcome {prenom}! Your card is ready.',
      carte: 'Loyalty card', membre: 'Member no. {n}', reste: 'Just {n} more drink(s) until your next free one', offerte: 'free',
      recompenses: 'Your free drinks', aucuneRecompense: 'Your codes will appear here on your 9th stamp.', copier: 'Copy', copie: 'Code copied',
      utiliser: 'Enter it in the “Reward code” field at checkout. Valid on one drink up to {max}.',
      historique: 'History', commande: 'Order {ref}', tampons: '+{n} stamp(s)', aucunHistorique: 'No visits yet.',
      commander: 'Order a drink', demo: 'Demo: add a stamp', quitter: 'Remove my card from this device', quitterConfirm: 'Remove your loyalty card and stamps from this device?',
      erreurs: 'Please complete the form.', gagne: 'Well done! A free drink has just been unlocked.'
    }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var zone = document.querySelector('[data-fidelite]');

  function rendre() {
    var f = M.fidelite.lire();
    if (!f.membre) {
      zone.innerHTML =
        '<div class="carte-fidelite" aria-hidden="true"><div class="carte-fidelite__haut"><h2>minubu</h2><span class="main" style="color:var(--peche)">' + x('carte') + '</span></div>' + tampons(3) + '</div>' +
        '<form class="etape" data-inscription novalidate style="margin:0"><div class="etape__titre"><h2>' + x('inscription') + '</h2></div><p class="doux" style="margin-top:-8px">' + x('inscriptionT') + '</p>' +
          '<div class="champ"><label for="f-prenom">' + x('prenom') + '</label><input id="f-prenom" name="prenom" autocomplete="given-name" required value="' + e(M.stock.lire('client', {}).prenom || '') + '"></div>' +
          '<div class="champ"><label for="f-email">' + x('email') + '</label><input id="f-email" name="email" type="email" autocomplete="email" required value="' + e(M.stock.lire('client', {}).email || '') + '"></div>' +
          '<label class="case"><input type="checkbox" name="consent" required><span>' + x('consent') + '</span></label>' +
          '<button class="bouton bouton--plein bouton--large" type="submit">' + x('creer') + '</button></form>';
      return;
    }
    var dispo = f.recompenses.filter(function (r) { return !r.utilise; });
    zone.innerHTML =
      '<div><div class="carte-fidelite"><div class="carte-fidelite__haut"><div><h2>minubu</h2><span class="petit">' + x('membre', { n: e(f.membre.numero) }) + '</span></div><span class="main" style="color:var(--peche)">' + e(f.membre.prenom) + '</span></div>' +
        tampons(f.tampons) +
        '<div class="carte-fidelite__pied"><span>' + x('reste', { n: SEUIL - f.tampons }) + '</span></div></div>' +
        '<div class="ligne-actions espace-haut"><a class="bouton bouton--plein" href="carte.html#lattebar">' + x('commander') + '</a>' +
          (M.config.endpointPaiement ? '' : '<button class="bouton bouton--contour" type="button" data-demo-tampon>' + x('demo') + '</button>') + '</div></div>' +
      '<div>' +
        '<div class="etape"><div class="etape__titre"><h2>' + x('recompenses') + '</h2></div>' +
          (dispo.length ? dispo.map(function (r) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px"><span class="code-recompense" style="border:1.5px dashed var(--bordeaux)">' + e(r.code) + '</span>' +
              '<button class="bouton bouton--contour bouton--petit" type="button" data-copier="' + e(r.code) + '">' + x('copier') + '</button></div>';
          }).join('') + '<p class="petit doux">' + x('utiliser', { max: M.prix(M.config.fidelite.valeurRecompenseMax) }) + '</p>' : '<p class="doux">' + x('aucuneRecompense') + '</p>') +
        '</div>' +
        '<div class="etape"><div class="etape__titre"><h2>' + x('historique') + '</h2></div>' +
          (f.historique.length ? f.historique.slice(0, 8).map(function (h) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--ligne)"><span>' + (h.ref ? x('commande', { ref: e(h.ref) }) : 'Minubu') + '<br><small class="doux">' + new Date(h.date).toLocaleDateString(M.langue() === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'medium' }) + '</small></span><strong style="color:var(--terracotta)">' + x('tampons', { n: h.tampons }) + '</strong></div>';
          }).join('') : '<p class="doux">' + x('aucunHistorique') + '</p>') +
        '</div>' +
        '<button class="bouton-texte petit" type="button" data-quitter>' + x('quitter') + '</button>' +
      '</div>';
  }

  function tampons(n) {
    var h = '<div class="tampons">';
    for (var i = 0; i < SEUIL; i++) {
      h += '<div class="tampon"' + (i < n ? ' data-plein style="animation-delay:' + (i * 60) + 'ms"' : '') + '>' + (i < n ? M.art.stamp() : (i + 1)) + '</div>';
    }
    h += '<div class="tampon tampon--cadeau">' + I.cadeau.replace('<svg', '<svg style="width:50%;height:50%"') + '</div></div>';
    return h;
  }

  zone.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target;
    if (!f.prenom.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) || !f.consent.checked) { M.toast(x('erreurs'), 'info'); return; }
    M.fidelite.inscrire(f.prenom.value.trim(), f.email.value.trim());
    M.toast(x('bienvenue', { prenom: f.prenom.value.trim() }), 'etoile');
    rendre();
  });
  zone.addEventListener('click', function (ev) {
    var c = ev.target.closest('[data-copier]');
    if (c) {
      var code = c.getAttribute('data-copier');
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(function () { M.toast(x('copie')); }, function () { M.toast(code); });
      else M.toast(code);
      return;
    }
    if (ev.target.closest('[data-demo-tampon]')) {
      var r = M.fidelite.crediter(1, null);
      if (r.nouvelles) M.toast(x('gagne'), 'cadeau');
      rendre();
      return;
    }
    if (ev.target.closest('[data-quitter]') && window.confirm(x('quitterConfirm'))) {
      M.fidelite.ecrire({ membre: null, tampons: 0, recompenses: [], historique: [] });
      rendre();
    }
  });

  rendre();
  document.addEventListener('minubu:langue', rendre);
  document.addEventListener('minubu:stockage', function (ev) { if (ev.detail.cle === 'fidelite') rendre(); });
})();
