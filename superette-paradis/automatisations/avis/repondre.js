// Réponses aux avis Google, toujours relues par la supérette avant publication.
//   npm run avis -- --demo      essai sur des avis d'exemple (aucun compte requis)
//   npm run avis                récupère les avis sans réponse et écrit avis/brouillons.json
//   npm run avis -- --publier   publie les brouillons marqués "valide": true
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brouillon, note } from "./redaction.js";

const ici = path.dirname(fileURLToPath(import.meta.url));
const FICHIER = path.join(ici, "brouillons.json");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_ACCOUNT_ID, GOOGLE_LOCATION_ID } = process.env;
const BASE = `https://mybusiness.googleapis.com/v4/accounts/${GOOGLE_ACCOUNT_ID}/locations/${GOOGLE_LOCATION_ID}`;

async function jetonGoogle() {
  const manquants = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GOOGLE_ACCOUNT_ID", "GOOGLE_LOCATION_ID"].filter((k) => !process.env[k]);
  if (manquants.length) throw new Error(`Variables manquantes dans .env : ${manquants.join(", ")}`);
  const reponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }),
  });
  const json = await reponse.json();
  if (!reponse.ok) throw new Error(`Google OAuth : ${json.error_description ?? json.error}`);
  return json.access_token;
}

async function avisSansReponse(jeton) {
  const tous = [];
  let page = "";
  do {
    const reponse = await fetch(`${BASE}/reviews?pageSize=50${page ? `&pageToken=${page}` : ""}`, { headers: { Authorization: `Bearer ${jeton}` } });
    const json = await reponse.json();
    if (!reponse.ok) throw new Error(`Google avis : ${json.error?.message ?? reponse.status}`);
    tous.push(...(json.reviews ?? []));
    page = json.nextPageToken ?? "";
  } while (page);
  return tous.filter((a) => !a.reviewReply);
}

async function rediger(avis) {
  const brouillons = [];
  for (const a of avis) {
    const { texte, source } = await brouillon(a);
    brouillons.push({ reviewId: a.reviewId, auteur: a.reviewer?.displayName, note: note(a), avis: a.comment ?? "", reponse: texte, source, valide: false });
    console.log(`\n${"★".repeat(note(a))} ${a.reviewer?.displayName ?? ""}\n« ${a.comment ?? "(sans commentaire)"} »\n→ ${texte}`);
  }
  return brouillons;
}

if (process.argv.includes("--demo")) {
  const exemples = JSON.parse(fs.readFileSync(path.join(ici, "exemple-avis.json"), "utf8"));
  await rediger(exemples);
  console.log("\nDémo : avis fictifs, rien n'a été enregistré ni publié.");
} else if (process.argv.includes("--publier")) {
  const brouillons = JSON.parse(fs.readFileSync(FICHIER, "utf8"));
  const aPublier = brouillons.filter((b) => b.valide && !b.publie);
  if (!aPublier.length) console.log('Aucun brouillon marqué "valide": true dans avis/brouillons.json.');
  const jeton = aPublier.length ? await jetonGoogle() : null;
  for (const b of aPublier) {
    const reponse = await fetch(`${BASE}/reviews/${b.reviewId}/reply`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${jeton}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comment: b.reponse }),
    });
    if (reponse.ok) b.publie = true;
    console.log(`${b.auteur} : ${reponse.ok ? "réponse publiée" : `échec (${reponse.status})`}`);
  }
  fs.writeFileSync(FICHIER, JSON.stringify(brouillons, null, 2));
} else {
  const avis = await avisSansReponse(await jetonGoogle());
  console.log(`${avis.length} avis sans réponse.`);
  const brouillons = await rediger(avis);
  fs.writeFileSync(FICHIER, JSON.stringify(brouillons, null, 2));
  console.log(`\nBrouillons écrits dans avis/brouillons.json. Relisez, corrigez si besoin, passez "valide" à true, puis lancez npm run avis -- --publier.`);
}
