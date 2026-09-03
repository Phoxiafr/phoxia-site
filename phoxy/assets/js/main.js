/* Phoxy Music — menu mobile, apparitions au scroll, formulaire de contact. Sans dépendance. */
(function () {
  "use strict";

  /* Menu mobile */
  var bouton = document.querySelector("[data-bascule-menu]");
  var menu = document.querySelector("[data-menu-mobile]");
  if (bouton && menu) {
    bouton.addEventListener("click", function () {
      var ouvert = menu.getAttribute("data-ouvert") === "true";
      menu.setAttribute("data-ouvert", String(!ouvert));
      bouton.setAttribute("aria-expanded", String(!ouvert));
      document.body.style.overflow = ouvert ? "" : "hidden";
    });
    menu.querySelectorAll("a").forEach(function (lien) {
      lien.addEventListener("click", function () {
        menu.setAttribute("data-ouvert", "false");
        bouton.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Apparitions au scroll */
  var elements = document.querySelectorAll("[data-apparait]");
  if (elements.length) {
    if ("IntersectionObserver" in window) {
      var observateur = new IntersectionObserver(
        function (entrees) {
          entrees.forEach(function (entree) {
            if (entree.isIntersecting) {
              entree.target.setAttribute("data-visible", "true");
              observateur.unobserve(entree.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      elements.forEach(function (el) { observateur.observe(el); });
    } else {
      elements.forEach(function (el) { el.setAttribute("data-visible", "true"); });
    }
  }

  /* Année courante dans le pied de page */
  document.querySelectorAll("[data-annee]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Formulaire de contact : AJAX vers Formspree, repli mailto si l'endpoint n'est pas configuré */
  var formulaire = document.querySelector("[data-formulaire]");
  if (formulaire) {
    var etat = formulaire.querySelector("[data-etat]");
    var action = formulaire.getAttribute("action") || "";
    var configure = action.indexOf("REMPLACER_") === -1 && action.indexOf("formspree.io") !== -1;

    formulaire.addEventListener("submit", function (evenement) {
      if (formulaire.querySelector(".piege input") && formulaire.querySelector(".piege input").value) {
        evenement.preventDefault();
        return;
      }

      if (!configure) {
        evenement.preventDefault();
        var donnees = new FormData(formulaire);
        var sujet = encodeURIComponent("Nouveau contact via phoxy — " + (donnees.get("nom") || ""));
        var corps = encodeURIComponent(
          "Nom : " + (donnees.get("nom") || "") + "\n" +
          "Email : " + (donnees.get("email") || "") + "\n" +
          "Sujet : " + (donnees.get("sujet") || "") + "\n\n" +
          (donnees.get("message") || "")
        );
        window.location.href = "mailto:contact@phoxy-music.fr?subject=" + sujet + "&body=" + corps;
        afficherEtat("ok", "Votre messagerie va s'ouvrir avec le message pré-rempli : il ne reste qu'à l'envoyer.");
        return;
      }

      evenement.preventDefault();
      var corpsAjax = new FormData(formulaire);
      afficherEtat(null, "Envoi en cours…");

      fetch(action, {
        method: "POST",
        body: corpsAjax,
        headers: { Accept: "application/json" },
      })
        .then(function (reponse) {
          if (reponse.ok) {
            afficherEtat("ok", "Message envoyé. Réponse sous 48 heures ouvrées.");
            formulaire.reset();
          } else {
            afficherEtat("erreur", "L'envoi a échoué. Réessayez ou écrivez directement à contact@phoxy-music.fr.");
          }
        })
        .catch(function () {
          afficherEtat("erreur", "L'envoi a échoué. Réessayez ou écrivez directement à contact@phoxy-music.fr.");
        });
    });

    function afficherEtat(type, texte) {
      if (!etat) return;
      etat.textContent = texte;
      etat.setAttribute("data-visible", "true");
      etat.classList.remove("formulaire__etat--ok", "formulaire__etat--erreur");
      if (type === "ok") etat.classList.add("formulaire__etat--ok");
      if (type === "erreur") etat.classList.add("formulaire__etat--erreur");
    }
  }
})();
