/* =============================================================
   Minubu : noyau de l'application
   Panier, horaires, langues, commandes, fidélité, interface.
   Aucune dépendance externe.
   ============================================================= */
(function () {
  'use strict';

  var CONFIG = window.MINUBU_CONFIG;
  var MENU = window.MINUBU_MENU;
  var ART = window.MINUBU_ART;
  var I = ART.icones;

  /* ==========================================================
     Stockage local tolérant (navigation privée, quotas…)
     ========================================================== */
  var memoire = {};
  var stock = {
    lire: function (cle, defaut) {
      try {
        var v = window.localStorage.getItem('minubu.' + cle);
        return v === null ? defaut : JSON.parse(v);
      } catch (e) { return cle in memoire ? memoire[cle] : defaut; }
    },
    ecrire: function (cle, valeur) {
      memoire[cle] = valeur;
      try { window.localStorage.setItem('minubu.' + cle, JSON.stringify(valeur)); } catch (e) { /* ignoré */ }
    }
  };

  /* ==========================================================
     Langues
     ========================================================== */
  var TEXTES = {
    fr: {
      panier: 'Panier', votrePanier: 'Votre panier', panierVide: 'Votre panier est vide',
      panierVideTexte: 'Un flat white face mer ? Des Turkish eggs ? Tout est sur la carte.',
      voirCarte: 'Voir la carte', commander: 'Commander', sousTotal: 'Sous-total', total: 'Total',
      ajouter: 'Ajouter', ajouterPour: 'Ajouter · {prix}', ajoute: '{nom} ajouté au panier',
      supprimer: 'Retirer', modifier: 'Modifier', fermer: 'Fermer', quantite: 'Quantité',
      precision: 'Une précision pour la cuisine ?', precisionAide: 'Sans coriandre, bien cuit, allergie…',
      requis: 'obligatoire', auChoix: 'au choix', allergenes: 'Allergènes', aucunAllergene: 'Aucun allergène majeur identifié.',
      allergenesNote: 'Informations indicatives : signalez toute allergie à l’équipe.',
      nouveau: 'New', veg: 'Végé', sg: 'Sans gluten possible', pimente: 'Relevé', rupture: 'Victime de son succès',
      ouvert: 'Ouvert', ferme: 'Fermé', ouvertJusqua: 'Ouvert · jusqu’à {h}', fermeOuvre: 'Fermé · ouvre {quand} à {h}',
      fermeBientot: 'Ferme bientôt · {h}', cuisineJusqua: 'cuisine jusqu’à {h}', cuisineFermee: 'cuisine fermée',
      aujourdhui: 'aujourd’hui', demain: 'demain',
      jours: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      joursCourts: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      mois: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      fermeJour: 'Fermé', cuisine: 'Cuisine',
      aEmporter: 'À emporter', surPlace: 'Sur place', table: 'Table {n}',
      cadeauPour: 'Pour {nom}', cadeauDe: 'De la part de {nom}',
      itemsCuisine: 'Plats servis de {debut} à {fin}, du mercredi au dimanche.',
      demo: 'Démonstration : les paiements sont simulés, aucun débit réel.',
      demoCuisine: 'Écran cuisine',
      commandesPause: 'Les commandes en ligne sont en pause quelques minutes. Merci de votre patience !',
      menuOuvrir: 'Ouvrir le menu', menuFermer: 'Fermer le menu', langue: 'English version',
      article: 'article', articles: 'articles'
    },
    en: {
      panier: 'Bag', votrePanier: 'Your bag', panierVide: 'Your bag is empty',
      panierVideTexte: 'A flat white facing the sea? Turkish eggs? It’s all on the menu.',
      voirCarte: 'See the menu', commander: 'Checkout', sousTotal: 'Subtotal', total: 'Total',
      ajouter: 'Add', ajouterPour: 'Add · {prix}', ajoute: '{nom} added to your bag',
      supprimer: 'Remove', modifier: 'Edit', fermer: 'Close', quantite: 'Quantity',
      precision: 'Anything for the kitchen?', precisionAide: 'No coriander, well done, allergy…',
      requis: 'required', auChoix: 'optional', allergenes: 'Allergens', aucunAllergene: 'No major allergen identified.',
      allergenesNote: 'For guidance only: please tell the team about any allergy.',
      nouveau: 'New', veg: 'Veggie', sg: 'Gluten-free option', pimente: 'Spicy', rupture: 'Sold out for now',
      ouvert: 'Open', ferme: 'Closed', ouvertJusqua: 'Open · until {h}', fermeOuvre: 'Closed · opens {quand} at {h}',
      fermeBientot: 'Closing soon · {h}', cuisineJusqua: 'kitchen until {h}', cuisineFermee: 'kitchen closed',
      aujourdhui: 'today', demain: 'tomorrow',
      jours: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      joursCourts: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      mois: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fermeJour: 'Closed', cuisine: 'Kitchen',
      aEmporter: 'Takeaway', surPlace: 'Dine in', table: 'Table {n}',
      cadeauPour: 'For {nom}', cadeauDe: 'From {nom}',
      itemsCuisine: 'Food served {debut} to {fin}, Wednesday to Sunday.',
      demo: 'Demo: payments are simulated, no real charge.',
      demoCuisine: 'Kitchen screen',
      commandesPause: 'Online ordering is paused for a few minutes. Thanks for your patience!',
      menuOuvrir: 'Open menu', menuFermer: 'Close menu', langue: 'Version française',
      article: 'item', articles: 'items'
    }
  };

  function langueInitiale() {
    var l = stock.lire('langue', null);
    if (l === 'fr' || l === 'en') return l;
    var p = new URLSearchParams(location.search).get('lang');
    if (p === 'en' || p === 'fr') return p;
    return (navigator.language || 'fr').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  }
  var langue = langueInitiale();

  function t(cle, vars) {
    var s = (TEXTES[langue] && TEXTES[langue][cle]);
    if (s === undefined) s = TEXTES.fr[cle];
    if (s === undefined) return cle;
    if (vars && typeof s === 'string') {
      Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    }
    return s;
  }
  function L(obj) { return obj ? (obj[langue] || obj.fr) : ''; }

  /* Traduction du contenu statique : le français est dans le HTML,
     l'anglais dans window.MINUBU_EN (fourni par chaque page). */
  function traduirePage() {
    var dico = window.MINUBU_EN || {};
    document.documentElement.lang = langue;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var cle = el.getAttribute('data-i18n');
      if (!('fr' in el.dataset)) el.dataset.fr = el.innerHTML;
      el.innerHTML = langue === 'en' && dico[cle] ? dico[cle] : el.dataset.fr;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (paire) {
        var p = paire.split(':'); var attrNom = p[0]; var cle = p[1];
        var sauvegarde = 'fr' + attrNom.replace(/[^a-z]/gi, '');
        if (!(sauvegarde in el.dataset)) el.dataset[sauvegarde] = el.getAttribute(attrNom) || '';
        el.setAttribute(attrNom, langue === 'en' && dico[cle] ? dico[cle] : el.dataset[sauvegarde]);
      });
    });
    if (dico.__titre) {
      if (!document.documentElement.dataset.titreFr) document.documentElement.dataset.titreFr = document.title;
      document.title = langue === 'en' ? dico.__titre : document.documentElement.dataset.titreFr;
    }
  }

  function changerLangue(l) {
    langue = l; stock.ecrire('langue', l);
    traduirePage();
    document.dispatchEvent(new CustomEvent('minubu:langue'));
  }

  /* ==========================================================
     Formats
     ========================================================== */
  function prix(centimes) {
    return new Intl.NumberFormat(langue === 'en' ? 'en-IE' : 'fr-FR', { style: 'currency', currency: 'EUR' }).format((centimes || 0) / 100);
  }
  function echapper(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hhmm(minutes) {
    var h = Math.floor(minutes / 60), m = minutes % 60;
    return langue === 'en' ? h + ':' + (m < 10 ? '0' : '') + m : h + 'h' + (m ? (m < 10 ? '0' : '') + m : '');
  }
  function versMinutes(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }

  /* ==========================================================
     Horaires (toujours calculés à l'heure de Marseille)
     ========================================================== */
  function maintenantMarseille() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONFIG.fuseau, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var jours = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var h = +o.hour % 24;
    return { annee: +o.year, mois: +o.month, jour: +o.day, semaine: jours[o.weekday], minutes: h * 60 + +o.minute };
  }
  function plage(table, semaine) {
    var p = table[semaine];
    return p ? { debut: versMinutes(p[0]), fin: versMinutes(p[1]) } : null;
  }
  function etatOuverture() {
    var n = maintenantMarseille();
    var p = plage(CONFIG.horaires, n.semaine);
    var c = plage(CONFIG.cuisine, n.semaine);
    var cuisineOuverte = c && n.minutes >= c.debut && n.minutes < c.fin;
    if (p && n.minutes >= p.debut && n.minutes < p.fin) {
      var reste = p.fin - n.minutes;
      var suffixe = cuisineOuverte ? t('cuisineJusqua', { h: hhmm(c.fin) }) : '';
      return {
        etat: reste <= 45 ? 'bientot' : 'ouvert', ouvert: true, cuisine: !!cuisineOuverte,
        texte: (reste <= 45 ? t('fermeBientot', { h: hhmm(p.fin) }) : t('ouvertJusqua', { h: hhmm(p.fin) })) + (suffixe ? ' · ' + suffixe : '')
      };
    }
    // Prochaine ouverture
    for (var i = 0; i < 8; i++) {
      var j = (n.semaine + i) % 7;
      var q = plage(CONFIG.horaires, j);
      if (!q) continue;
      if (i === 0 && n.minutes >= q.debut) continue;
      var quand = i === 0 ? t('aujourdhui') : i === 1 ? t('demain') : t('jours')[j].toLowerCase();
      return { etat: 'ferme', ouvert: false, cuisine: false, texte: t('fermeOuvre', { quand: quand, h: hhmm(q.debut) }) };
    }
    return { etat: 'ferme', ouvert: false, cuisine: false, texte: t('ferme') };
  }

  function rendreStatuts() {
    var e = etatOuverture();
    document.querySelectorAll('[data-statut]').forEach(function (el) {
      el.setAttribute('data-etat', e.etat);
      el.innerHTML = '<span class="statut__point" aria-hidden="true"></span><span>' + echapper(e.texte) + '</span>';
    });
  }

  function rendreHoraires() {
    var n = maintenantMarseille();
    var ordre = [1, 2, 3, 4, 5, 6, 0];
    document.querySelectorAll('[data-horaires]').forEach(function (table) {
      var avecCuisine = table.hasAttribute('data-avec-cuisine');
      table.innerHTML = '<tbody>' + ordre.map(function (j) {
        var p = plage(CONFIG.horaires, j), c = plage(CONFIG.cuisine, j);
        var txt = p ? hhmm(p.debut) + ' – ' + hhmm(p.fin) : t('fermeJour');
        if (avecCuisine) txt += '<br><small>' + t('cuisine') + ' : ' + (c ? hhmm(c.debut) + ' – ' + hhmm(c.fin) : '–') + '</small>';
        return '<tr' + (j === n.semaine ? ' data-aujourdhui' : '') + '><th scope="row">' + t('jours')[j] + '</th><td>' + txt + '</td></tr>';
      }).join('') + '</tbody>';
    });
  }

  /* ==========================================================
     Disponibilités (pilotées par l'écran cuisine)
     ========================================================== */
  function estDisponible(id) { var d = stock.lire('indispo', {}); return !d[id]; }
  function commandesEnPause() { return !!stock.lire('pause', false); }

  /* ==========================================================
     Mode de commande : à emporter ou sur place (QR code de table)
     ========================================================== */
  (function lireTable() {
    var p = new URLSearchParams(location.search).get('table');
    if (p && /^\d{1,3}$/.test(p)) {
      try { sessionStorage.setItem('minubu.table', p); } catch (e) { memoire.table = p; }
    }
  })();
  function tableCourante() {
    try { return sessionStorage.getItem('minubu.table'); } catch (e) { return memoire.table || null; }
  }
  function oublierTable() {
    try { sessionStorage.removeItem('minubu.table'); } catch (e) { memoire.table = null; }
    rendrePanier();
  }
  function definirTable(n) {
    n = String(n || '').trim();
    if (!/^\d{1,3}$/.test(n)) return false;
    try { sessionStorage.setItem('minubu.table', n); } catch (e) { memoire.table = n; }
    rendrePanier();
    return true;
  }

  /* ==========================================================
     Panier
     ========================================================== */
  var abonnes = [];
  function lignes() { return stock.lire('panier', []); }
  function sauver(l) {
    stock.ecrire('panier', l);
    abonnes.forEach(function (f) { f(l); });
    rendrePanier();
  }
  function cleLigne(l) { return l.id + '|' + JSON.stringify(l.choix || {}) + '|' + (l.note || '') + '|' + JSON.stringify(l.perso || {}) + '|' + (l.cadeau ? Math.random() : ''); }
  function prixUnitaire(l) {
    var p = MENU.parId[l.id];
    if (!p) return 0;
    try { return MENU.prixLigne(p, l.choix, l.montant, CONFIG); } catch (e) { return 0; }
  }

  var Panier = {
    lignes: lignes,
    ajouter: function (ligne) {
      var l = lignes();
      ligne.cle = cleLigne(ligne);
      var existante = l.filter(function (x) { return x.cle === ligne.cle; })[0];
      if (existante) existante.qte = Math.min(20, existante.qte + (ligne.qte || 1));
      else l.push({ cle: ligne.cle, id: ligne.id, choix: ligne.choix || {}, qte: ligne.qte || 1, note: ligne.note || '', montant: ligne.montant, cadeau: ligne.cadeau, perso: ligne.perso });
      sauver(l);
      var bouton = document.querySelector('.bouton-panier');
      if (bouton) { bouton.removeAttribute('data-rebond'); void bouton.offsetWidth; bouton.setAttribute('data-rebond', ''); }
    },
    quantite: function (cle, delta) {
      var l = lignes();
      l.forEach(function (x) { if (x.cle === cle) x.qte = Math.max(0, Math.min(20, x.qte + delta)); });
      sauver(l.filter(function (x) { return x.qte > 0; }));
    },
    retirer: function (cle) { sauver(lignes().filter(function (x) { return x.cle !== cle; })); },
    vider: function () { sauver([]); },
    prixUnitaire: prixUnitaire,
    sousTotal: function () { return lignes().reduce(function (s, l) { return s + prixUnitaire(l) * l.qte; }, 0); },
    nombre: function () { return lignes().reduce(function (s, l) { return s + l.qte; }, 0); },
    contientCuisine: function () {
      return lignes().some(function (l) {
        var p = MENU.parId[l.id]; if (!p) return false;
        var c = MENU.categories.filter(function (x) { return x.id === p.cat; })[0];
        return c && c.cuisine;
      });
    },
    surChangement: function (f) { abonnes.push(f); }
  };

  /* Description lisible des options d'une ligne */
  function libelleOptions(l) {
    var p = MENU.parId[l.id];
    if (!p) return '';
    if (l.cadeau) {
      var c = l.cadeau;
      return [c.pour ? t('cadeauPour', { nom: c.pour }) : '', c.de ? t('cadeauDe', { nom: c.de }) : ''].filter(Boolean).join(' · ');
    }
    var morceaux = [];
    (p.options || []).forEach(function (opt) {
      var v = l.choix && l.choix[opt.id];
      var ids = Array.isArray(v) ? v : v ? [v] : [];
      ids.forEach(function (id) {
        var ch = opt.choix.filter(function (x) { return x.id === id; })[0];
        if (!ch) return;
        morceaux.push(L(ch.label) + (ch.prix ? ' (+' + prix(ch.prix) + ')' : ''));
      });
    });
    if (l.perso && l.perso.prenom) morceaux.push('« ' + l.perso.prenom + ' »');
    if (l.note) morceaux.push(l.note);
    return morceaux.join(' · ');
  }

  function categorieDe(p) { return MENU.categories.filter(function (c) { return c.id === p.cat; })[0] || { id: p.cat }; }
  function visuelProduit(p) { return ART.produit(p, categorieDe(p)); }
  function fondProduit(p) { return ART.fonds[p.cat] || '#FEEEE6'; }

  /* ==========================================================
     Commandes (démo : stockées dans le navigateur)
     ========================================================== */
  var Commandes = {
    toutes: function () { return stock.lire('commandes', []); },
    lire: function (id) { return Commandes.toutes().filter(function (c) { return c.id === id; })[0]; },
    creer: function (c) {
      var liste = Commandes.toutes();
      liste.unshift(c);
      stock.ecrire('commandes', liste.slice(0, 200));
      return c;
    },
    statut: function (id, statut) {
      var liste = Commandes.toutes();
      liste.forEach(function (c) {
        if (c.id === id) { c.statut = statut; c.historique = c.historique || {}; c.historique[statut] = Date.now(); }
      });
      stock.ecrire('commandes', liste);
    },
    nouveauCode: function () {
      var lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      return 'MB-' + lettres[Math.floor(Math.random() * lettres.length)] + (Math.floor(Math.random() * 900) + 100);
    }
  };

  /* ==========================================================
     Fidélité
     ========================================================== */
  var Fidelite = {
    lire: function () { return stock.lire('fidelite', { membre: null, tampons: 0, recompenses: [], historique: [] }); },
    ecrire: function (f) { stock.ecrire('fidelite', f); },
    inscrire: function (prenom, email) {
      var f = Fidelite.lire();
      f.membre = { prenom: prenom, email: email, depuis: Date.now(), numero: 'MNB' + Math.floor(100000 + Math.random() * 899999) };
      Fidelite.ecrire(f); return f;
    },
    crediter: function (nbBoissons, refCommande) {
      var f = Fidelite.lire();
      if (!f.membre || nbBoissons <= 0) return { f: f, nouvelles: 0 };
      var seuil = CONFIG.fidelite.tamponsPourRecompense;
      var total = f.tampons + nbBoissons, nouvelles = 0;
      while (total >= seuil) {
        total -= seuil; nouvelles++;
        f.recompenses.push({ code: 'CAFE-' + Math.random().toString(36).slice(2, 7).toUpperCase(), cree: Date.now(), utilise: false });
      }
      f.tampons = total;
      f.historique.unshift({ date: Date.now(), tampons: nbBoissons, ref: refCommande });
      f.historique = f.historique.slice(0, 30);
      Fidelite.ecrire(f);
      return { f: f, nouvelles: nouvelles };
    },
    recompenseValide: function (code) {
      var f = Fidelite.lire();
      return f.recompenses.filter(function (r) { return !r.utilise && r.code === String(code || '').trim().toUpperCase(); })[0] || null;
    },
    utiliser: function (code) {
      var f = Fidelite.lire();
      f.recompenses.forEach(function (r) { if (r.code === code) r.utilise = true; });
      Fidelite.ecrire(f);
    }
  };

  /* ==========================================================
     Notifications
     ========================================================== */
  function toast(message, icone) {
    var zone = document.querySelector('.toasts');
    if (!zone) { zone = document.createElement('div'); zone.className = 'toasts'; zone.setAttribute('role', 'status'); zone.setAttribute('aria-live', 'polite'); document.body.appendChild(zone); }
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (I[icone || 'coche'] || '') + '<span>' + echapper(message) + '</span>';
    zone.appendChild(el);
    setTimeout(function () { el.setAttribute('data-sortie', ''); setTimeout(function () { el.remove(); }, 260); }, 2600);
  }

  /* ==========================================================
     Superpositions : modale produit & tiroir panier
     ========================================================== */
  var voile, dernierFocus;
  function assurerVoile() {
    if (voile) return voile;
    voile = document.createElement('div');
    voile.className = 'voile';
    voile.addEventListener('click', fermerTout);
    document.body.appendChild(voile);
    return voile;
  }
  function ouvrir(el) {
    dernierFocus = document.activeElement;
    assurerVoile().setAttribute('data-ouvert', '');
    el.setAttribute('data-ouvert', '');
    el.removeAttribute('aria-hidden');
    document.body.setAttribute('data-verrou', '');
    setTimeout(function () {
      var f = el.querySelector('[data-focus]') || el.querySelector('button, [href], input, select, textarea');
      if (f) f.focus();
    }, 60);
  }
  function fermerTout() {
    document.querySelectorAll('.modale[data-ouvert], .tiroir[data-ouvert]').forEach(function (el) {
      el.removeAttribute('data-ouvert'); el.setAttribute('aria-hidden', 'true');
    });
    if (voile) voile.removeAttribute('data-ouvert');
    document.body.removeAttribute('data-verrou');
    if (dernierFocus && dernierFocus.focus) dernierFocus.focus();
  }
  function pieger(e) {
    var ouvert = document.querySelector('.modale[data-ouvert], .tiroir[data-ouvert]');
    if (!ouvert) return;
    if (e.key === 'Escape') { fermerTout(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(ouvert.querySelectorAll('button:not([disabled]), [href], input:not([type=hidden]), select, textarea'), function (x) { return x.offsetParent !== null || x.type === 'radio' || x.type === 'checkbox'; });
    if (!f.length) return;
    var premier = f[0], dernier = f[f.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }
  document.addEventListener('keydown', pieger);

  /* ---------- Modale produit ---------- */
  var modale;
  function ouvrirProduit(id) {
    var p = MENU.parId[id];
    if (!p) return;
    if (!estDisponible(id)) { toast(t('rupture'), 'info'); return; }
    if (!modale) {
      modale = document.createElement('div');
      modale.className = 'modale';
      modale.setAttribute('role', 'dialog');
      modale.setAttribute('aria-modal', 'true');
      modale.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modale);
    }
    var choix = {};
    (p.options || []).forEach(function (o) { choix[o.id] = o.type === 'multiple' ? [] : (o.requis ? o.choix[0].id : null); });
    var qte = 1;

    var groupes = (p.options || []).map(function (o) {
      return '<fieldset class="groupe-options"><legend>' + echapper(L(o.label)) + ' <small>' + (o.requis ? t('requis') : t('auChoix')) + '</small></legend><div class="choix-grille">' +
        o.choix.map(function (c, i) {
          var idInput = 'opt-' + o.id + '-' + c.id;
          var type = o.type === 'multiple' ? 'checkbox' : 'radio';
          var coche = o.type !== 'multiple' && o.requis && i === 0 ? ' checked' : '';
          return '<div class="choix"><input type="' + type + '" name="' + o.id + '" id="' + idInput + '" value="' + c.id + '"' + coche + '>' +
            '<label for="' + idInput + '"><span>' + echapper(L(c.label)) + '</span>' + (c.prix ? '<small>+' + prix(c.prix) + '</small>' : '') + '</label></div>';
        }).join('') + '</div></fieldset>';
    }).join('');

    var allerg = (p.allergenes || []).map(function (a) { return L(MENU.allergenes[a]); }).join(', ');
    var estPlat = categorieDe(p).cuisine;

    modale.setAttribute('aria-label', L(p.nom));
    modale.innerHTML =
      '<div class="modale__visuel" style="background:' + fondProduit(p) + '">' + visuelProduit(p) +
        '<button class="bouton-rond bouton-rond--clair modale__fermer" type="button" data-fermer aria-label="' + t('fermer') + '">' + I.fermer + '</button></div>' +
      '<div class="modale__corps">' +
        '<div class="pastilles" style="margin-bottom:10px">' + pastilles(p) + '</div>' +
        '<h2>' + echapper(L(p.nom)) + '</h2>' +
        '<div class="modale__prix">' + prix(p.prix) + '</div>' +
        (p.desc ? '<p class="doux">' + echapper(L(p.desc)) + '</p>' : '') +
        groupes +
        (estPlat ? '<div class="champ" style="margin-top:24px"><label for="note-produit">' + t('precision') + '</label><input id="note-produit" maxlength="120" placeholder="' + t('precisionAide') + '"></div>' : '') +
        '<div class="allergenes"><strong>' + t('allergenes') + ' :</strong> ' + (allerg || t('aucunAllergene')) + '<br><small>' + t('allergenesNote') + '</small></div>' +
      '</div>' +
      '<div class="modale__pied"><div class="quantite" role="group" aria-label="' + t('quantite') + '"><button type="button" data-moins aria-label="-1">' + I.moins + '</button><span aria-live="polite" data-qte>1</span><button type="button" data-plus aria-label="+1">' + I.plus + '</button></div>' +
        '<button class="bouton bouton--plein" type="button" data-ajouter data-focus></button></div>';

    function total() { return MENU.prixLigne(p, choix) * qte; }
    function maj() {
      modale.querySelector('[data-qte]').textContent = qte;
      modale.querySelector('[data-ajouter]').textContent = t('ajouterPour', { prix: prix(total()) });
    }
    modale.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var o = p.options.filter(function (x) { return x.id === inp.name; })[0];
        if (o.type === 'multiple') {
          choix[o.id] = Array.prototype.map.call(modale.querySelectorAll('input[name="' + o.id + '"]:checked'), function (x) { return x.value; });
        } else choix[o.id] = inp.value;
        maj();
      });
    });
    modale.querySelector('[data-moins]').onclick = function () { qte = Math.max(1, qte - 1); maj(); };
    modale.querySelector('[data-plus]').onclick = function () { qte = Math.min(20, qte + 1); maj(); };
    modale.querySelector('[data-fermer]').onclick = fermerTout;
    modale.querySelector('[data-ajouter]').onclick = function () {
      var noteEl = modale.querySelector('#note-produit');
      var propre = {};
      Object.keys(choix).forEach(function (k) { if (choix[k] !== null && !(Array.isArray(choix[k]) && !choix[k].length)) propre[k] = choix[k]; });
      Panier.ajouter({ id: p.id, choix: propre, qte: qte, note: noteEl ? noteEl.value.trim() : '' });
      fermerTout();
      toast(t('ajoute', { nom: L(p.nom) }));
    };
    maj();
    ouvrir(modale);
  }

  function pastilles(p) {
    var h = '';
    if (!estDisponible(p.id)) h += '<span class="pastille pastille--rupture">' + t('rupture') + '</span>';
    if (p.tags.indexOf('new') > -1) h += '<span class="pastille pastille--new">' + t('nouveau') + '</span>';
    if (p.tags.indexOf('veg') > -1 && categorieDe(p).cuisine) h += '<span class="pastille pastille--veg">' + t('veg') + '</span>';
    if (p.tags.indexOf('sg') > -1) h += '<span class="pastille pastille--sg">' + t('sg') + '</span>';
    if (p.tags.indexOf('pimente') > -1) h += '<span class="pastille pastille--pimente">' + t('pimente') + '</span>';
    return h;
  }

  /* Carte produit réutilisable (accueil, carte) */
  function carteProduit(p, compacte) {
    var dispo = estDisponible(p.id);
    var nouveau = p.tags.indexOf('new') > -1;
    return '<button type="button" class="produit' + (compacte ? ' produit--compact' : '') + '" data-produit="' + p.id + '"' + (dispo ? '' : ' data-indisponible aria-disabled="true"') + '>' +
      '<span class="produit__visuel" style="background:' + fondProduit(p) + '">' + visuelProduit(p) + (nouveau ? '<span class="pastille pastille--new">' + t('nouveau') + '</span>' : '') + '</span>' +
      '<span class="produit__nom">' + echapper(L(p.nom)) + '</span>' +
      '<span class="produit__prix">' + prix(p.prix) + '</span>' +
      (p.desc && !compacte ? '<span class="produit__desc">' + echapper(L(p.desc)) + '</span>' : '') +
      '<span class="produit__pied"><span class="pastilles">' + pastilles(p).replace(/<span class="pastille pastille--new">[^<]*<\/span>/, '') + '</span>' +
      '<span class="produit__ajout" aria-hidden="true">' + I.plus + '</span></span>' +
      '<span class="visuellement-cache">' + t('ajouter') + '</span></button>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-produit]');
    if (b) { e.preventDefault(); ouvrirProduit(b.getAttribute('data-produit')); }
  });

  /* ---------- Tiroir panier ---------- */
  var tiroir;
  function assurerTiroir() {
    if (tiroir) return tiroir;
    tiroir = document.createElement('aside');
    tiroir.className = 'tiroir';
    tiroir.setAttribute('role', 'dialog');
    tiroir.setAttribute('aria-modal', 'true');
    tiroir.setAttribute('aria-hidden', 'true');
    tiroir.setAttribute('aria-labelledby', 'titre-tiroir');
    document.body.appendChild(tiroir);
    tiroir.addEventListener('click', function (e) {
      var a = e.target.closest('[data-action]');
      if (!a) return;
      var cle = a.closest('[data-cle]') && a.closest('[data-cle]').getAttribute('data-cle');
      var action = a.getAttribute('data-action');
      if (action === 'plus') Panier.quantite(cle, 1);
      else if (action === 'moins') Panier.quantite(cle, -1);
      else if (action === 'retirer') Panier.retirer(cle);
      else if (action === 'fermer') fermerTout();
    });
    return tiroir;
  }
  function ligneHTML(l, avecActions) {
    var p = MENU.parId[l.id];
    if (!p) return '';
    var nom = L(p.nom);
    if (l.perso && l.perso.titre) nom = l.perso.titre;
    return '<div class="ligne-panier" data-cle="' + echapper(l.cle) + '">' +
      '<div class="ligne-panier__visuel" style="background:' + fondProduit(p) + '">' + (l.perso && l.perso.couleur ? ART.latte(l.perso.couleur) : visuelProduit(p)) + '</div>' +
      '<div><div class="ligne-panier__nom">' + echapper(nom) + '</div>' +
        '<div class="ligne-panier__options">' + echapper(libelleOptions(l)) + '</div>' +
        (avecActions ? '<div class="ligne-panier__actions"><div class="quantite quantite--petite" role="group" aria-label="' + t('quantite') + '"><button type="button" data-action="moins" aria-label="-1">' + I.moins + '</button><span>' + l.qte + '</span><button type="button" data-action="plus" aria-label="+1"' + (l.cadeau ? ' disabled' : '') + '>' + I.plus + '</button></div>' +
          '<button type="button" class="bouton-texte petit" data-action="retirer">' + t('supprimer') + '</button></div>' : '<div class="ligne-panier__options">× ' + l.qte + '</div>') +
      '</div><div class="ligne-panier__prix">' + prix(prixUnitaire(l) * l.qte) + '</div></div>';
  }
  function rendrePanier() {
    var n = Panier.nombre(), st = Panier.sousTotal();
    document.querySelectorAll('[data-panier-nombre]').forEach(function (el) { el.textContent = n; });
    document.querySelectorAll('[data-panier-total]').forEach(function (el) { el.textContent = prix(st); });
    var barre = document.querySelector('.barre-panier');
    if (barre) { if (n > 0 && !document.body.hasAttribute('data-sans-barre')) barre.setAttribute('data-visible', ''); else barre.removeAttribute('data-visible'); }
    if (!tiroir) return;
    var l = lignes();
    var table = tableCourante();
    tiroir.innerHTML =
      '<div class="tiroir__tete"><h2 id="titre-tiroir">' + t('votrePanier') + '</h2><button class="bouton-rond bouton-rond--clair" type="button" data-action="fermer" aria-label="' + t('fermer') + '">' + I.fermer + '</button></div>' +
      '<div class="tiroir__corps">' +
        (table ? '<div class="message message--info" style="margin-top:16px">' + I.table + '<span>' + t('surPlace') + ' · ' + t('table', { n: echapper(table) }) + '</span></div>' : '') +
        (l.length ? l.map(function (x) { return ligneHTML(x, true); }).join('') :
          '<div class="vide">' + ART.cup() + '<p><strong>' + t('panierVide') + '</strong></p><p class="petit">' + t('panierVideTexte') + '</p><a class="bouton bouton--contour" href="carte.html">' + t('voirCarte') + '</a></div>') +
      '</div>' +
      (l.length ? '<div class="tiroir__pied"><div class="recap"><div class="recap__total"><span>' + t('sousTotal') + '</span><span>' + prix(st) + '</span></div></div>' +
        '<a class="bouton bouton--plein bouton--large" href="commande.html">' + t('commander') + ' · ' + n + ' ' + (n > 1 ? t('articles') : t('article')) + I.fleche + '</a></div>' : '');
  }
  function ouvrirPanier() { assurerTiroir(); rendrePanier(); ouvrir(tiroir); }

  /* ==========================================================
     En-tête, menu mobile et pied de page (communs à toutes les pages)
     ========================================================== */
  var PAGES = [
    { href: 'index.html', fr: 'Accueil', en: 'Home' },
    { href: 'carte.html', fr: 'La carte', en: 'Menu' },
    { href: 'atelier.html', fr: 'Atelier latte', en: 'Latte studio' },
    { href: 'cadeaux.html', fr: 'Cartes cadeaux', en: 'Gift cards' },
    { href: 'fidelite.html', fr: 'Fidélité', en: 'Rewards' },
    { href: 'evenements.html', fr: 'Privatiser', en: 'Private events' }
  ];
  function pageCourante() {
    var f = location.pathname.split('/').pop() || 'index.html';
    return f.indexOf('.html') === -1 ? 'index.html' : f;
  }

  function construireEntete() {
    var cible = document.querySelector('[data-entete]');
    if (!cible) return;
    var courante = pageCourante();
    var liens = PAGES.map(function (p) {
      return '<a href="' + p.href + '"' + (p.href === courante ? ' aria-current="page"' : '') + '>' + p[langue] + '</a>';
    }).join('');
    cible.className = 'entete';
    cible.innerHTML =
      '<div class="enveloppe entete__interieur">' +
        '<a class="marque" href="index.html" aria-label="Minubu, accueil"><span class="marque__mot">minubu</span><span class="marque__lieu">Marseille</span></a>' +
        '<nav class="nav" aria-label="Navigation principale">' + liens.replace('href="index.html"', 'href="index.html" hidden') + '</nav>' +
        '<div class="outils">' +
          '<button class="bouton-langue" type="button" data-langue aria-label="' + t('langue') + '">' + (langue === 'fr' ? 'EN' : 'FR') + '</button>' +
          '<button class="bouton-panier" type="button" data-ouvrir-panier aria-label="' + t('panier') + '">' + I.sac + '<span class="bouton-panier__total" data-panier-total></span><span class="bouton-panier__nombre" data-panier-nombre>0</span></button>' +
          '<button class="bouton-menu" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="' + t('menuOuvrir') + '"><span></span></button>' +
        '</div>' +
      '</div>';
    var mm = document.getElementById('menu-mobile');
    if (!mm) { mm = document.createElement('div'); mm.id = 'menu-mobile'; mm.className = 'menu-mobile'; cible.after(mm); }
    mm.innerHTML = '<nav aria-label="Navigation mobile">' + liens + '</nav><div class="statut" data-statut></div>';
    mm.setAttribute('data-ouvert', 'false');

    var bm = cible.querySelector('.bouton-menu');
    bm.addEventListener('click', function () {
      var ouvert = bm.getAttribute('aria-expanded') === 'true';
      bm.setAttribute('aria-expanded', String(!ouvert));
      bm.setAttribute('aria-label', ouvert ? t('menuOuvrir') : t('menuFermer'));
      mm.setAttribute('data-ouvert', String(!ouvert));
      if (ouvert) document.body.removeAttribute('data-verrou'); else document.body.setAttribute('data-verrou', '');
    });
    cible.querySelector('[data-langue]').addEventListener('click', function () { changerLangue(langue === 'fr' ? 'en' : 'fr'); });
  }

  function construirePied() {
    var cible = document.querySelector('[data-pied]');
    if (!cible) return;
    var a = CONFIG.adresse;
    var en = langue === 'en';
    cible.className = 'pied';
    cible.innerHTML =
      '<div class="enveloppe"><div class="pied__grille">' +
        '<div><div class="pied__marque">minubu</div><div class="pied__slogan">' + echapper(CONFIG.slogan) + '</div>' +
          '<p style="margin-top:16px">' + echapper(a.rue) + '<br>' + a.codePostal + ' ' + a.ville + '<br>' + (en ? 'Seafront, 7th arrondissement' : echapper(a.complement)) + '</p>' +
          '<div class="statut" data-statut style="background:transparent;color:inherit;border-color:rgba(252,220,205,.25)"></div></div>' +
        '<div><h3>' + (en ? 'Order' : 'Commander') + '</h3><ul>' +
          '<li><a href="carte.html">' + (en ? 'Click & collect' : 'Click & collect') + '</a></li>' +
          '<li><a href="carte.html?table=1">' + (en ? 'Order at your table' : 'Commander à table') + '</a></li>' +
          '<li><a href="atelier.html">' + (en ? 'Latte studio' : 'Atelier latte') + '</a></li>' +
          '<li><a href="cadeaux.html">' + (en ? 'Gift cards' : 'Cartes cadeaux') + '</a></li></ul></div>' +
        '<div><h3>Minubu</h3><ul>' +
          '<li><a href="index.html#histoire">' + (en ? 'Our story' : 'Notre histoire') + '</a></li>' +
          '<li><a href="fidelite.html">' + (en ? 'Rewards' : 'Fidélité') + '</a></li>' +
          '<li><a href="evenements.html">' + (en ? 'Private events & contact' : 'Privatiser & contact') + '</a></li>' +
          '<li><a href="index.html#infos">' + (en ? 'Hours & access' : 'Horaires & accès') + '</a></li></ul></div>' +
        '<div><h3>' + (en ? 'Follow us' : 'Nous suivre') + '</h3><ul>' +
          '<li><a href="' + CONFIG.instagram + '" rel="noopener" target="_blank">Instagram ' + echapper(CONFIG.instagramPseudo) + '</a></li>' +
          '<li><a href="cuisine.html">' + (en ? 'Team area' : 'Espace équipe') + '</a></li>' +
          '<li><a href="mentions.html">' + (en ? 'Legal & terms' : 'Mentions légales & CGV') + '</a></li></ul></div>' +
      '</div><div class="pied__bas"><span>© ' + new Date().getFullYear() + ' Minubu Marseille</span><span>' + (en ? 'Specialty coffee & brunch, facing the sea.' : 'Café de spécialité & brunch, face à la mer.') + '</span></div></div>';
  }

  function construireBarrePanier() {
    if (document.querySelector('.barre-panier') || document.body.hasAttribute('data-sans-barre')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'barre-panier';
    b.setAttribute('data-ouvrir-panier', '');
    b.innerHTML = '<span><span class="barre-panier__nombre" data-panier-nombre>0</span>' + t('votrePanier') + '</span><span data-panier-total></span>';
    document.body.appendChild(b);
  }

  function construireBandeauDemo() {
    if (CONFIG.endpointPaiement) return;
    var b = document.querySelector('[data-bandeau-demo]');
    if (!b) return;
    b.className = 'bandeau-demo';
    b.innerHTML = echapper(t('demo')) + ' <a href="cuisine.html">' + t('demoCuisine') + '</a>';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-ouvrir-panier]')) { e.preventDefault(); ouvrirPanier(); }
  });

  /* Apparition progressive */
  function revelations() {
    var els = document.querySelectorAll('.revele');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.setAttribute('data-visible', ''); }); return; }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.setAttribute('data-visible', ''); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Synchronisation entre onglets (écran cuisine ↔ suivi client) */
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key.indexOf('minubu.') !== 0) return;
    if (e.key === 'minubu.panier') rendrePanier();
    document.dispatchEvent(new CustomEvent('minubu:stockage', { detail: { cle: e.key.slice(7) } }));
  });

  /* Illustrations et icônes déclarées dans le HTML */
  function illustrer(racine) {
    (racine || document).querySelectorAll('[data-art]').forEach(function (el) {
      var f = ART[el.getAttribute('data-art')];
      if (f && !el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', f(el.getAttribute('data-couleur')));
    });
    (racine || document).querySelectorAll('[data-icone]').forEach(function (el) {
      var i = I[el.getAttribute('data-icone')];
      if (i && !el.querySelector(':scope > svg')) el.insertAdjacentHTML('afterbegin', i);
    });
  }

  function initialiser() {
    illustrer();
    construireBandeauDemo();
    construireEntete();
    construirePied();
    construireBarrePanier();
    traduirePage();
    rendreStatuts();
    rendreHoraires();
    rendrePanier();
    revelations();
    var entete = document.querySelector('.entete');
    var surDefilement = function () { if (entete) { if (window.scrollY > 8) entete.setAttribute('data-defile', ''); else entete.removeAttribute('data-defile'); } };
    window.addEventListener('scroll', surDefilement, { passive: true });
    surDefilement();
    setInterval(rendreStatuts, 60000);

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible */ });
    }
  }

  document.addEventListener('minubu:langue', function () {
    construireEntete(); construirePied(); construireBandeauDemo();
    var barre = document.querySelector('.barre-panier');
    if (barre) { barre.remove(); construireBarrePanier(); }
    rendreStatuts(); rendreHoraires(); rendrePanier();
  });

  /* API publique pour les scripts de page */
  window.Minubu = {
    config: CONFIG, menu: MENU, art: ART, stock: stock,
    t: t, L: L, langue: function () { return langue; }, prix: prix, echapper: echapper, hhmm: hhmm, versMinutes: versMinutes,
    maintenant: maintenantMarseille, plage: plage, etatOuverture: etatOuverture,
    panier: Panier, libelleOptions: libelleOptions, ligneHTML: ligneHTML, carteProduit: carteProduit, pastilles: pastilles,
    visuelProduit: visuelProduit, fondProduit: fondProduit, categorieDe: categorieDe, ouvrirProduit: ouvrirProduit, ouvrirPanier: ouvrirPanier,
    estDisponible: estDisponible, commandesEnPause: commandesEnPause,
    table: tableCourante, oublierTable: oublierTable, definirTable: definirTable,
    commandes: Commandes, fidelite: Fidelite, toast: toast, fermerTout: fermerTout, ouvrir: ouvrir, illustrer: illustrer
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
  else initialiser();
})();
