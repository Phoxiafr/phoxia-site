import { HORAIRES, FUSEAU } from "../config.js";

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const enMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const lisible = (hhmm) => { const [h, m] = hhmm.split(":"); return `${Number(h)}h${m === "00" ? "" : m}`; };

// Jour de la semaine et minutes écoulées depuis minuit, à l'heure de Marseille
export function heureLocale(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSEAU, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const jour = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { jour, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

// Une plage "12:30 → 04:00" déborde sur le lendemain matin
function plageCouvre(plage, minutes, veille) {
  if (!plage) return false;
  const debut = enMinutes(plage.ouverture), fin = enMinutes(plage.fermeture);
  const deborde = fin <= debut;
  if (veille) return deborde && minutes < fin;
  return minutes >= debut && (deborde || minutes < fin);
}

export function estOuvert(date = new Date()) {
  const { jour, minutes } = heureLocale(date);
  return plageCouvre(HORAIRES[jour], minutes, false) || plageCouvre(HORAIRES[(jour + 6) % 7], minutes, true);
}

// Phrase courte sur l'état actuel, par ex. "Oui, on est ouverts jusqu'à 4h."
export function etatActuel(date = new Date()) {
  const { jour, minutes } = heureLocale(date);
  if (estOuvert(date)) {
    const plage = plageCouvre(HORAIRES[jour], minutes, false) ? HORAIRES[jour] : HORAIRES[(jour + 6) % 7];
    return `Oui, on est ouverts jusqu'à ${lisible(plage.fermeture)}.`;
  }
  for (let i = 0; i < 7; i++) {
    const j = (jour + i) % 7, plage = HORAIRES[j];
    if (!plage || (i === 0 && enMinutes(plage.ouverture) <= minutes)) continue;
    const quand = i === 0 ? "aujourd'hui" : i === 1 ? "demain" : JOURS[j];
    return `On est fermés pour le moment, réouverture ${quand} à ${lisible(plage.ouverture)}.`;
  }
  return "On est fermés pour le moment.";
}

export function texteHoraires() {
  const plages = Object.values(HORAIRES);
  const identiques = plages.every((p) => JSON.stringify(p) === JSON.stringify(plages[0]));
  if (identiques && plages[0]) return `tous les jours de ${lisible(plages[0].ouverture)} à ${lisible(plages[0].fermeture)}`;
  return [1, 2, 3, 4, 5, 6, 0].map((j) => {
    const p = HORAIRES[j];
    return `${JOURS[j]} : ${p ? `${lisible(p.ouverture)} à ${lisible(p.fermeture)}` : "fermé"}`;
  }).join(", ");
}
