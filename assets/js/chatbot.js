/* =============================================================
   Phoxia — assistant de discussion
   Fonctionne seul (réponses intégrées) ou branché sur un agent IA
   via le Worker décrit dans chatbot/LISEZ-MOI.md.
   Aucune dépendance externe.
   ============================================================= */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Configuration
     Laisser vide : l'assistant répond avec la base intégrée.
     Renseigner l'URL du Worker : les réponses viennent de Claude,
     avec repli automatique sur la base intégrée en cas d'erreur.
     ---------------------------------------------------------- */
  var ENDPOINT = '';

  var CALENDLY = 'https://calendly.com/mathieu-phoxia/30min';
  var CLE_STOCKAGE = 'phoxia-chat';
  var MAX_HISTORIQUE = 20;

  // Racine du site, déduite de l'emplacement du script : les liens
  // fonctionnent depuis n'importe quelle page, y compris /actualites/.
  var script = document.currentScript;
  var RACINE = script ? script.src.replace(/assets\/js\/chatbot\.js.*$/, '') : '/';
  var lien = function (page, texte) {
    return '<a href="' + RACINE + page + '">' + texte + '</a>';
  };

  /* ----------------------------------------------------------
     Base de réponses intégrée
     ---------------------------------------------------------- */
  var CONTACT =
    'Le plus simple : <a href="' + CALENDLY + '" target="_blank" rel="noopener">réserver un échange de 30 minutes</a>, ' +
    'gratuit et sans engagement, ou ' + lien('contact.html#formulaire', 'décrire votre projet par écrit') + '.';

  var intentions = [
    {
      mots: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey'],
      reponse: 'Bonjour ! Je suis l’assistant de Phoxia. Posez-moi une question sur nos offres IA, ' +
        'notre méthode, nos tarifs ou la prise de rendez-vous.'
    },
    {
      mots: ['offre', 'service', 'propose', 'faites', 'domaine', 'expertise'],
      reponse: 'Phoxia intervient sur trois domaines :<br>' +
        '<strong>1. Automatisation et agents IA</strong> : prospection, support client, reporting.<br>' +
        '<strong>2. Conseil et stratégie IA</strong> : diagnostic des cas d’usage, feuille de route, formation des équipes.<br>' +
        '<strong>3. Développement sur mesure</strong> : chatbots, intégrations, outils métier.<br>' +
        'Détails sur la page ' + lien('domaines.html', 'Domaines') + '.'
    },
    {
      mots: ['agent', 'automatis', 'automatiser', 'workflow', 'n8n', 'make', 'zapier', 'repetitive'],
      reponse: 'Un agent IA lit une demande, interroge vos outils (CRM, messagerie, tableurs), décide de l’action utile ' +
        'et la prépare pour validation. Cas fréquents : qualifier des prospects, répondre au support, produire un reporting, ' +
        'traiter des factures. Vous pouvez voir un exemple animé sur la ' + lien('index.html#titre-demo', 'page d’accueil') + '.'
    },
    {
      mots: ['chatbot', 'assistant', 'bot', 'conversation'],
      reponse: 'Oui, Phoxia conçoit des chatbots sur mesure, comme celui-ci : branchés sur vos documents et vos outils, ' +
        'dans votre ton, avec transfert vers un humain quand c’est nécessaire. ' + CONTACT
    },
    {
      mots: ['prix', 'tarif', 'cout', 'combien', 'budget', 'devis', 'onereux'],
      reponse: 'Chaque mission est sur mesure, donc le prix dépend du périmètre. Le premier échange est gratuit et sert ' +
        'justement à cadrer un budget réaliste. Dans le ' + lien('contact.html#formulaire', 'formulaire') +
        ', vous pouvez indiquer un ordre de grandeur (de moins de 1 000 € à plus de 10 000 €).'
    },
    {
      mots: ['rendez', 'rdv', 'appel', 'calendly', 'creneau', 'reserver', 'rencontrer', 'visio', 'echange'],
      reponse: 'Vous pouvez <a href="' + CALENDLY + '" target="_blank" rel="noopener">réserver un créneau de 30 minutes</a> ' +
        'directement. C’est gratuit, sans engagement, en français, anglais ou espagnol.'
    },
    {
      mots: ['contact', 'mail', 'email', 'telephone', 'joindre', 'numero', 'ecrire'],
      reponse: 'Email : <a href="mailto:mathieu@phoxia.fr">mathieu@phoxia.fr</a><br>' +
        'Téléphone : <a href="tel:+33782590991">+33 7 82 59 09 91</a><br>' +
        'Ou le ' + lien('contact.html#formulaire', 'formulaire de contact') + '. Réponse sous 48 heures ouvrées.'
    },
    {
      mots: ['methode', 'deroule', 'etape', 'processus', 'comment', 'fonctionne', 'demarche', 'mission'],
      reponse: 'Une mission suit quatre étapes :<br>' +
        '<strong>Comprendre</strong> votre activité et vos irritants,<br>' +
        '<strong>Diagnostiquer</strong> les cas d’usage à fort impact (restitution écrite),<br>' +
        '<strong>Construire</strong> et tester sur un périmètre limité,<br>' +
        '<strong>Mettre en œuvre</strong> avec formation et indicateurs.<br>' +
        'Plus de détails : ' + lien('methode.html', 'Déroulé mission') + '.'
    },
    {
      mots: ['delai', 'temps', 'rapide', 'quand', 'duree', 'combien de temps'],
      reponse: 'Réponse à toute demande sous 48 heures ouvrées. La durée d’une mission dépend du périmètre, ' +
        'qui est fixé par écrit avant de commencer, avec un calendrier.'
    },
    {
      mots: ['ou', 'marseille', 'lyon', 'paris', 'montreal', 'ville', 'localisation', 'adresse', 'bureau', 'distance', 'deplace'],
      reponse: 'Phoxia est basée à Marseille et intervient à Lyon, Paris, Montréal, et partout en France et en Europe. ' +
        'Les missions peuvent aussi se faire entièrement à distance.'
    },
    {
      mots: ['langue', 'anglais', 'english', 'espagnol', 'spanish'],
      reponse: 'Nous travaillons en français, anglais et espagnol. We can also help you in English!'
    },
    {
      mots: ['qui', 'fondateur', 'mathieu', 'equipe', 'parcours'],
      reponse: 'Phoxia a été fondée par Mathieu Barthélémy (ESSCA, Université Laval, SISU Shanghai), ' +
        'entouré d’une équipe internationale. Voir ' + lien('parcours.html', 'Parcours et équipe') + '.'
    },
    {
      mots: ['donnee', 'rgpd', 'confidential', 'securite', 'securise', 'vie privee'],
      reponse: 'La protection des données est prise en compte dès la conception : conformité RGPD, hébergement européen ' +
        'privilégié, et un humain valide les actions sensibles. Voir aussi la ' +
        lien('politique-de-confidentialite.html', 'politique de confidentialité') + '.'
    },
    {
      mots: ['formation', 'former', 'apprendre', 'claude', 'chatgpt', 'gpt'],
      reponse: 'Phoxia forme les équipes à l’usage quotidien des outils IA (Claude, ChatGPT, Mistral…) sur leurs vrais cas ' +
        'd’usage, pour qu’elles gardent la main sans dépendre d’un prestataire. ' + CONTACT
    },
    {
      mots: ['essca', 'etudiant', 'stage', 'alternance', 'recrut', 'emploi', 'job'],
      reponse: 'Phoxia ouvre régulièrement ses missions à des étudiants et jeunes diplômés en stage ou en alternance. ' +
        'Écrivez à <a href="mailto:mathieu@phoxia.fr">mathieu@phoxia.fr</a>. Voir aussi ' + lien('essca.html', 'Phoxia × ESSCA') + '.'
    },
    {
      mots: ['merci', 'super', 'parfait', 'top', 'genial'],
      reponse: 'Avec plaisir ! Si vous souhaitez aller plus loin : ' + CONTACT
    }
  ];

  var SUGGESTIONS = ['Que proposez-vous ?', 'C’est quoi un agent IA ?', 'Combien ça coûte ?', 'Prendre rendez-vous'];

  var normaliser = function (texte) {
    return texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ');
  };

  var repondreLocalement = function (question) {
    var q = ' ' + normaliser(question) + ' ';
    var meilleure = null;
    var meilleurScore = 0;
    intentions.forEach(function (intention) {
      var score = 0;
      intention.mots.forEach(function (mot) {
        // Mots courts : mot exact ; mots longs : début de mot (automatis, recrut...).
        var trouve = mot.length <= 3 ? q.indexOf(' ' + mot + ' ') !== -1 : q.indexOf(' ' + mot) !== -1;
        if (trouve) score += mot.length > 3 ? 2 : 1;
      });
      if (score > meilleurScore) { meilleurScore = score; meilleure = intention; }
    });
    if (meilleure) return meilleure.reponse;
    return 'Bonne question ! Je n’ai pas de réponse toute prête, mais Mathieu vous répondra personnellement. ' + CONTACT;
  };

  /* ----------------------------------------------------------
     Mise en forme des réponses de l'agent IA (texte brut)
     ---------------------------------------------------------- */
  var echapper = function (t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var formaterTexte = function (texte) {
    return echapper(texte)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([a-z0-9._-]+@phoxia\.fr)/gi, '<a href="mailto:$1">$1</a>')
      .replace(/\n/g, '<br>');
  };

  /* ----------------------------------------------------------
     Interface
     ---------------------------------------------------------- */
  var racine = document.createElement('div');
  racine.className = 'chat';
  racine.innerHTML =
    '<button class="chat__lanceur" type="button" aria-expanded="false" aria-controls="chat-fenetre" aria-label="Ouvrir l’assistant Phoxia">' +
      '<svg class="chat__icone-ouvrir" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" stroke-width="2.4" stroke-linecap="round"/></svg>' +
      '<svg class="chat__icone-fermer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '<span class="chat__bulle-lanceur" aria-hidden="true">Une question ?</span>' +
    '</button>' +
    '<section class="chat__fenetre" id="chat-fenetre" role="dialog" aria-label="Assistant Phoxia" hidden>' +
      '<header class="chat__entete">' +
        '<span class="chat__avatar" aria-hidden="true"><svg viewBox="0 0 139.03 102.15"><path fill="#5BA3DD" d="M0 102.15h34.05L53.91 68.1H19.86z"/><path fill="#1C6BA8" d="M42.56 68.1h34.05l19.86-34.05H62.42z"/><path fill="#EDEAE1" d="M85.12 34.05h34.05L139.03 0h-34.05z"/></svg></span>' +
        '<div class="chat__identite"><p class="chat__nom">Assistant Phoxia</p><p class="chat__statut"><span class="chat__point" aria-hidden="true"></span> ' +
          (ENDPOINT ? 'Agent IA · répond en quelques secondes' : 'En ligne · réponse immédiate') + '</p></div>' +
        '<button class="chat__fermer" type="button" aria-label="Fermer l’assistant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '</header>' +
      '<ol class="chat__fil" aria-live="polite"></ol>' +
      '<div class="chat__suggestions"></div>' +
      '<form class="chat__saisie">' +
        '<label class="saut-contenu" for="chat-message">Votre message</label>' +
        '<input id="chat-message" type="text" autocomplete="off" maxlength="600" placeholder="Écrivez votre question…">' +
        '<button type="submit" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>' +
      '</form>' +
      '<p class="chat__mention">Assistant automatisé. Pour un échange humain : <a href="mailto:mathieu@phoxia.fr">mathieu@phoxia.fr</a></p>' +
    '</section>';
  document.body.appendChild(racine);

  var lanceur = racine.querySelector('.chat__lanceur');
  var fenetre = racine.querySelector('.chat__fenetre');
  var fil = racine.querySelector('.chat__fil');
  var zoneSuggestions = racine.querySelector('.chat__suggestions');
  var formulaire = racine.querySelector('.chat__saisie');
  var champ = racine.querySelector('#chat-message');
  var boutonFermer = racine.querySelector('.chat__fermer');

  var historique = [];
  var enCours = false;

  var sauvegarder = function () {
    try { window.sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(historique.slice(-MAX_HISTORIQUE))); } catch (e) { /* stockage indisponible */ }
  };

  var restaurer = function () {
    try {
      var brut = window.sessionStorage.getItem(CLE_STOCKAGE);
      return brut ? JSON.parse(brut) : [];
    } catch (e) { return []; }
  };

  var defiler = function () { fil.scrollTop = fil.scrollHeight; };

  var afficherMessage = function (role, html) {
    var li = document.createElement('li');
    li.className = 'chat__message chat__message--' + (role === 'user' ? 'visiteur' : 'assistant');
    li.innerHTML = html;
    fil.appendChild(li);
    defiler();
    return li;
  };

  var afficherSuggestions = function (visible) {
    zoneSuggestions.innerHTML = '';
    if (!visible) return;
    SUGGESTIONS.forEach(function (texte) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__suggestion';
      b.textContent = texte;
      b.addEventListener('click', function () { envoyer(texte); });
      zoneSuggestions.appendChild(b);
    });
  };

  var afficherSaisie = function () {
    var li = document.createElement('li');
    li.className = 'chat__message chat__message--assistant chat__message--saisie';
    li.setAttribute('aria-label', 'L’assistant écrit');
    li.innerHTML = '<span></span><span></span><span></span>';
    fil.appendChild(li);
    defiler();
    return li;
  };

  var demanderAgent = function () {
    // Seul le texte brut circule : le Worker reconstruit la conversation.
    var messages = historique.slice(-MAX_HISTORIQUE).map(function (m) {
      return { role: m.role, content: m.texte };
    });
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (donnees) {
      if (!donnees || typeof donnees.reply !== 'string' || !donnees.reply) throw new Error('Réponse vide');
      return formaterTexte(donnees.reply);
    });
  };

  var envoyer = function (texte) {
    texte = (texte || '').trim();
    if (!texte || enCours) return;
    enCours = true;
    afficherSuggestions(false);
    afficherMessage('user', echapper(texte));
    historique.push({ role: 'user', texte: texte, html: echapper(texte) });
    sauvegarder();

    var indicateur = afficherSaisie();
    var promesse = ENDPOINT
      ? demanderAgent().catch(function () { return repondreLocalement(texte); })
      : new Promise(function (ok) { window.setTimeout(function () { ok(repondreLocalement(texte)); }, 550); });

    promesse.then(function (html) {
      indicateur.parentNode.removeChild(indicateur);
      afficherMessage('assistant', html);
      // Pour l'agent, on garde une version texte de la réponse.
      var tmp = document.createElement('div');
      tmp.innerHTML = html.replace(/<br>/g, '\n');
      historique.push({ role: 'assistant', texte: tmp.textContent, html: html });
      sauvegarder();
      enCours = false;
    });
  };

  var ouvrir = function () {
    fenetre.hidden = false;
    racine.setAttribute('data-ouvert', 'true');
    lanceur.setAttribute('aria-expanded', 'true');
    lanceur.setAttribute('aria-label', 'Fermer l’assistant Phoxia');
    try { window.sessionStorage.setItem(CLE_STOCKAGE + '-vu', '1'); } catch (e) { /* ignoré */ }
    defiler();
    if (window.matchMedia('(min-width: 40em)').matches) champ.focus();
  };

  var fermer = function () {
    fenetre.hidden = true;
    racine.removeAttribute('data-ouvert');
    lanceur.setAttribute('aria-expanded', 'false');
    lanceur.setAttribute('aria-label', 'Ouvrir l’assistant Phoxia');
  };

  lanceur.addEventListener('click', function () {
    if (fenetre.hidden) { ouvrir(); } else { fermer(); lanceur.focus(); }
  });
  boutonFermer.addEventListener('click', function () { fermer(); lanceur.focus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !fenetre.hidden) { fermer(); lanceur.focus(); }
  });

  formulaire.addEventListener('submit', function (e) {
    e.preventDefault();
    var texte = champ.value;
    champ.value = '';
    envoyer(texte);
  });

  // Conversation en cours dans l'onglet, ou message d'accueil.
  historique = restaurer();
  if (historique.length) {
    historique.forEach(function (m) { afficherMessage(m.role, m.html); });
  } else {
    afficherMessage('assistant',
      'Bonjour 👋 Je suis l’assistant IA de Phoxia. Automatisation, agents IA, tarifs, rendez-vous : que puis-je faire pour vous ?');
    afficherSuggestions(true);
  }

  // La bulle d'invitation ne s'affiche qu'à la première visite de la session.
  var dejaVu = false;
  try { dejaVu = window.sessionStorage.getItem(CLE_STOCKAGE + '-vu') === '1'; } catch (e) { /* ignoré */ }
  if (!dejaVu) {
    window.setTimeout(function () { racine.setAttribute('data-invite', 'true'); }, 2500);
  }
})();
