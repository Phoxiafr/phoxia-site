import { BOUTIQUE } from "../config.js";
import { etatActuel, texteHoraires } from "../lib/horaires.js";

// Réponses par mots-clés : aucun coût par message, aucune invention possible.
const sansAccents = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const SUJETS = [
  {
    motsCles: ["ouvert", "ferme", "horaire", "heure", "jusqu", "ce soir", "cette nuit", "maintenant"],
    reponse: (date) => `${etatActuel(date)} Nos horaires : ${texteHoraires()}.`,
  },
  {
    motsCles: ["adresse", "ou etes", "ou vous", "ou se trouve", "situe", "itineraire", "trouver", "localisation"],
    reponse: () => `On est au ${BOUTIQUE.adresse}. Itinéraire : ${BOUTIQUE.itineraire}`,
  },
  {
    motsCles: ["livr", "uber", "commande", "domicile"],
    reponse: () => `On livre via Uber Eats : ${BOUTIQUE.uberEats}`,
  },
  {
    motsCles: ["telephone", "numero", "appeler", "joindre"],
    reponse: () => `Vous pouvez nous appeler au ${BOUTIQUE.telephone}.`,
  },
  {
    motsCles: ["vous avez", "avez-vous", "avez vous", "il y a", "vendez", "dispo", "stock", "rayon"],
    reponse: () => `Dans nos rayons : ${BOUTIQUE.rayons.join(", ")}. Pour un produit précis, le plus sûr est de nous appeler au ${BOUTIQUE.telephone}, on vérifie tout de suite.`,
  },
  {
    motsCles: ["prix", "combien", "tarif", "coute"],
    reponse: () => `Les prix sont affichés en rayon. Pour un produit précis, appelez-nous au ${BOUTIQUE.telephone}.`,
  },
  {
    motsCles: ["merci"],
    reponse: () => "Avec plaisir ! À bientôt rue Paradis 🌴",
  },
];

const BIENVENUE = ["bonjour", "salut", "bonsoir", "hello", "coucou", "slt", "bjr", "cc"];

const MENU = `Je peux vous renseigner sur :
• nos horaires (« vous êtes ouverts ? »)
• l'adresse
• la livraison Uber Eats
• nos produits
Pour tout le reste, appelez-nous au ${BOUTIQUE.telephone}.`;

export function repondre(message, date = new Date()) {
  const texte = sansAccents(message ?? "");
  const reponses = SUJETS.filter((s) => s.motsCles.some((m) => texte.includes(m))).map((s) => s.reponse(date));
  if (reponses.length) return reponses.join("\n\n");
  const salue = BIENVENUE.some((m) => texte.split(/\W+/).includes(m));
  return `${salue ? `Bonjour et bienvenue à la ${BOUTIQUE.nom} ! ` : ""}${MENU}`;
}
