# Minubu : nouveau site (maquette fonctionnelle)

Refonte du site vitrine de Minubu (minubucoffee.fr), coffee shop brunch au
333 Corniche Kennedy, Marseille 7e. Site statique, sans dépendance ni build.
Contenu repris du site actuel et de la carte PDF de janvier 2026 (tous les prix).

Prévisualisation : `phoxia.fr/minubu/` une fois poussé, ou en local :
`python3 -m http.server` dans ce dossier puis `http://localhost:8000`.

## Pages

| Page | Contenu |
|---|---|
| `index.html` | Accueil : statut ouvert/fermé en direct, signatures, histoire d'Océane et Sami, latte bar, horaires, accès, FAQ |
| `carte.html` | Carte complète : recherche, filtres (végé, sans gluten, lait végétal, nouveautés, sans arachides), fiche produit personnalisable, allergènes. `?table=7` active la commande à table |
| `atelier.html` | Atelier latte : base, température, lait, sucre, prénom sur le gobelet, favoris |
| `cadeaux.html` | Cartes cadeaux : montant libre, 4 styles, message, date d'envoi, aperçu en direct |
| `fidelite.html` | Carte fidélité digitale : 1 tampon par boisson, la 10e offerte, codes récompense |
| `evenements.html` | Privatisation (anniversaire, baby shower, équipes, shooting) et contact |
| `commande.html` | Tunnel de commande : à emporter ou à table, créneaux (respectent les horaires de la cuisine), pourboire, code fidélité, paiement |
| `suivi.html` | Suivi en temps réel, notification quand c'est prêt, « recommander la même chose » |
| `cuisine.html` | Écran équipe : commandes en colonnes, retards, ruptures de stock, pause des commandes, chiffres du jour, export CSV |
| `mentions.html` | Mentions légales, CGV click & collect, confidentialité |

Le site est bilingue français / anglais (bouton EN), installable sur téléphone
(PWA) et la carte reste consultable hors connexion.

## Démo à montrer

1. Commander un plat et un latte sur `carte.html`, payer (paiement simulé).
2. Ouvrir `cuisine.html` dans un second onglet : la commande arrive.
3. Cliquer « Lancer » puis « Prête » : le suivi client se met à jour instantanément.
4. Désactiver un produit dans « Disponibilités » : il est grisé sur la carte.

## Modifier le contenu

- **Horaires, adresse, paiement, fidélité** : `assets/js/config.js`
- **Carte et prix** : `assets/js/menu-data.js` (prix en centimes)
- **Couleurs et typographies** : variables en tête de `assets/css/minubu.css`

## Points à valider avec Minubu

1. **Jours de cuisine** : la page d'accueil actuelle annonce le brunch du mercredi
   au dimanche, la carte PDF dit « fermée le lundi ». Le site suit la page
   d'accueil (`cuisine` dans `config.js`).
2. **Allergènes** : déduits des recettes, à faire valider par l'équipe.
3. **Fidélité et cartes cadeaux** : règles proposées (9 tampons, boisson offerte
   jusqu'à 6 €, validité 12 mois), à ajuster.
4. **Mentions légales** : SIRET, hébergeur, médiateur (surlignés dans `mentions.html`).
5. **Photos et illustrations officielles** : le site utilise des illustrations
   dessinées pour la démo. Les illustrations de la marque peuvent les remplacer.

## Passer en production

La démo stocke paniers, commandes et fidélité dans le navigateur. Pour de vrais
paiements :

1. **Paiement Stripe** : déployer ce dossier sur Vercel (ou Netlify). La fonction
   `api/create-checkout-session.js` crée la session Stripe Checkout et
   **recalcule tous les prix côté serveur** depuis `menu-data.js`.
   Variables d'environnement : `STRIPE_SECRET_KEY`, `ORIGINE_AUTORISEE`.
   Puis renseigner `endpointPaiement: '/api/create-checkout-session'` dans `config.js`.
   Le bandeau « démonstration » disparaît automatiquement.
2. **Réception des commandes en cuisine** : ajouter un webhook Stripe
   (`checkout.session.completed`) qui enregistre la commande dans une base
   (Supabase, Firebase…) lue par `cuisine.html`, ou l'envoie sur une imprimante
   de tickets. Tant que ce n'est pas fait, les commandes payées restent visibles
   dans le tableau de bord Stripe.
3. **Fidélité côté serveur** : les codes récompense sont vérifiés dans le navigateur ;
   ils sont donc masqués au paiement dès que Stripe est branché, jusqu'à ce que la
   fidélité soit stockée en base.
4. **Formulaires** : renseigner `endpointFormulaire` (Formspree) dans `config.js`.
5. **Référencement** : retirer `noindex, nofollow` des pages et mettre à jour
   `urlSite` le jour de la mise en ligne sur le domaine de Minubu.
6. **QR codes de table** : générer un QR par table vers `carte.html?table=N`.
