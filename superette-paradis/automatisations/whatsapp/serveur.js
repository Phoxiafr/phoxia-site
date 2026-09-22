// Webhook WhatsApp Cloud API : reçoit les messages clients et répond automatiquement.
//   npm run whatsapp                 lance le serveur (port 3000 par défaut)
//   npm run whatsapp -- --essai      discussion de test dans le terminal, sans compte WhatsApp
import http from "node:http";
import crypto from "node:crypto";
import readline from "node:readline";
import { repondre } from "./assistant.js";

const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, META_APP_SECRET, PORT = 3000 } = process.env;

async function envoyer(destinataire, texte) {
  const reponse = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: destinataire, type: "text", text: { body: texte } }),
  });
  if (!reponse.ok) console.error("Envoi WhatsApp échoué :", reponse.status, await reponse.text());
}

// Vérifie que la requête vient bien de Meta (en-tête X-Hub-Signature-256)
function signatureValide(corps, signature) {
  if (!signature) return false;
  const attendue = "sha256=" + crypto.createHmac("sha256", META_APP_SECRET).update(corps).digest("hex");
  return signature.length === attendue.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(attendue));
}

async function traiter(corps) {
  for (const entree of corps.entry ?? []) {
    for (const changement of entree.changes ?? []) {
      for (const message of changement.value?.messages ?? []) {
        const texte = message.type === "text" ? message.text.body : "";
        await envoyer(message.from, repondre(texte));
      }
    }
  }
}

if (process.argv.includes("--essai")) {
  const rl = readline.createInterface({ input: process.stdin });
  console.log("Écrivez comme un client (Ctrl+C pour quitter).\n");
  for await (const ligne of rl) console.log(`Client > ${ligne}\n${repondre(ligne)}\n`);
} else {
  const manquants = ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN", "META_APP_SECRET"].filter((k) => !process.env[k]);
  if (manquants.length) {
    console.error(`Variables manquantes dans .env : ${manquants.join(", ")}`);
    process.exit(1);
  }
  http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/webhook") return res.writeHead(404).end();

    // Vérification demandée par Meta lors de la configuration du webhook
    if (req.method === "GET") {
      const ok = url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === WHATSAPP_VERIFY_TOKEN;
      return ok ? res.writeHead(200).end(url.searchParams.get("hub.challenge")) : res.writeHead(403).end();
    }

    if (req.method === "POST") {
      const morceaux = [];
      for await (const m of req) morceaux.push(m);
      const brut = Buffer.concat(morceaux);
      if (!signatureValide(brut, req.headers["x-hub-signature-256"])) return res.writeHead(401).end();
      res.writeHead(200).end(); // Meta attend un accusé de réception rapide
      try { await traiter(JSON.parse(brut)); } catch (e) { console.error(e); }
      return;
    }
    res.writeHead(405).end();
  }).listen(PORT, () => console.log(`Assistant WhatsApp à l'écoute sur le port ${PORT} (/webhook)`));
}
