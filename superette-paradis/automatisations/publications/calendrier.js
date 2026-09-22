import { BOUTIQUE } from "../config.js";

const HASHTAGS = "#Marseille #Marseille8 #RueParadis #Superette #Epicerie #OuvertTard";

// Un post par semaine, en boucle. "visuel" = fichier dans site/visuels/.
export const CALENDRIER = [
  {
    visuel: "paradis-post-1.png",
    legende: `Votre petit paradis du quotidien 🌴\nBoissons fraîches, snacks, épicerie : tout pour dépanner, au ${BOUTIQUE.adresse}.`,
  },
  {
    visuel: "paradis-post-4.png",
    legende: "Une envie en pleine nuit ? 🌙\nOn est ouverts jusqu'à 4h du matin, quand tout le reste est fermé.",
  },
  {
    visuel: "paradis-post-2.png",
    legende: "Des boissons bien fraîches 🥤\nSodas, jus, thés glacés, eaux : le frigo est plein, passez vous servir.",
  },
  {
    visuel: "paradis-post-5.png",
    legende: `Merci pour vos 152 avis et la note de 4,9/5 sur Google ⭐\nPas le temps de passer ? Commandez sur Uber Eats, on vous livre.`,
  },
  {
    visuel: "paradis-post-3.png",
    legende: "Un oubli ? Une envie ? 🛒\nC'est juste à côté, rue Paradis.",
  },
];

// Numéro de semaine ISO : chaque semaine tombe sur le post suivant du calendrier
export function semaineIso(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const jour = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - jour);
  const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - debutAnnee) / 86400000 + 1) / 7);
}

export function postDeLaSemaine(date = new Date()) {
  const post = CALENDRIER[semaineIso(date) % CALENDRIER.length];
  return { ...post, legende: `${post.legende}\n\n📍 ${BOUTIQUE.adresse}\n${HASHTAGS}` };
}
