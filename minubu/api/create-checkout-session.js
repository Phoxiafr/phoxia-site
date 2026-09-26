/* =============================================================
   Minubu : création d'une session de paiement Stripe Checkout
   Fonction serverless (Vercel : /api/create-checkout-session,
   Netlify : adapter l'export, voir LISEZ-MOI.md).

   Variables d'environnement :
     STRIPE_SECRET_KEY   clé secrète Stripe (sk_live_… ou sk_test_…)
     ORIGINE_AUTORISEE   URL du site, ex. https://minubucoffee.fr

   Sécurité : les prix envoyés par le navigateur sont ignorés.
   Chaque ligne est recalculée ici à partir de menu-data.js.
   ============================================================= */
'use strict';

const Stripe = require('stripe');
const MENU = require('../assets/js/menu-data.js');
const CONFIG = require('../assets/js/config.js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function libelle(produit, choix) {
  return (produit.options || []).map(function (o) {
    const v = choix && choix[o.id];
    const ids = Array.isArray(v) ? v : v ? [v] : [];
    return ids.map(function (id) {
      const c = o.choix.find(function (x) { return x.id === id; });
      return c ? c.label.fr : '';
    }).join(', ');
  }).filter(Boolean).join(' · ');
}

module.exports = async function handler(req, res) {
  const origine = process.env.ORIGINE_AUTORISEE || '';
  res.setHeader('Access-Control-Allow-Origin', origine);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'Méthode non autorisée' });

  try {
    const corps = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const commande = corps.commande || {};
    const lignes = Array.isArray(corps.lignes) ? corps.lignes.slice(0, 50) : [];
    if (!lignes.length) return res.status(400).json({ erreur: 'Panier vide' });

    let sousTotal = 0;
    const lineItems = lignes.map(function (l) {
      const produit = MENU.parId[l.id];
      if (!produit) throw new Error('Produit inconnu : ' + l.id);
      const qte = Math.max(1, Math.min(20, parseInt(l.qte, 10) || 1));
      const unitaire = MENU.prixLigne(produit, l.choix || {}, l.montant, CONFIG);
      sousTotal += unitaire * qte;
      const description = [libelle(produit, l.choix), l.perso && l.perso.prenom ? '« ' + String(l.perso.prenom).slice(0, 14) + ' »' : '', l.note ? String(l.note).slice(0, 120) : '']
        .filter(Boolean).join(' · ');
      return {
        quantity: qte,
        price_data: {
          currency: 'eur',
          unit_amount: unitaire,
          product_data: Object.assign({ name: produit.nom.fr }, description ? { description: description } : {})
        }
      };
    });

    const pourcent = CONFIG.pourboires.indexOf(Number(commande.pourboirePourcent)) > -1 ? Number(commande.pourboirePourcent) : 0;
    const pourboire = Math.round(sousTotal * pourcent / 100);
    if (pourboire > 0) {
      lineItems.push({ quantity: 1, price_data: { currency: 'eur', unit_amount: pourboire, product_data: { name: 'Pourboire pour l’équipe (' + pourcent + ' %)' } } });
    }

    const creneau = commande.creneau ? commande.creneau.date + ' ' + Math.floor(commande.creneau.minutes / 60) + 'h' + String(commande.creneau.minutes % 60).padStart(2, '0') + (commande.creneau.asap ? ' (dès que possible)' : '') : '';
    const retour = String(corps.retour || '').startsWith(origine) ? corps.retour : origine + '/suivi.html';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: commande.client && commande.client.email,
      locale: commande.langue === 'en' ? 'en' : 'fr',
      success_url: retour + '?id=' + encodeURIComponent(commande.id) + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: retour.replace('suivi.html', 'commande.html'),
      metadata: {
        code: String(commande.code || '').slice(0, 20),
        mode: String(commande.mode || '').slice(0, 20),
        table: String(commande.table || '').slice(0, 5),
        creneau: creneau,
        prenom: String((commande.client && commande.client.prenom) || '').slice(0, 60),
        telephone: String((commande.client && commande.client.tel) || '').slice(0, 30),
        sms: commande.client && commande.client.sms ? 'oui' : 'non',
        note: String(commande.note || '').slice(0, 480)
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(400).json({ erreur: err.message });
  }
};
