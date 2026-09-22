// Publie le post de la semaine sur Instagram et Facebook (API Graph de Meta, gratuite).
// Par défaut : simulation, rien n'est envoyé. Ajouter --envoyer pour publier pour de vrai.
//   npm run publier                 aperçu du post de la semaine
//   npm run publier -- --envoyer    publication
import { postDeLaSemaine } from "./calendrier.js";

const GRAPH = "https://graph.facebook.com/v21.0";
const { SITE_URL, META_ACCESS_TOKEN, INSTAGRAM_USER_ID, FACEBOOK_PAGE_ID } = process.env;

async function graph(chemin, parametres) {
  const reponse = await fetch(`${GRAPH}/${chemin}`, {
    method: "POST",
    body: new URLSearchParams({ ...parametres, access_token: META_ACCESS_TOKEN }),
  });
  const json = await reponse.json();
  if (!reponse.ok || json.error) throw new Error(`Meta ${chemin} : ${json.error?.message ?? reponse.status}`);
  return json;
}

// Instagram : création du média puis publication, avec une courte attente le temps du traitement
async function publierInstagram(imageUrl, legende) {
  const { id } = await graph(`${INSTAGRAM_USER_ID}/media`, { image_url: imageUrl, caption: legende });
  for (let essai = 0; essai < 5; essai++) {
    try {
      return await graph(`${INSTAGRAM_USER_ID}/media_publish`, { creation_id: id });
    } catch (erreur) {
      if (essai === 4) throw erreur;
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

const publierFacebook = (imageUrl, legende) =>
  graph(`${FACEBOOK_PAGE_ID}/photos`, { url: imageUrl, message: legende });

const post = postDeLaSemaine();
const imageUrl = `${(SITE_URL ?? "https://VOTRE-SITE").replace(/\/$/, "")}/visuels/${post.visuel}`;
console.log(`Visuel : ${imageUrl}\n\n${post.legende}\n`);

if (!process.argv.includes("--envoyer")) {
  console.log("Simulation : rien n'a été publié. Ajoutez --envoyer pour publier.");
} else {
  const manquants = ["SITE_URL", "META_ACCESS_TOKEN", "INSTAGRAM_USER_ID", "FACEBOOK_PAGE_ID"].filter((k) => !process.env[k]);
  if (manquants.length) {
    console.error(`Variables manquantes dans .env : ${manquants.join(", ")}`);
    process.exit(1);
  }
  const resultats = await Promise.allSettled([publierInstagram(imageUrl, post.legende), publierFacebook(imageUrl, post.legende)]);
  ["Instagram", "Facebook"].forEach((reseau, i) => {
    const r = resultats[i];
    console.log(r.status === "fulfilled" ? `${reseau} : publié (${r.value.id ?? r.value.post_id})` : `${reseau} : échec, ${r.reason.message}`);
  });
  if (resultats.some((r) => r.status === "rejected")) process.exit(1);
}
