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
