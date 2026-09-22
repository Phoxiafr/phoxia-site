# Automatisations de la Supérette Paradis

Trois automatisations, réglées depuis un seul fichier : `config.js` (adresse, téléphone,
horaires, lien Uber Eats). Nécessite Node.js 22 ou plus.

```
npm install
npm test
```

Tout fonctionne en simulation sans aucun compte. Pour passer en réel, copier `.env.exemple`
en `.env` et remplir les clés de l'automatisation voulue.

## 1. Un post par semaine sur Instagram et Facebook

`publications/` : 5 posts qui tournent en boucle, un par semaine, avec légende et hashtags.

```
npm run publier                 # aperçu du post de la semaine
npm run publier -- --envoyer    # publication réelle
```

- Coût : gratuit (API Graph de Meta).
- Prérequis : compte Instagram **professionnel** relié à une page Facebook, une app Meta
  avec un jeton longue durée, et le site en ligne (les images sont lues depuis `SITE_URL/visuels/`).
- Automatique chaque semaine : `exemples/publication-hebdo.yml` (GitHub Actions, gratuit).

## 2. Réponses aux avis Google

`avis/` : récupère les avis sans réponse et prépare une réponse pour chacun.
**Rien n'est publié sans relecture** : la supérette valide chaque réponse.

```
npm run avis -- --demo      # essai sur 3 avis fictifs, sans aucun compte
npm run avis                # écrit avis/brouillons.json
npm run avis -- --publier   # publie les réponses marquées "valide": true
```

- Sans clé Anthropic : réponses types, gratuites (merci pour les bonnes notes,
  excuses et numéro de téléphone pour les mauvaises).
- Avec `ANTHROPIC_API_KEY` : réponse personnalisée par Claude (Claude Opus 5) qui reprend
  un détail de l'avis. Quelques centimes par réponse. Si Claude refuse ou échoue, la réponse
  type prend le relais. Les modèles de secours côté serveur (`fallbacks: "default"`) sont activés.
- Prérequis : accès à l'API Google Business Profile (demande d'accès gratuite auprès de Google,
  quelques jours de délai) et un jeton OAuth du compte qui gère la fiche.

## 3. Assistant WhatsApp

`whatsapp/` : répond instantanément aux questions fréquentes, 24h/24.

- « Vous êtes ouverts ? » : répond selon l'heure réelle (« Oui, jusqu'à 4h » ou « réouverture à 12h30 »)
- adresse et itinéraire, livraison Uber Eats, téléphone, produits, prix
- sinon : menu d'aide et numéro de téléphone

```
npm run whatsapp -- --essai   # discuter avec l'assistant dans le terminal
npm run whatsapp              # serveur webhook pour WhatsApp
```

- Coût : réponses par mots-clés, aucun coût par message. Les conversations lancées par
  un client sont gratuites sur WhatsApp Cloud API.
- Prérequis : un numéro dédié sur WhatsApp Business Platform (Meta), et un hébergement
  public pour le serveur (Render, Railway ou Fly.io ont des offres gratuites).
- Sécurité : chaque message entrant est vérifié par signature (`META_APP_SECRET`).

## Avant la mise en service

1. Confirmer les horaires jour par jour dans `config.js` (un seul jour vérifié sur Google Maps).
2. Remplacer le lien Uber Eats par le lien direct de la boutique.
3. Faire valider les textes (légendes, réponses types, messages WhatsApp) par la supérette.
