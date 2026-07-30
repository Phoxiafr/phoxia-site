# Phoxia — nouveau site

Refonte complète du site `phoxia.fr` répondant aux retours d'Alix, Maxime et Jade.
Site statique, sans dépendance ni build. Compatible GitHub Pages tel quel.

---

## 0. Prévisualiser

Double-cliquez sur `index.html`. Les chemins sont relatifs, tout s'affiche sans
serveur local. Seule exception : `404.html` utilise des chemins absolus, parce que
GitHub Pages peut la servir depuis n'importe quelle URL — elle n'est correcte
qu'une fois le site en ligne.

---

## 1. État de préparation

**Le site est complet.** Aucun placeholder, aucun champ à remplir.

| Élément | État |
|---|---|
| Formulaire de contact | Branché sur Formspree, endpoint `xpqggbqg` |
| Prise de rendez-vous | Calendly, créneaux de 30 minutes |
| Mentions légales | SIREN, SIRET, forme juridique, siège, TVA, dates |
| Politique de confidentialité | Complète, conforme RGPD |
| Réseaux sociaux | LinkedIn entreprise, Instagram, TikTok, email |
| Logos | 15 fichiers détourés, dont Deloitte |
| Portraits | Mathieu, Pragun, Valentin, Jules, Côme |

**Un test à faire dès la mise en ligne :** envoyez-vous un message via le formulaire.
Formspree exige une validation de l'adresse de réception au premier envoi ; sans
elle, les demandes suivantes n'arrivent pas. Vérifiez aussi vos indésirables.

**Deux points à traiter à votre rythme :**

1. La domiciliation marseillaise, pour remplacer l'adresse du siège dans
   `mentions-legales.html`. Les données structurées annoncent déjà Marseille et la
   ligne « Lieu d'exercice » documente l'écart en attendant.
2. La page entreprise `linkedin.com/company/phoxia`. Si elle n'est pas publiée,
   l'icône LinkedIn du pied de page mène à une erreur 404.

---

## 2. Mise en ligne sur GitHub Pages

1. Ouvrez `github.com/phoxiafr/phoxiafr.github.io`
2. Supprimez les anciens fichiers du repo (gardez `.git`)
3. Glissez-déposez **tout le contenu** du dossier `SITE/` (pas le dossier lui-même)
4. Vérifiez que `CNAME` et `.nojekyll` sont bien présents à la racine
5. Commit. Le déploiement prend une à deux minutes.

> `.nojekyll` empêche GitHub de faire tourner Jekyll, qui ignorerait les dossiers
> commençant par un underscore et ralentit inutilement le déploiement.
>
> `CNAME` contient `phoxia.fr` : ne le supprimez jamais, sinon le domaine se détache.

---

## 3. Référencement — les 4 actions à faire après la mise en ligne

1. **Google Search Console** — `search.google.com/search-console`
   Ajoutez la propriété `phoxia.fr`, validez par enregistrement DNS chez OVH
   (méthode « Domaine », TXT à la racine).
2. **Soumettez le sitemap** — dans Search Console, menu *Sitemaps*, saisissez
   `sitemap.xml`. Puis *Inspection d'URL* sur `https://phoxia.fr/` → « Demander une indexation ».
3. **Google Business Profile** — `business.google.com`. C'est le levier n°1 sur des
   requêtes du type « consultant développement commercial Marseille ». Adresse,
   horaires, zone d'intervention, photos, et surtout des avis clients.
4. **Bing Webmaster Tools** — import direct depuis Search Console, deux clics.

Mettez à jour les dates `<lastmod>` dans `sitemap.xml` à chaque modification de contenu.

---

## 4. Ce que le site contient déjà côté SEO

- Titres uniques et descriptions rédigées sur chaque page
- URL canoniques
- Open Graph et Twitter Card avec image dédiée 1200 × 630
- Données structurées JSON-LD : `ProfessionalService`, `WebSite`, `ContactPage`,
  `BreadcrumbList`, catalogue d'offres, `Person` fondateur avec `alumniOf`
- `sitemap.xml` et `robots.txt`
- Un seul `<h1>` par page, hiérarchie Hn continue
- `lang="fr"`, attributs `alt`, liens `rel="noopener"`
- Page 404 personnalisée
- `theme-color` et manifeste web

---

## 5. Structure des fichiers

```
index.html                          Accueil : hero, repères, sommaire des 5 pages
domaines.html                       Les trois domaines d'expertise
approche.html                       Origine du nom, ancrage, engagements
methode.html                        Déroulé d'une mission en 4 étapes
experiences.html                    Rangées d'expériences + bandeau défilant
parcours.html                       Formation, distinctions, équipe
contact.html                        Formulaire détaillé + prise de rendez-vous
mentions-legales.html               Obligations LCEN
politique-de-confidentialite.html   RGPD
404.html                            Page d'erreur
sitemap.xml  robots.txt  CNAME  .nojekyll  site.webmanifest
assets/
  css/style.css                     Feuille unique, commentée
  js/main.js                        Menu, défilement, formulaire. Sans dépendance
  img/logos/                        14 logos détourés
  img/equipe/                       5 portraits
_generer-pages.py                   Gabarit commun (en-tête, pied, métas)
_contenus.py                        Contenu de chaque page
_construire.py                      Assemble les 7 pages : python3 _construire.py
```

> **Les trois fichiers `_*.py` ne servent qu'à la fabrication.** L'en-tête, le menu
> et le pied de page sont générés depuis une source unique : si vous modifiez la
> navigation à la main dans les 7 fichiers HTML, vous créerez des divergences.
> Modifiez plutôt `_generer-pages.py` puis relancez `python3 _construire.py`.
> Ces trois fichiers peuvent rester dans le repo, ils ne sont pas servis.

---

## 6. Notes techniques

- **Aucun cookie déposé.** Pas de bandeau de consentement nécessaire tant que vous
  n'ajoutez pas d'outil de statistiques. Si vous en voulez un, préférez Plausible ou
  Matomo Cloud (sans cookie, exemptés de consentement) à Google Analytics.
- **Polices** chargées depuis Google Fonts. Pour supprimer cette dépendance externe,
  téléchargez EB Garamond et Instrument Sans en `.woff2`, placez-les dans
  `assets/fonts/` et remplacez le `<link>` par des règles `@font-face`.
- **Formulaire** : protection anti-robot par champ piège (`_gotcha`), envoi en AJAX
  sans rechargement, repli automatique sur `mailto:` si l'endpoint n'est pas configuré.
- **Accessibilité** : lien d'évitement, `aria-expanded` sur le menu, `aria-current`
  sur la navigation, focus visible, respect de `prefers-reduced-motion`.
