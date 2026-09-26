/* =============================================================
   Minubu : cartes cadeaux
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var CC = M.config.cartesCadeaux;

  var TXT = {
    fr: { ajouter: 'Ajouter au panier · {prix}', pour: 'Pour {nom}', de: 'de la part de {nom}', ajoute: 'Carte cadeau ajoutée au panier',
          idee: 'Repère : un brunch pour deux (2 assiettes + 2 lattes), c’est environ {prix}.', erreurNom: 'Indiquez un prénom.', erreurEmail: 'E-mail invalide.',
          erreurMontant: 'Montant entre {min} et {max}.' },
    en: { ajouter: 'Add to bag · {prix}', pour: 'For {nom}', de: 'from {nom}', ajoute: 'Gift card added to your bag',
          idee: 'For reference: brunch for two (2 plates + 2 lattes) is about {prix}.', erreurNom: 'Enter a first name.', erreurEmail: 'Invalid email.',
          erreurMontant: 'Amount between {min} and {max}.' }
  };
  function x(cle, vars) {
    var s = TXT[M.langue()][cle];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  var etat = { montant: CC.montants[1], motif: 'peche' };
  var form = document.querySelector('[data-form-cadeau]');
  var aujourdHui = new Date().toISOString().slice(0, 10);
  var dateChamp = document.getElementById('date-envoi');
  dateChamp.min = aujourdHui; dateChamp.value = aujourdHui;
  var dansUnAn = new Date(); dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);
  dateChamp.max = dansUnAn.toISOString().slice(0, 10);
  var client = M.stock.lire('client', {});
  if (client.prenom) form.de.value = client.prenom;

  function rendreMontants() {
    document.querySelector('[data-montants]').innerHTML = CC.montants.map(function (m) {
      return '<button type="button" data-montant="' + m + '" aria-pressed="' + (etat.montant === m) + '">' + M.prix(m).replace(/[,.]00/, '') + '</button>';
    }).join('');
    // Repère calculé depuis la carte réelle
    var P = M.menu.parId;
    var brunch = Math.round((2 * (P.benedicte.prix + P.turkish.prix + P.avocado.prix) / 3 + 2 * P.pistachio.prix) / 100) * 100;
    document.querySelector('[data-idee]').textContent = x('idee', { prix: M.prix(brunch) });
  }

  function apercu() {
    var a = document.querySelector('[data-apercu]');
    a.setAttribute('data-motif', etat.motif);
    var pour = form.pour.value.trim(), de = form.de.value.trim();
    document.querySelector('[data-apercu-pour]').textContent = (pour ? x('pour', { nom: pour }) : '') + (de ? (pour ? ', ' : '') + x('de', { nom: de }) : '');
    document.querySelector('[data-apercu-message]').textContent = form.message.value.trim();
    document.querySelector('[data-apercu-montant]').textContent = M.prix(etat.montant || 0);
    document.querySelector('[data-compteur]').textContent = form.message.value.length + ' / 140';
    document.querySelector('[data-ajouter-cadeau]').textContent = x('ajouter', { prix: M.prix(etat.montant || 0) });
  }

  document.addEventListener('click', function (ev) {
    var m = ev.target.closest('[data-montant]');
    if (m) { etat.montant = +m.getAttribute('data-montant'); document.getElementById('montant-libre').value = ''; rendreMontants(); apercu(); return; }
    var mo = ev.target.closest('.motif[data-motif]');
    if (mo) {
      etat.motif = mo.getAttribute('data-motif');
      document.querySelectorAll('.motif[data-motif]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === mo)); });
      apercu();
    }
  });
  document.getElementById('montant-libre').addEventListener('input', function () {
    var v = Math.round(parseFloat(this.value.replace(',', '.')) * 100);
    etat.montant = isNaN(v) ? 0 : v;
    rendreMontants(); apercu();
  });
  form.addEventListener('input', apercu);

  function erreur(nom, texte) {
    var el = form.querySelector('[data-erreur="' + nom + '"]');
    if (el) el.textContent = texte || '';
    if (form[nom]) form[nom].setAttribute('aria-invalid', texte ? 'true' : 'false');
    return !texte;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;
    if (!(etat.montant >= CC.min && etat.montant <= CC.max)) { M.toast(x('erreurMontant', { min: M.prix(CC.min), max: M.prix(CC.max) }), 'info'); ok = false; }
    ok = erreur('pour', form.pour.value.trim() ? '' : x('erreurNom')) && ok;
    ok = erreur('emailPour', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailPour.value.trim()) ? '' : x('erreurEmail')) && ok;
    ok = erreur('de', form.de.value.trim() ? '' : x('erreurNom')) && ok;
    if (!ok) return;
    M.panier.ajouter({
      id: 'carte-cadeau', qte: 1, montant: etat.montant,
      cadeau: { pour: form.pour.value.trim(), emailPour: form.emailPour.value.trim(), de: form.de.value.trim(), message: form.message.value.trim(), date: form.date.value || aujourdHui, motif: etat.motif }
    });
    M.toast(x('ajoute'), 'cadeau');
    M.ouvrirPanier();
  });

  function tout() { rendreMontants(); apercu(); }
  tout();
  document.addEventListener('minubu:langue', tout);
})();
