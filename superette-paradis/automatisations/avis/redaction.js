import Anthropic from "@anthropic-ai/sdk";
import { BOUTIQUE } from "../config.js";
import { texteHoraires } from "../lib/horaires.js";

const ETOILES = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
export const note = (avis) => ETOILES[avis.starRating] ?? (Number(avis.starRating) || 0);
const prenom = (avis) => (avis.reviewer?.displayName ?? "").split(" ")[0];

const CONSIGNES = `Tu rédiges les réponses publiques aux avis Google de la ${BOUTIQUE.nom}, une supérette de quartier au ${BOUTIQUE.adresse}, ouverte ${texteHoraires()}. Elle vend : ${BOUTIQUE.rayons.join(", ")}. Livraison possible via Uber Eats. Téléphone : ${BOUTIQUE.telephone}.

La réponse est publiée telle quelle sous l'avis, au nom de la supérette :
- en français, chaleureuse et simple, comme un commerçant qui connaît ses clients ; vouvoiement ;
- 2 à 4 phrases, sans hashtag ni émoji en excès (un seul au maximum) ;
- reprends un détail précis de l'avis quand il y en a un, pour que la réponse ne sonne pas automatique ;
- avis positif : remercie et invite à revenir ;
- avis négatif ou mitigé : remercie, excuse-toi sans te justifier longuement, propose d'en parler par téléphone ; ne promets rien que la supérette n'aurait pas décidé (remboursement, geste commercial) ;
- n'invente aucune information absente de ce message (prix, produits, promotions) ;
- termine par « ${BOUTIQUE.signature} ».
Réponds uniquement avec le texte de la réponse.`;

// Réponse type, gratuite, utilisée sans clé API ou si l'appel échoue
export function reponseModele(avis) {
  const qui = prenom(avis) ? ` ${prenom(avis)}` : "";
  if (note(avis) >= 4) {
    return `Merci beaucoup${qui} pour votre avis ! Ça nous fait vraiment plaisir. À très vite rue Paradis !\n${BOUTIQUE.signature}`;
  }
  return `Merci${qui} d'avoir pris le temps de nous écrire, et désolés que votre passage ne vous ait pas satisfait. Appelez-nous au ${BOUTIQUE.telephone} pour qu'on en parle.\n${BOUTIQUE.signature}`;
}

let client;

export async function brouillon(avis) {
  if (!process.env.ANTHROPIC_API_KEY) return { texte: reponseModele(avis), source: "modèle" };
  client ??= new Anthropic();
  const contenu = `Avis de ${avis.reviewer?.displayName ?? "un client"}, ${note(avis)}/5 :\n${avis.comment?.trim() || "(note sans commentaire)"}`;
  try {
    const reponse = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: CONSIGNES,
      messages: [{ role: "user", content: contenu }],
    });
    const texte = reponse.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (reponse.stop_reason === "refusal" || !texte) return { texte: reponseModele(avis), source: "modèle" };
    return { texte, source: "claude" };
  } catch (erreur) {
    if (erreur instanceof Anthropic.AuthenticationError) console.error("Clé ANTHROPIC_API_KEY invalide.");
    else if (erreur instanceof Anthropic.RateLimitError) console.error("Limite d'appels atteinte, réponse type utilisée.");
    else if (erreur instanceof Anthropic.APIError) console.error(`Erreur API ${erreur.status} : ${erreur.message}`);
    else throw erreur;
    return { texte: reponseModele(avis), source: "modèle" };
  }
}
