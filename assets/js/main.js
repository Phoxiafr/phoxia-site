/* =============================================================
   Phoxia — comportements d'interface
   Aucune dépendance externe.
   ============================================================= */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Menu mobile
     ---------------------------------------------------------- */
  var bascule = document.querySelector('[data-bascule-menu]');
  var panneau = document.querySelector('[data-menu-mobile]');

  function fermerMenu() {
    if (!bascule || !panneau) return;
    bascule.setAttribute('aria-expanded', 'false');
    panneau.setAttribute('data-ouvert', 'false');
    document.body.removeAttribute('data-menu-ouvert');
  }

  function ouvrirMenu() {
    if (!bascule || !panneau) return;
    bascule.setAttribute('aria-expanded', 'true');
    panneau.setAttribute('data-ouvert', 'true');
    document.body.setAttribute('data-menu-ouvert', 'true');
  }

  if (bascule && panneau) {
    bascule.addEventListener('click', function () {
      var ouvert = bascule.getAttribute('aria-expanded') === 'true';
      if (ouvert) { fermerMenu(); } else { ouvrirMenu(); }
    });

    // Fermeture au clic sur un lien du panneau
    panneau.addEventListener('click', function (e) {
      if (e.target.closest('a')) fermerMenu();
    });

    // Fermeture à la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerMenu();
    });

    // Fermeture si on repasse en affichage large
    var large = window.matchMedia('(min-width: 70em)');
    var surChangement = function (e) { if (e.matches) fermerMenu(); };
    if (large.addEventListener) { large.addEventListener('change', surChangement); }
    else if (large.addListener) { large.addListener(surChangement); }
  }

  /* ----------------------------------------------------------
     Filet sous l'en-tête au défilement
     ---------------------------------------------------------- */
  var entete = document.querySelector('[data-entete]');
  if (entete) {
    var majEntete = function () {
      entete.setAttribute('data-defile', window.scrollY > 8 ? 'true' : 'false');
    };
    majEntete();
    window.addEventListener('scroll', majEntete, { passive: true });
  }

  /* ----------------------------------------------------------
     Lien de navigation actif selon la section visible
     ---------------------------------------------------------- */
  var liensAncre = Array.prototype.slice.call(
    document.querySelectorAll('.nav__lien[href^="#"]')
  );

  if (liensAncre.length && 'IntersectionObserver' in window) {
    var sections = liensAncre
      .map(function (lien) { return document.querySelector(lien.getAttribute('href')); })
      .filter(Boolean);

    var observateurNav = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        liensAncre.forEach(function (lien) {
          var actif = lien.getAttribute('href') === '#' + entree.target.id;
          if (actif) { lien.setAttribute('aria-current', 'page'); }
          else { lien.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { observateurNav.observe(s); });
  }

  /* ----------------------------------------------------------
     Apparition progressive au défilement
     ---------------------------------------------------------- */
  var animables = document.querySelectorAll('[data-apparait]');
  var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (animables.length && 'IntersectionObserver' in window && !mouvementReduit) {
    var observateur = new IntersectionObserver(function (entrees, obs) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        entree.target.setAttribute('data-visible', 'true');
        obs.unobserve(entree.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(animables, function (el) { observateur.observe(el); });
  } else {
    Array.prototype.forEach.call(animables, function (el) {
      el.setAttribute('data-visible', 'true');
    });
  }

  /* ----------------------------------------------------------
     Carrousel projets et voyages
     ---------------------------------------------------------- */
  var carrousel = document.querySelector('[data-carrousel]');

  if (carrousel) {
    var piste = carrousel.querySelector('[data-carrousel-piste]');
    var diapos = Array.prototype.slice.call(carrousel.querySelectorAll('[data-carrousel-diapo]'));
    var boutonPrecedent = carrousel.querySelector('[data-carrousel-precedent]');
    var boutonSuivant = carrousel.querySelector('[data-carrousel-suivant]');
    var compteur = carrousel.querySelector('[data-carrousel-compteur]');
    var mouvementReduitCarrousel = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var indexActif = 0;
    var minuteurCarrousel = null;
    var blocageScroll = false;
    var minuteurBlocage;

    function majCompteur() {
      if (compteur) { compteur.textContent = (indexActif + 1) + ' / ' + diapos.length; }
    }

    // Distance entre deux diapositives (largeur + espacement), mesurée en direct
    // pour rester juste quelle que soit la largeur d'écran.
    function pasDefilement() {
      if (diapos.length < 2) { return diapos[0] ? diapos[0].getBoundingClientRect().width : 0; }
      return diapos[1].getBoundingClientRect().left - diapos[0].getBoundingClientRect().left;
    }

    function allerA(index) {
      indexActif = (index + diapos.length) % diapos.length;
      // Sur les diapositives de bord, le navigateur peut tronquer le défilement
      // (pas assez de piste à droite pour un alignement complet) : le blocage
      // évite que ce recalage-là écrase l'index qu'on vient de choisir.
      // "scrollend" lève le blocage dès que l'animation est vraiment finie ;
      // le minuteur n'est qu'un filet de sécurité pour les navigateurs sans ça.
      blocageScroll = true;
      window.clearTimeout(minuteurBlocage);
      minuteurBlocage = window.setTimeout(function () { blocageScroll = false; }, 1200);
      piste.scrollTo({
        left: indexActif * pasDefilement(),
        behavior: mouvementReduitCarrousel ? 'auto' : 'smooth'
      });
      majCompteur();
    }

    if ('onscrollend' in window) {
      piste.addEventListener('scrollend', function () {
        window.clearTimeout(minuteurBlocage);
        blocageScroll = false;
      });
    }

    function demarrerDefilement() {
      if (mouvementReduitCarrousel) return;
      arreterDefilement();
      minuteurCarrousel = window.setInterval(function () {
        allerA(indexActif + 1);
      }, 4500);
    }

    function arreterDefilement() {
      if (minuteurCarrousel) { window.clearInterval(minuteurCarrousel); minuteurCarrousel = null; }
    }

    if (boutonPrecedent) {
      boutonPrecedent.addEventListener('click', function () { arreterDefilement(); allerA(indexActif - 1); });
    }
    if (boutonSuivant) {
      boutonSuivant.addEventListener('click', function () { arreterDefilement(); allerA(indexActif + 1); });
    }

    // Tient le compteur à jour pendant un défilement tactile libre (glisser)
    var minuteurScroll;
    piste.addEventListener('scroll', function () {
      if (blocageScroll) return;
      window.clearTimeout(minuteurScroll);
      minuteurScroll = window.setTimeout(function () {
        var pas = pasDefilement();
        if (pas) {
          indexActif = Math.round(piste.scrollLeft / pas);
          majCompteur();
        }
      }, 120);
    }, { passive: true });

    carrousel.addEventListener('mouseenter', arreterDefilement);
    carrousel.addEventListener('mouseleave', demarrerDefilement);
    carrousel.addEventListener('focusin', arreterDefilement);
    carrousel.addEventListener('focusout', demarrerDefilement);
    carrousel.addEventListener('touchstart', arreterDefilement, { passive: true });

    majCompteur();
    demarrerDefilement();
  }

  /* ----------------------------------------------------------
     Réseau de neurones animé derrière le hero
     ---------------------------------------------------------- */
  var toile = document.querySelector('[data-reseau]');

  if (toile && toile.getContext) {
    var ctx = toile.getContext('2d');
    var mouvementReduitReseau = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noeuds = [];
    var largeurToile = 0;
    var hauteurToile = 0;
    var impulsions = [];
    var visibleReseau = true;
    var DISTANCE = 150;

    var dimensionner = function () {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      largeurToile = toile.offsetWidth;
      hauteurToile = toile.offsetHeight;
      toile.width = largeurToile * ratio;
      toile.height = hauteurToile * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      var total = Math.round(Math.min(70, Math.max(24, largeurToile * hauteurToile / 16000)));
      noeuds = [];
      for (var i = 0; i < total; i++) {
        noeuds.push({
          x: Math.random() * largeurToile,
          y: Math.random() * hauteurToile,
          vx: (Math.random() - .5) * .25,
          vy: (Math.random() - .5) * .25,
          r: Math.random() * 1.6 + 1
        });
      }
      impulsions = [];
    };

    var dessiner = function () {
      ctx.clearRect(0, 0, largeurToile, hauteurToile);
      var i, j, a, b, dx, dy, d;

      for (i = 0; i < noeuds.length; i++) {
        a = noeuds[i];
        for (j = i + 1; j < noeuds.length; j++) {
          b = noeuds[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < DISTANCE) {
            ctx.strokeStyle = 'rgba(28, 107, 168, ' + (0.4 * (1 - d / DISTANCE)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // Impulsions qui parcourent les connexions, comme un signal
      impulsions.forEach(function (p) {
        var x = p.a.x + (p.b.x - p.a.x) * p.t;
        var y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = 'rgba(91, 163, 221, .95)';
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      });

      for (i = 0; i < noeuds.length; i++) {
        a = noeuds[i];
        ctx.fillStyle = 'rgba(20, 33, 61, .6)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    };

    var lancerImpulsion = function () {
      var a = noeuds[Math.floor(Math.random() * noeuds.length)];
      var voisins = noeuds.filter(function (n) {
        var dx = n.x - a.x, dy = n.y - a.y;
        return n !== a && dx * dx + dy * dy < DISTANCE * DISTANCE;
      });
      if (voisins.length) {
        impulsions.push({ a: a, b: voisins[Math.floor(Math.random() * voisins.length)], t: 0 });
      }
    };

    var animer = function () {
      if (!visibleReseau) return;
      noeuds.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > largeurToile) n.vx *= -1;
        if (n.y < 0 || n.y > hauteurToile) n.vy *= -1;
      });
      if (impulsions.length < 6 && Math.random() < .05) lancerImpulsion();
      impulsions = impulsions.filter(function (p) { p.t += .018; return p.t < 1; });
      dessiner();
      window.requestAnimationFrame(animer);
    };

    dimensionner();
    dessiner();

    var minuteurRedim;
    window.addEventListener('resize', function () {
      window.clearTimeout(minuteurRedim);
      minuteurRedim = window.setTimeout(function () { dimensionner(); dessiner(); }, 200);
    });

    if (!mouvementReduitReseau) {
      // L'animation s'arrête quand le hero sort de l'écran, pour ménager la batterie.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entrees) {
          var etaitVisible = visibleReseau;
          visibleReseau = entrees[0].isIntersecting;
          if (visibleReseau && !etaitVisible) window.requestAnimationFrame(animer);
        }).observe(toile);
      }
      window.requestAnimationFrame(animer);
    }
  }

  /* ----------------------------------------------------------
     Démonstration d'agent IA
     ---------------------------------------------------------- */
  var demo = document.querySelector('[data-demo]');

  if (demo) {
    var journal = demo.querySelector('[data-demo-journal]');
    var onglets = Array.prototype.slice.call(demo.querySelectorAll('[data-demo-onglet]'));
    var mouvementReduitDemo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var minuteursDemo = [];
    var demoLancee = false;

    var scenarios = {
      prospection: [
        ['entree', 'Nouveau formulaire : <strong>Clara M.</strong>, directrice d’une agence immobilière, 12 salariés'],
        ['pensee', 'Secteur et taille compatibles. Je vérifie l’historique avant de répondre.'],
        ['outil', 'crm.rechercher("agence immobilière Clara M.") → aucun contact existant'],
        ['outil', 'web.analyser(site de l’agence) → 12 biens en ligne, pas de réponse automatique'],
        ['pensee', 'Besoin probable : qualification des demandes de visite. Score : 82 / 100.'],
        ['action', 'Fiche créée dans le CRM, e-mail personnalisé rédigé et placé en attente de validation.'],
        ['action', 'Relance planifiée à J+3 si pas de réponse.']
      ],
      support: [
        ['entree', 'Message client : « Ma commande #4821 n’est toujours pas arrivée. »'],
        ['outil', 'commandes.statut(4821) → expédiée le 18/09, colis bloqué au dépôt'],
        ['outil', 'base_connaissances.chercher("colis bloqué") → procédure transporteur trouvée'],
        ['pensee', 'Cas connu, pas d’escalade nécessaire. Ton : rassurant et précis.'],
        ['action', 'Réponse rédigée avec le lien de suivi et un délai estimé de 48 h.'],
        ['action', 'Ticket étiqueté « livraison », signalement envoyé au transporteur.']
      ],
      reporting: [
        ['entree', 'Lundi 8 h 00 : rapport hebdomadaire demandé par la direction'],
        ['outil', 'ventes.exporter(semaine 38) → 146 lignes'],
        ['outil', 'marketing.campagnes() → 3 campagnes actives, coût total 1 240 €'],
        ['pensee', 'Chiffre d’affaires +9 % sur la semaine, porté par la campagne de rentrée.'],
        ['pensee', 'Point d’attention : taux de conversion mobile en baisse de 2 points.'],
        ['action', 'Synthèse d’une page générée avec 3 graphiques et 2 recommandations.'],
        ['action', 'Rapport envoyé à la direction et archivé dans le drive partagé.']
      ],
      documents: [
        ['entree', '37 factures fournisseurs reçues par e-mail (PDF, scans, photos)'],
        ['outil', 'vision.extraire(37 fichiers) → fournisseur, montant, TVA, échéance'],
        ['pensee', '35 factures conformes. 2 anomalies : un doublon et un montant incohérent.'],
        ['outil', 'comptabilite.rapprocher(35) → 35 écritures proposées'],
        ['action', 'Écritures préparées pour validation par le comptable.'],
        ['action', '2 anomalies signalées avec le détail de l’écart. Temps gagné estimé : 3 h.']
      ]
    };

    var libelles = { entree: 'Entrée', pensee: 'Analyse', outil: 'Outil', action: 'Action' };

    var viderMinuteurs = function () {
      minuteursDemo.forEach(window.clearTimeout);
      minuteursDemo = [];
    };

    var ajouterLigne = function (etape) {
      var curseur = journal.querySelector('.console__curseur');
      if (curseur) curseur.parentNode.removeChild(curseur);
      var li = document.createElement('li');
      li.className = 'ligne-ia ligne-ia--' + etape[0];
      li.innerHTML = '<span class="ligne-ia__type">' + libelles[etape[0]] + '</span>' +
        '<span class="ligne-ia__texte">' + etape[1] + '</span>';
      journal.appendChild(li);
    };

    var ajouterCurseur = function () {
      var li = document.createElement('li');
      li.className = 'ligne-ia';
      li.innerHTML = '<span></span><span><span class="console__curseur"></span></span>';
      journal.appendChild(li);
    };

    var jouer = function (cle) {
      viderMinuteurs();
      journal.innerHTML = '';
      var etapes = scenarios[cle];
      if (mouvementReduitDemo) {
        etapes.forEach(ajouterLigne);
        return;
      }
      ajouterCurseur();
      etapes.forEach(function (etape, i) {
        minuteursDemo.push(window.setTimeout(function () {
          ajouterLigne(etape);
          if (i < etapes.length - 1) ajouterCurseur();
        }, 500 + i * 1100));
      });
    };

    var activer = function (onglet) {
      onglets.forEach(function (o) { o.setAttribute('aria-selected', o === onglet ? 'true' : 'false'); });
      jouer(onglet.getAttribute('data-demo-onglet'));
    };

    onglets.forEach(function (onglet) {
      onglet.addEventListener('click', function () { demoLancee = true; activer(onglet); });
    });

    // Le premier scénario démarre quand la console arrive à l'écran.
    if ('IntersectionObserver' in window && !mouvementReduitDemo) {
      new IntersectionObserver(function (entrees, obs) {
        if (!entrees[0].isIntersecting) return;
        obs.disconnect();
        if (!demoLancee) activer(onglets[0]);
      }, { threshold: .3 }).observe(demo);
    } else {
      activer(onglets[0]);
    }
  }

  /* ----------------------------------------------------------
     Année courante dans le pied de page
     ---------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-annee]'),
    function (el) { el.textContent = new Date().getFullYear(); }
  );

  /* ----------------------------------------------------------
     Formulaire de contact
     Envoi AJAX vers Formspree, avec repli mailto si indisponible.
     ---------------------------------------------------------- */
  var formulaire = document.querySelector('[data-formulaire-contact]');

  if (formulaire) {
    var zoneMessage = formulaire.querySelector('[data-message-formulaire]');
    var boutonEnvoi = formulaire.querySelector('[type="submit"]');
    var libelleEnvoi = boutonEnvoi ? boutonEnvoi.textContent : '';

    var afficherMessage = function (texte, erreur) {
      if (!zoneMessage) return;
      zoneMessage.textContent = texte;
      zoneMessage.hidden = false;
      zoneMessage.style.borderLeftColor = erreur ? '#B4402F' : '';
      zoneMessage.setAttribute('role', 'status');
    };

    formulaire.addEventListener('submit', function (e) {
      // Pot de miel : si rempli, c'est un robot.
      var piege = formulaire.querySelector('[name="_gotcha"]');
      if (piege && piege.value) { e.preventDefault(); return; }

      var action = formulaire.getAttribute('action') || '';

      // Endpoint non configuré : on bascule sur un courriel pré-rempli.
      if (action.indexOf('VOTRE_ID_FORMSPREE') !== -1 || action === '') {
        e.preventDefault();
        var donnees = new FormData(formulaire);
        var corps = [];
        donnees.forEach(function (valeur, cle) {
          if (cle.charAt(0) === '_' || !valeur) return;
          corps.push(cle + ' : ' + valeur);
        });
        var sujet = 'Demande depuis phoxia.fr';
        window.location.href = 'mailto:mathieu@phoxia.fr?subject=' +
          encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps.join('\n'));
        afficherMessage('Votre logiciel de messagerie va s’ouvrir avec le message pré-rempli.');
        return;
      }

      e.preventDefault();
      if (boutonEnvoi) { boutonEnvoi.disabled = true; boutonEnvoi.textContent = 'Envoi en cours…'; }

      fetch(action, {
        method: 'POST',
        body: new FormData(formulaire),
        headers: { Accept: 'application/json' }
      })
        .then(function (reponse) {
          if (reponse.ok) {
            formulaire.reset();
            afficherMessage('Message bien reçu. Réponse sous 48 heures ouvrées.');
          } else {
            afficherMessage('L’envoi a échoué. Écrivez directement à mathieu@phoxia.fr.', true);
          }
        })
        .catch(function () {
          afficherMessage('L’envoi a échoué. Écrivez directement à mathieu@phoxia.fr.', true);
        })
        .then(function () {
          if (boutonEnvoi) { boutonEnvoi.disabled = false; boutonEnvoi.textContent = libelleEnvoi; }
        });
    });
  }
})();
