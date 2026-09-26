/* =============================================================
   Minubu : configuration de l'établissement
   C'est le seul fichier à modifier pour changer horaires,
   coordonnées, paiement et programme de fidélité.
   ============================================================= */
(function (racine) {
  'use strict';

  var CONFIG = {
    nom: 'Minubu',
    slogan: 'Coffee, brunch & great people',
    adresse: {
      rue: '333 Corniche Kennedy',
      codePostal: '13007',
      ville: 'Marseille',
      complement: 'Face mer, dans le 7e arrondissement',
      lat: 43.2732,
      lng: 5.3630
    },
    instagram: 'https://www.instagram.com/minubu.coffee/',
    instagramPseudo: '@minubu.coffee',
    // Adresse de réception des demandes (privatisation, contact).
    email: '',

    fuseau: 'Europe/Paris',

    /* Horaires du coffee shop, par jour (0 = dimanche … 6 = samedi).
       null = fermé. Heures au format "HH:MM". */
    horaires: {
      0: ['09:00', '18:00'],
      1: ['09:00', '18:00'],
      2: ['09:00', '18:00'],
      3: ['09:00', '18:00'],
      4: ['09:00', '18:00'],
      5: ['09:00', '18:00'],
      6: ['09:00', '18:00']
    },

    /* Cuisine (brunch & lunch, sucré) : du mercredi au dimanche, 10h à 15h,
       d'après la page d'accueil actuelle. La carte PDF de janvier 2026
       indique « fermée le lundi » : à confirmer avec l'équipe. */
    cuisine: {
      0: ['10:00', '15:00'],
      1: null,
      2: null,
      3: ['10:00', '15:00'],
      4: ['10:00', '15:00'],
      5: ['10:00', '15:00'],
      6: ['10:00', '15:00']
    },

    /* Click & collect */
    retrait: {
      delaiMinimumMinutes: 15,   // temps de préparation minimum
      pasMinutes: 15,            // un créneau toutes les 15 minutes
      joursAVenir: 2,            // aujourd'hui + 2 jours
      dernierCreneauAvantFermeture: 15 // minutes
    },

    pourboires: [0, 5, 10, 15], // en pourcentage

    /* Fidélité : 1 tampon par boisson achetée, la 10e est offerte. */
    fidelite: {
      tamponsPourRecompense: 9,
      valeurRecompenseMax: 600 // centimes : boisson offerte jusqu'à 6,00 €
    },

    cartesCadeaux: {
      montants: [2500, 4000, 6000, 10000],
      min: 1000,
      max: 30000
    },

    /* Paiement.
       - endpointPaiement vide : mode démonstration, aucun débit réel.
       - endpointPaiement renseigné : le panier est envoyé à la fonction
         serveur (voir api/create-checkout-session.js) qui recalcule les
         prix et renvoie l'URL de paiement Stripe Checkout. */
    endpointPaiement: '',

    /* Formulaires (privatisation, contact). Mettre une URL Formspree
       (https://formspree.io/f/xxxx). Vide : ouverture de la messagerie. */
    endpointFormulaire: '',

    /* URL publique du site, utilisée dans les données structurées. */
    urlSite: 'https://phoxia.fr/minubu/'
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = CONFIG; }
  else { racine.MINUBU_CONFIG = CONFIG; }
})(typeof self !== 'undefined' ? self : this);
