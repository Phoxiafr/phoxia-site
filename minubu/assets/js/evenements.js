/* =============================================================
   Minubu : privatisation et contact
   Envoi via Formspree (config.endpointFormulaire) ou messagerie.
   ============================================================= */
(function () {
  'use strict';
  var M = window.Minubu;
  var C = M.config;

  var TXT = {
    fr: { ok: 'Merci ! Votre demande est bien partie, l’équipe vous répond sous 48 h ouvrées.', demo: 'Démonstration : la demande a été préparée. Renseignez un endpoint Formspree ou un e-mail dans config.js pour la recevoir.',
          ko: 'L’envoi a échoué. Réessayez ou écrivez-nous sur Instagram.', nom: 'Indiquez votre nom.', email: 'Indiquez un e-mail valide.', envoi: 'Envoi…' },
    en: { ok: 'Thank you! Your request is on its way, the team will reply within 2 working days.', demo: 'Demo: the request has been prepared. Set a Formspree endpoint or an email in config.js to receive it.',
          ko: 'Sending failed. Please try again or message us on Instagram.', nom: 'Enter your name.', email: 'Enter a valid email.', envoi: 'Sending…' }
  };
  function x(cle) { return TXT[M.langue()][cle]; }

  var form = document.querySelector('[data-form-evenement]');
  var type = 'privatisation';
  var nb = form.querySelector('#ev-nb');
  nb.addEventListener('input', function () { form.querySelector('[data-nb-valeur]').textContent = nb.value; });
  form.querySelector('#ev-date').min = new Date().toISOString().slice(0, 10);

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-type-demande]');
    if (!b) return;
    type = b.getAttribute('data-type-demande');
    document.querySelectorAll('[data-type-demande]').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); });
    form.querySelector('[data-bloc-priva]').hidden = type !== 'privatisation';
  });

  function erreur(nom, texte) {
    form.querySelector('[data-erreur="' + nom + '"]').textContent = texte || '';
    form[nom].setAttribute('aria-invalid', texte ? 'true' : 'false');
    return !texte;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = erreur('nom', form.nom.value.trim() ? '' : x('nom'));
    ok = erreur('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()) ? '' : x('email')) && ok;
    if (!ok) return;
    if (form._gotcha.value) return; // robot

    var donnees = { demande: type, nom: form.nom.value.trim(), email: form.email.value.trim(), tel: form.tel.value.trim(), message: form.message.value.trim() };
    if (type === 'privatisation') {
      donnees.occasion = form.occasion.value; donnees.date = form.date.value; donnees.moment = form.moment.value; donnees.personnes = form.personnes.value;
      donnees.envies = Array.prototype.map.call(form.querySelectorAll('[name=envies]:checked'), function (c) { return c.value; }).join(', ');
    }
    var retour = form.querySelector('[data-retour]');
    var bouton = form.querySelector('[type=submit]');

    if (C.endpointFormulaire) {
      bouton.disabled = true;
      var libelle = bouton.innerHTML; bouton.textContent = x('envoi');
      fetch(C.endpointFormulaire, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(donnees) })
        .then(function (r) { if (!r.ok) throw new Error(); retour.innerHTML = '<div class="message message--succes">' + M.echapper(x('ok')) + '</div>'; form.reset(); })
        .catch(function () { retour.innerHTML = '<div class="message message--alerte">' + M.echapper(x('ko')) + '</div>'; })
        .then(function () { bouton.disabled = false; bouton.innerHTML = libelle; });
      return;
    }
    if (C.email) {
      var corps = Object.keys(donnees).map(function (k) { return k + ' : ' + donnees[k]; }).join('\n');
      location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Minubu : ' + type) + '&body=' + encodeURIComponent(corps);
      return;
    }
    retour.innerHTML = '<div class="message message--info">' + M.echapper(x('demo')) + '</div>';
  });
})();
