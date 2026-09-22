// Infos de la supérette : source unique pour les publications, les avis et WhatsApp.
export const BOUTIQUE = {
  nom: "Supérette Paradis",
  adresse: "396 rue Paradis, 13008 Marseille",
  telephone: "09 83 09 75 27",
  itineraire: "https://www.google.com/maps/dir/?api=1&destination=Superette+Paradis+396+Rue+Paradis+13008+Marseille",
  // Remplacer par le lien direct de la boutique Uber Eats
  uberEats: "https://www.ubereats.com/fr/search?q=Superette%20Paradis%20Marseille",
  rayons: ["boissons fraîches", "snacks et douceurs", "épicerie", "produits de dépannage"],
  signature: "L'équipe de la Supérette Paradis",
};

// Horaires relevés sur Google Maps (un seul jour vérifié) : à confirmer jour par jour.
// Une fermeture après minuit s'écrit telle quelle ("04:00") : elle compte pour la nuit suivante.
// 0 = dimanche ... 6 = samedi. Mettre null pour un jour de fermeture.
export const HORAIRES = {
  0: { ouverture: "12:30", fermeture: "04:00" },
  1: { ouverture: "12:30", fermeture: "04:00" },
  2: { ouverture: "12:30", fermeture: "04:00" },
  3: { ouverture: "12:30", fermeture: "04:00" },
  4: { ouverture: "12:30", fermeture: "04:00" },
  5: { ouverture: "12:30", fermeture: "04:00" },
  6: { ouverture: "12:30", fermeture: "04:00" },
};

export const FUSEAU = "Europe/Paris";
