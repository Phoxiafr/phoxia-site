/* =============================================================
   Minubu : tunnel de commande et paiement
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var C = M.config;
  var e = M.echapper, L = M.L;
  var I = M.art.icones;

  var TXT = {
    fr: {
      vide: 'Votre panier est vide.', videCta: 'Voir la carte',
      e1: 'Comment ?', emporter: 'Click & collect', emporterAide: 'Je récupère ma commande au comptoir',
      surPlace: 'Sur place', surPlaceAide: 'On m’apporte tout à table', numTable: 'Numéro de table',
      e2: 'Quand ?', asap: 'Dès que possible (environ {n} min)', aucunCreneau: 'Aucun créneau disponible ce jour-là.',
      platsLimites: 'Votre panier contient des plats : créneaux limités aux horaires de la cuisine ({d} à {f}).',
      fermeCuisine: 'Cuisine fermée',
      e3: 'Vos coordonnées', prenom: 'Prénom', tel: 'Téléphone', email: 'E-mail', emailAide: 'Pour recevoir votre reçu.',
      sms: 'Prévenez-moi par SMS quand ma commande est prête', note: 'Un mot pour l’équipe ?', notePh: 'Ex. : couverts, allergie, table en terrasse…',
      e4: 'Pourboire', pourboireAide: 'Reversé intégralement à l’équipe.', aucun: 'Non merci',
      code: 'Code fidélité', codePh: 'CAFE-XXXXX', appliquer: 'Appliquer', codeOk: 'Boisson offerte appliquée', codeKo: 'Ce code n’est pas valide ou a déjà été utilisé.',
      codeSansBoisson: 'Ajoutez une boisson pour utiliser votre récompense.', retirerCode: 'Retirer',
      recap: 'Récapitulatif', sousTotal: 'Sous-total', remise: 'Boisson offerte', pourboire: 'Pourboire', total: 'Total',
      cgv: 'J’accepte les <a href="mentions.html#cgv" target="_blank">conditions générales de vente</a>.',
      payer: 'Payer {prix}', paiement: 'Paiement sécurisé par Stripe : carte bancaire, Apple Pay, Google Pay.',
      tampons: 'Cette commande vous rapporte {n} tampon(s) fidélité.', tamponsInscription: '<a href="fidelite.html">Créez votre carte fidélité</a> pour gagner {n} tampon(s) avec cette commande.',
      erreurs: 'Merci de compléter les champs indiqués.', erreurCreneau: 'Choisissez un créneau de retrait.', erreurTable: 'Indiquez votre numéro de table.',
      erreurPrenom: 'Indiquez votre prénom.', erreurEmail: 'Indiquez un e-mail valide.', erreurTel: 'Indiquez un numéro valide.', erreurCgv: 'Merci d’accepter les CGV.',
      pause: 'Les commandes en ligne sont momentanément en pause. Réessayez dans quelques minutes.',
      traitement: 'Paiement en cours…', demoTitre: 'Paiement simulé', demoTexte: 'En mode démonstration, aucun paiement n’est débité. Une fois Stripe branché, vos clients paient ici par carte, Apple Pay ou Google Pay.',
      confirmer: 'Simuler le paiement', annuler: 'Annuler', erreurPaiement: 'Le paiement n’a pas pu démarrer. Réessayez ou payez au comptoir.',
      cadeauxSeuls: 'Cartes cadeaux envoyées par e-mail : pas de retrait nécessaire.',
      aujourdhui: 'Aujourd’hui', demain: 'Demain', ferme: 'Fermé'
    },
    en: {
      vide: 'Your bag is empty.', videCta: 'See the menu',
      e1: 'How?', emporter: 'Click & collect', emporterAide: 'I’ll pick up my order at the counter',
      surPlace: 'Dine in', surPlaceAide: 'Bring everything to my table', numTable: 'Table number',
      e2: 'When?', asap: 'As soon as possible (about {n} min)', aucunCreneau: 'No slots available that day.',
      platsLimites: 'Your bag contains food: slots limited to kitchen hours ({d} to {f}).',
      fermeCuisine: 'Kitchen closed',
      e3: 'Your details', prenom: 'First name', tel: 'Phone', email: 'Email', emailAide: 'To receive your receipt.',
      sms: 'Text me when my order is ready', note: 'A note for the team?', notePh: 'E.g. cutlery, allergy, terrace table…',
      e4: 'Tip', pourboireAide: 'Goes entirely to the team.', aucun: 'No thanks',
      code: 'Reward code', codePh: 'CAFE-XXXXX', appliquer: 'Apply', codeOk: 'Free drink applied', codeKo: 'This code is invalid or already used.',
      codeSansBoisson: 'Add a drink to use your reward.', retirerCode: 'Remove',
      recap: 'Summary', sousTotal: 'Subtotal', remise: 'Free drink', pourboire: 'Tip', total: 'Total',
      cgv: 'I accept the <a href="mentions.html#cgv" target="_blank">terms of sale</a>.',
      payer: 'Pay {prix}', paiement: 'Secure payment by Stripe: card, Apple Pay, Google Pay.',
      tampons: 'This order earns you {n} loyalty stamp(s).', tamponsInscription: '<a href="fidelite.html">Create your loyalty card</a> to earn {n} stamp(s) with this order.',
      erreurs: 'Please complete the highlighted fields.', erreurCreneau: 'Choose a pickup slot.', erreurTable: 'Enter your table number.',
      erreurPrenom: 'Enter your first name.', erreurEmail: 'Enter a valid email.', erreurTel: 'Enter a valid phone number.', erreurCgv: 'Please accept the terms.',
      pause: 'Online ordering is paused for a moment. Please try again in a few minutes.',
      traitement: 'Processing payment…', demoTitre: 'Simulated payment', demoTexte: 'In demo mode no payment is taken. Once Stripe is connected, customers pay here by card, Apple Pay or Google Pay.',
      confirmer: 'Simulate payment', annuler: 'Cancel', erreurPaiement: 'Payment could not start. Please try again or pay at the counter.',
      cadeauxSeuls: 'Gift cards are sent by email: no pickup needed.',
      aujourdhui: 'Today', demain: 'Tomorrow', ferme: 'Closed'
    }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var client = M.stock.lire('client', { prenom: '', tel: '', email: '', sms: true });
  var etat = {
    mode: M.table() ? 'table' : 'emporter',
    table: M.table() || '',
    jour: 0,
    creneau: null, // { date, minutes, asap }
    pourboire: 0,
    code: null
  };

  /* ---------- Créneaux ---------- */
  function jourDecale(i) {
    var n = M.maintenant();
    var d = new Date(Date.UTC(n.annee, n.mois - 1, n.jour + i));
    return { i: i, date: d.toISOString().slice(0, 10), semaine: d.getUTCDay(), jour: d.getUTCDate(), mois: d.getUTCMonth() };
  }
  function seulementCadeaux() {
    var l = M.panier.lignes();
    return l.length > 0 && l.every(function (x) { return x.id === 'carte-cadeau'; });
  }
  function creneauxDu(j) {
    var R = C.retrait;
    var ouvre = M.plage(C.horaires, j.semaine);
    if (!ouvre) return [];
    var debut = ouvre.debut, fin = ouvre.fin - R.dernierCreneauAvantFermeture;
    if (M.panier.contientCuisine()) {
      var cu = M.plage(C.cuisine, j.semaine);
      if (!cu) return [];
      debut = Math.max(debut, cu.debut); fin = Math.min(fin, cu.fin - R.dernierCreneauAvantFermeture);
    }
    if (j.i === 0) {
      var mini = M.maintenant().minutes + R.delaiMinimumMinutes;
      debut = Math.max(debut, Math.ceil(mini / R.pasMinutes) * R.pasMinutes);
    }
    var liste = [];
    for (var m = debut; m <= fin; m += R.pasMinutes) liste.push(m);
    return liste;
  }

  /* ---------- Totaux ---------- */
  function boissonsDuPanier() {
    var liste = [];
    M.panier.lignes().forEach(function (l) {
      var p = M.menu.parId[l.id];
      if (p && p.tags.indexOf('boisson') > -1) for (var k = 0; k < l.qte; k++) liste.push(M.panier.prixUnitaire(l));
    });
    return liste;
  }
  function totaux() {
    var st = M.panier.sousTotal();
    var remise = 0;
    if (etat.code) {
      var b = boissonsDuPanier();
      if (b.length) remise = Math.min(Math.max.apply(null, b), C.fidelite.valeurRecompenseMax);
    }
    var base = st - remise;
    var pourboire = Math.round(base * etat.pourboire / 100);
    return { sousTotal: st, remise: remise, pourboire: pourboire, total: base + pourboire, boissons: boissonsDuPanier().length };
  }

  /* ---------- Rendu ---------- */
  var racine = document.querySelector('[data-commande]');

  function rendre() {
    if (!M.panier.nombre()) {
      racine.innerHTML = '<div class="vide">' + M.art.cup() + '<p><strong>' + x('vide') + '</strong></p><a class="bouton bouton--plein" href="carte.html">' + x('videCta') + '</a></div>';
      return;
    }
    var cadeaux = seulementCadeaux();
    var tableUrl = M.table();
    racine.innerHTML =
      '<div class="mise-en-page-commande espace-haut">' +
        '<form data-formulaire novalidate>' +
          (M.commandesEnPause() ? '<div class="message message--alerte">' + I.pause + '<span>' + x('pause') + '</span></div>' : '') +
          (cadeaux ? '<div class="message message--info">' + I.cadeau + '<span>' + x('cadeauxSeuls') + '</span></div>' :
          '<div class="etape"><div class="etape__titre"><span class="etape__numero">1</span><h2>' + x('e1') + '</h2></div>' +
            '<div class="choix-grille" style="grid-template-columns:1fr 1fr">' +
              '<div class="choix"><input type="radio" name="mode" id="mode-emporter" value="emporter"' + (etat.mode === 'emporter' ? ' checked' : '') + '><label for="mode-emporter" style="flex-direction:column;align-items:flex-start"><strong>' + x('emporter') + '</strong><small style="white-space:normal;font-weight:500">' + x('emporterAide') + '</small></label></div>' +
              '<div class="choix"><input type="radio" name="mode" id="mode-table" value="table"' + (etat.mode === 'table' ? ' checked' : '') + '><label for="mode-table" style="flex-direction:column;align-items:flex-start"><strong>' + x('surPlace') + '</strong><small style="white-space:normal;font-weight:500">' + x('surPlaceAide') + '</small></label></div>' +
            '</div>' +
            '<div class="champ espace-haut" data-zone-table' + (etat.mode === 'table' ? '' : ' hidden') + '><label for="table">' + x('numTable') + '</label><input id="table" name="table" inputmode="numeric" maxlength="3" value="' + e(etat.table) + '"' + (tableUrl ? ' readonly' : '') + '><span class="erreur" data-erreur="table"></span></div>' +
          '</div>' +
          '<div class="etape" data-etape-creneau' + (etat.mode === 'table' ? ' hidden' : '') + '><div class="etape__titre"><span class="etape__numero">2</span><h2>' + x('e2') + '</h2></div><div data-creneaux></div><span class="erreur petit" data-erreur="creneau" style="color:var(--alerte);font-weight:600"></span></div>') +
          '<div class="etape"><div class="etape__titre"><span class="etape__numero">' + (cadeaux ? 1 : 3) + '</span><h2>' + x('e3') + '</h2></div>' +
            '<div class="champs-2">' +
              '<div class="champ"><label for="prenom">' + x('prenom') + '</label><input id="prenom" name="prenom" autocomplete="given-name" value="' + e(client.prenom) + '" required><span class="erreur" data-erreur="prenom"></span></div>' +
              '<div class="champ"><label for="tel">' + x('tel') + '</label><input id="tel" name="tel" type="tel" autocomplete="tel" value="' + e(client.tel) + '" required><span class="erreur" data-erreur="tel"></span></div>' +
            '</div>' +
            '<div class="champ"><label for="email">' + x('email') + '</label><input id="email" name="email" type="email" autocomplete="email" value="' + e(client.email) + '" required><span class="aide">' + x('emailAide') + '</span><span class="erreur" data-erreur="email"></span></div>' +
            '<label class="case"><input type="checkbox" name="sms"' + (client.sms ? ' checked' : '') + '><span>' + x('sms') + '</span></label>' +
            '<div class="champ"><label for="note">' + x('note') + '</label><textarea id="note" name="note" maxlength="300" placeholder="' + x('notePh') + '"></textarea></div>' +
          '</div>' +
          '<div class="etape"><div class="etape__titre"><span class="etape__numero">' + (cadeaux ? 2 : 4) + '</span><h2>' + x('e4') + '</h2></div>' +
            '<p class="petit doux" style="margin-top:-8px">' + x('pourboireAide') + '</p>' +
            '<div class="pourboires" data-pourboires></div>' +
            // Les codes fidélité sont vérifiés dans le navigateur : ils ne sont proposés qu'en démonstration
            // tant que la fidélité n'est pas gérée côté serveur (voir LISEZ-MOI.md).
            (C.endpointPaiement ? '' : '<div class="champ espace-haut"><label for="code">' + x('code') + '</label><div class="code-promo"><input id="code" name="code" placeholder="' + x('codePh') + '" autocomplete="off" style="text-transform:uppercase"><button class="bouton bouton--contour bouton--petit" type="button" data-appliquer>' + x('appliquer') + '</button></div><span class="aide" data-code-message></span></div>') +
          '</div>' +
        '</form>' +
        '<aside class="colonne-collante"><div class="etape"><div class="etape__titre"><h2>' + x('recap') + '</h2></div><div data-recap></div></div></aside>' +
      '</div>';

    if (!cadeaux) rendreCreneaux();
    rendrePourboires();
    rendreRecap();
  }

  function rendreCreneaux() {
    var zone = racine.querySelector('[data-creneaux]');
    if (!zone) return;
    var jours = [];
    for (var i = 0; i <= C.retrait.joursAVenir; i++) jours.push(jourDecale(i));
    var T = M.t;
    var html = '<div class="jours" role="group">' + jours.map(function (j) {
      var n = creneauxDu(j).length;
      var libelle = j.i === 0 ? x('aujourdhui') : j.i === 1 ? x('demain') : T('jours')[j.semaine];
      return '<button type="button" class="jour" data-jour="' + j.i + '" aria-pressed="' + (etat.jour === j.i) + '"' + (n ? '' : ' disabled') + '><strong>' + libelle + '</strong><small>' +
        (n ? T('joursCourts')[j.semaine] + ' ' + j.jour + ' ' + T('mois')[j.mois] : (M.panier.contientCuisine() && M.plage(C.horaires, j.semaine) ? x('fermeCuisine') : x('ferme'))) + '</small></button>';
    }).join('') + '</div>';

    // Si le jour sélectionné n'a plus de créneau, basculer sur le premier jour disponible
    if (!creneauxDu(jours[etat.jour]).length) {
      var premier = jours.filter(function (j) { return creneauxDu(j).length; })[0];
      if (premier) etat.jour = premier.i;
      html = html.replace(/aria-pressed="true"/g, 'aria-pressed="false"').replace('data-jour="' + etat.jour + '" aria-pressed="false"', 'data-jour="' + etat.jour + '" aria-pressed="true"');
    }
    var j = jours[etat.jour];
    var liste = creneauxDu(j);
    if (M.panier.contientCuisine()) {
      var cu = M.plage(C.cuisine, j.semaine);
      if (cu) html += '<p class="petit doux">' + x('platsLimites', { d: M.hhmm(cu.debut), f: M.hhmm(cu.fin) }) + '</p>';
    }
    if (!liste.length) html += '<p class="doux">' + x('aucunCreneau') + '</p>';
    else {
      var asapPossible = j.i === 0 && M.etatOuverture().ouvert && (!M.panier.contientCuisine() || M.etatOuverture().cuisine) && liste[0] - M.maintenant().minutes <= C.retrait.delaiMinimumMinutes + C.retrait.pasMinutes;
      html += '<div class="creneaux" role="group">' +
        (asapPossible ? '<button type="button" class="creneau creneau--asap" data-creneau="asap" aria-pressed="' + !!(etat.creneau && etat.creneau.asap) + '">' + x('asap', { n: C.retrait.delaiMinimumMinutes }) + '</button>' : '') +
        liste.map(function (m) {
          var actif = etat.creneau && !etat.creneau.asap && etat.creneau.date === j.date && etat.creneau.minutes === m;
          return '<button type="button" class="creneau" data-creneau="' + m + '" aria-pressed="' + !!actif + '">' + M.hhmm(m) + '</button>';
        }).join('') + '</div>';
    }
    zone.innerHTML = html;
  }

  function rendrePourboires() {
    var zone = racine.querySelector('[data-pourboires]');
    var base = M.panier.sousTotal() - totaux().remise;
    zone.innerHTML = C.pourboires.map(function (p) {
      return '<button type="button" data-pourboire="' + p + '" aria-pressed="' + (etat.pourboire === p) + '">' + (p ? p + ' %' : x('aucun')) +
        (p ? '<small>' + M.prix(Math.round(base * p / 100)) + '</small>' : '<small>&nbsp;</small>') + '</button>';
    }).join('');
  }

  function rendreRecap() {
    var zone = racine.querySelector('[data-recap]');
    if (!zone) return;
    var tt = totaux();
    var f = M.fidelite.lire();
    var fid = tt.boissons ? (f.membre ? x('tampons', { n: tt.boissons }) : x('tamponsInscription', { n: tt.boissons })) : '';
    zone.innerHTML =
      M.panier.lignes().map(function (l) { return M.ligneHTML(l, false); }).join('') +
      '<div class="recap espace-haut">' +
        '<div><span>' + x('sousTotal') + '</span><span>' + M.prix(tt.sousTotal) + '</span></div>' +
        (tt.remise ? '<div class="recap__remise"><span>' + x('remise') + ' <button type="button" class="bouton-texte petit" data-retirer-code>' + x('retirerCode') + '</button></span><span>−' + M.prix(tt.remise) + '</span></div>' : '') +
        (tt.pourboire ? '<div><span>' + x('pourboire') + ' (' + etat.pourboire + ' %)</span><span>' + M.prix(tt.pourboire) + '</span></div>' : '') +
        '<div class="recap__total"><span>' + x('total') + '</span><span>' + M.prix(tt.total) + '</span></div>' +
      '</div>' +
      (fid ? '<div class="message message--info">' + I.etoile + '<span>' + fid + '</span></div>' : '') +
      '<label class="case"><input type="checkbox" data-cgv><span>' + x('cgv') + '</span></label>' +
      '<span class="erreur petit" data-erreur="cgv" style="color:var(--alerte);font-weight:600;display:block;margin-bottom:8px"></span>' +
      '<button class="bouton bouton--plein bouton--large" type="button" data-payer' + (M.commandesEnPause() ? ' disabled' : '') + '>' + I.cadenas + x('payer', { prix: M.prix(tt.total) }) + '</button>' +
      '<div class="moyens-paiement" aria-hidden="true"><span class="moyen">VISA</span><span class="moyen">MASTERCARD</span><span class="moyen">CB</span><span class="moyen">APPLE PAY</span><span class="moyen">GOOGLE PAY</span></div>' +
      '<p class="securite">' + I.cadenas + '<span>' + x('paiement') + '</span></p>';
  }

  /* ---------- Interactions ---------- */
  racine.addEventListener('change', function (ev) {
    if (ev.target.name === 'mode') {
      etat.mode = ev.target.value;
      racine.querySelector('[data-zone-table]').hidden = etat.mode !== 'table';
      racine.querySelector('[data-etape-creneau]').hidden = etat.mode === 'table';
    }
  });
  racine.addEventListener('input', function (ev) {
    if (ev.target.name === 'table') etat.table = ev.target.value.trim();
  });
  racine.addEventListener('click', function (ev) {
    var j = ev.target.closest('[data-jour]');
    if (j) { etat.jour = +j.getAttribute('data-jour'); etat.creneau = null; rendreCreneaux(); return; }
    var c = ev.target.closest('[data-creneau]');
    if (c) {
      var jour = jourDecale(etat.jour);
      var v = c.getAttribute('data-creneau');
      etat.creneau = v === 'asap' ? { date: jour.date, minutes: M.maintenant().minutes + C.retrait.delaiMinimumMinutes, asap: true } : { date: jour.date, minutes: +v, asap: false };
      rendreCreneaux();
      var err = racine.querySelector('[data-erreur="creneau"]'); if (err) err.textContent = '';
      return;
    }
    var p = ev.target.closest('[data-pourboire]');
    if (p) { etat.pourboire = +p.getAttribute('data-pourboire'); rendrePourboires(); rendreRecap(); return; }
    if (ev.target.closest('[data-appliquer]')) { appliquerCode(); return; }
    if (ev.target.closest('[data-retirer-code]')) { etat.code = null; racine.querySelector('[data-code-message]').textContent = ''; rendrePourboires(); rendreRecap(); return; }
    if (ev.target.closest('[data-payer]')) payer();
  });
  racine.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && ev.target.id === 'code') { ev.preventDefault(); appliquerCode(); }
  });

  function appliquerCode() {
    var champ = racine.querySelector('#code');
    var msg = racine.querySelector('[data-code-message]');
    var r = M.fidelite.recompenseValide(champ.value);
    if (!r) { msg.textContent = x('codeKo'); msg.style.color = 'var(--alerte)'; return; }
    if (!boissonsDuPanier().length) { msg.textContent = x('codeSansBoisson'); msg.style.color = 'var(--alerte)'; return; }
    etat.code = r.code;
    msg.textContent = x('codeOk'); msg.style.color = 'var(--succes)';
    rendrePourboires(); rendreRecap();
  }

  function erreur(nom, texte) {
    var el = racine.querySelector('[data-erreur="' + nom + '"]');
    if (el) el.textContent = texte || '';
    var champ = racine.querySelector('[name="' + nom + '"]');
    if (champ) champ.setAttribute('aria-invalid', texte ? 'true' : 'false');
    return !texte;
  }

  function valider() {
    var f = racine.querySelector('[data-formulaire]');
    var ok = true, premier = null;
    function verifier(nom, condition, message) {
      var bon = erreur(nom, condition ? '' : message);
      if (!bon) { ok = false; premier = premier || racine.querySelector('[name="' + nom + '"]') || racine.querySelector('[data-erreur="' + nom + '"]'); }
    }
    var cadeaux = seulementCadeaux();
    if (!cadeaux) {
      if (etat.mode === 'table') verifier('table', /^\d{1,3}$/.test(etat.table), x('erreurTable'));
      else verifier('creneau', !!etat.creneau, x('erreurCreneau'));
    }
    verifier('prenom', f.prenom.value.trim().length >= 1, x('erreurPrenom'));
    verifier('tel', /^[+\d][\d\s.-]{7,}$/.test(f.tel.value.trim()), x('erreurTel'));
    verifier('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), x('erreurEmail'));
    var cgv = racine.querySelector('[data-cgv]');
    verifier('cgv', cgv.checked, x('erreurCgv'));
    if (!ok && premier) { premier.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (premier.focus) premier.focus({ preventScroll: true }); }
    return ok;
  }

  function construireCommande() {
    var f = racine.querySelector('[data-formulaire]');
    var tt = totaux();
    client = { prenom: f.prenom.value.trim(), tel: f.tel.value.trim(), email: f.email.value.trim(), sms: f.sms.checked };
    M.stock.ecrire('client', client);
    var cadeaux = seulementCadeaux();
    return {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      code: M.commandes.nouveauCode(),
      cree: Date.now(),
      statut: 'recue',
      historique: { recue: Date.now() },
      langue: M.langue(),
      mode: cadeaux ? 'cadeau' : etat.mode,
      table: etat.mode === 'table' ? etat.table : null,
      creneau: cadeaux || etat.mode === 'table' ? null : etat.creneau,
      client: client,
      note: f.note.value.trim(),
      lignes: M.panier.lignes().map(function (l) {
        var p = M.menu.parId[l.id];
        return { id: l.id, choix: l.choix, montant: l.montant, cadeau: l.cadeau, perso: l.perso, note: l.note, qte: l.qte,
          nom: (l.perso && l.perso.titre) || L(p.nom), options: M.libelleOptions(l), prixUnitaire: M.panier.prixUnitaire(l), cuisine: !!M.categorieDe(p).cuisine };
      }),
      sousTotal: tt.sousTotal, remise: tt.remise, pourboire: tt.pourboire, total: tt.total,
      codeFidelite: etat.code, boissons: tt.boissons,
      demo: !C.endpointPaiement
    };
  }

  function finaliser(commande) {
    M.commandes.creer(commande);
    if (commande.codeFidelite) M.fidelite.utiliser(commande.codeFidelite);
    var r = M.fidelite.crediter(commande.boissons, commande.code);
    M.stock.ecrire('dernierGain', { commande: commande.id, tampons: r.f.membre ? commande.boissons : 0, recompenses: r.nouvelles });
    M.panier.vider();
    location.href = 'suivi.html?id=' + encodeURIComponent(commande.id);
  }

  function payer() {
    if (M.commandesEnPause()) { M.toast(x('pause'), 'info'); return; }
    if (!valider()) { M.toast(x('erreurs'), 'info'); return; }
    var commande = construireCommande();
    var bouton = racine.querySelector('[data-payer]');

    if (C.endpointPaiement) {
      bouton.disabled = true; bouton.textContent = x('traitement');
      M.stock.ecrire('commandeEnAttente', commande);
      fetch(C.endpointPaiement, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commande: { id: commande.id, code: commande.code, mode: commande.mode, table: commande.table, creneau: commande.creneau, client: commande.client, note: commande.note, pourboirePourcent: etat.pourboire, codeFidelite: commande.codeFidelite, langue: commande.langue },
          lignes: commande.lignes.map(function (l) { return { id: l.id, choix: l.choix, qte: l.qte, montant: l.montant, note: l.note, perso: l.perso, cadeau: l.cadeau }; }),
          retour: new URL('suivi.html', location.href).href
        })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && d.url) location.href = d.url; else throw new Error('Réponse invalide');
      }).catch(function () {
        bouton.disabled = false; rendreRecap(); M.toast(x('erreurPaiement'), 'info');
      });
      return;
    }

    // Mode démonstration
    var m = document.createElement('div');
    m.className = 'modale';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', x('demoTitre'));
    m.innerHTML = '<div class="modale__corps" style="padding:32px">' +
      '<div class="carte__icone" style="background:var(--peche-pale)">' + I.cadenas.replace('<svg', '<svg style="width:32px;height:32px;color:var(--bordeaux)"') + '</div>' +
      '<h2>' + x('demoTitre') + '</h2><p class="doux">' + x('demoTexte') + '</p>' +
      '<div class="recap"><div class="recap__total"><span>' + x('total') + '</span><span>' + M.prix(commande.total) + '</span></div></div>' +
      '<div class="ligne-actions"><button class="bouton bouton--plein" type="button" data-simuler data-focus>' + x('confirmer') + '</button><button class="bouton bouton--contour" type="button" data-annuler>' + x('annuler') + '</button></div></div>';
    document.body.appendChild(m);
    M.ouvrir(m);
    m.querySelector('[data-annuler]').onclick = function () { M.fermerTout(); setTimeout(function () { m.remove(); }, 400); };
    m.querySelector('[data-simuler]').onclick = function () {
      var b = this; b.disabled = true; b.textContent = x('traitement');
      setTimeout(function () { finaliser(commande); }, 1200);
    };
  }

  rendre();
  M.panier.surChangement(function () { rendre(); });
  document.addEventListener('minubu:langue', rendre);
  document.addEventListener('minubu:stockage', function (ev) { if (ev.detail.cle === 'pause') rendre(); });
  setInterval(function () { if (!seulementCadeaux()) rendreCreneaux(); }, 60000);
})();
