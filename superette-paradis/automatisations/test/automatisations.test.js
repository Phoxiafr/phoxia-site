import { test } from "node:test";
import assert from "node:assert/strict";
import { estOuvert, etatActuel, texteHoraires } from "../lib/horaires.js";
import { repondre } from "../whatsapp/assistant.js";
import { CALENDRIER, postDeLaSemaine, semaineIso } from "../publications/calendrier.js";
import { reponseModele, note } from "../avis/redaction.js";

// Heures de Marseille (UTC+2 en septembre)
const a = (iso) => new Date(`${iso}+02:00`);

test("ouvert l'après-midi et la nuit, fermé le matin", () => {
  assert.equal(estOuvert(a("2026-09-22T12:29")), false);
  assert.equal(estOuvert(a("2026-09-22T12:30")), true);
  assert.equal(estOuvert(a("2026-09-22T23:59")), true);
  assert.equal(estOuvert(a("2026-09-23T03:59")), true);
  assert.equal(estOuvert(a("2026-09-23T04:00")), false);
  assert.equal(estOuvert(a("2026-09-23T09:00")), false);
});

test("phrase d'état selon l'heure", () => {
  assert.equal(etatActuel(a("2026-09-23T02:00")), "Oui, on est ouverts jusqu'à 4h.");
  assert.equal(etatActuel(a("2026-09-23T09:00")), "On est fermés pour le moment, réouverture aujourd'hui à 12h30.");
  assert.equal(texteHoraires(), "tous les jours de 12h30 à 4h");
});

test("WhatsApp : horaires, adresse, livraison, message inconnu", () => {
  assert.match(repondre("Vous êtes ouverts ce soir ?", a("2026-09-22T23:00")), /^Oui, on est ouverts jusqu'à 4h/);
  assert.match(repondre("vous etes OUVERT ?", a("2026-09-23T10:00")), /fermés pour le moment/);
  assert.match(repondre("C'est où exactement ?  adresse svp"), /396 rue Paradis/);
  assert.match(repondre("vous livrez ?"), /Uber Eats/);
  assert.match(repondre("Bonjour"), /^Bonjour et bienvenue/);
  assert.match(repondre("🙂"), /09 83 09 75 27/);
  assert.match(repondre(""), /Je peux vous renseigner/);
});

test("un post différent chaque semaine, en boucle sur tout le calendrier", () => {
  const vus = new Set();
  for (let s = 0; s < CALENDRIER.length; s++) vus.add(postDeLaSemaine(new Date(2026, 0, 5 + 7 * s)).visuel);
  assert.equal(vus.size, CALENDRIER.length);
  assert.equal(semaineIso(new Date(2026, 0, 1)), 1);
  assert.match(postDeLaSemaine().legende, /396 rue Paradis/);
});

test("réponses types aux avis selon la note", () => {
  assert.equal(note({ starRating: "FOUR" }), 4);
  assert.equal(note({}), 0);
  assert.match(reponseModele({ starRating: "FIVE", reviewer: { displayName: "Léa M." } }), /^Merci beaucoup Léa/);
  assert.match(reponseModele({ starRating: "TWO" }), /09 83 09 75 27/);
});
