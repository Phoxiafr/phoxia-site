# Phoxia : le site phoxia.fr

Site statique en HTML, CSS et JavaScript, sans dépendance ni étape de construction.
Hébergé sur GitHub Pages depuis ce dépôt (`Phoxiafr/phoxia-site`, branche `main`).
Le fichier `CNAME` relie le dépôt au domaine `phoxia.fr` : ne jamais le supprimer.

Mis à jour le 5 novembre 2026. Univers technologique : fondu noir, lueurs bleues du logo, panneaux translucides,
logo en EB Garamond italique, titres et texte en Instrument Sans,
repères en IBM Plex Mono. Aucune ville n'est citée hors mentions légales.

---

## 1. Publier une modification

1. Travaillez sur une branche, puis ouvrez une pull request vers `main`.
2. Une fois la PR fusionnée, GitHub Pages republie le site en une à deux minutes.
3. Si vous avez changé le contenu d'une page, mettez à jour sa date `<lastmod>`
   dans `sitemap.xml` (ou `phoxy/sitemap.xml` pour le sous-site Phoxy).

Pour prévisualiser en local : double-cliquez sur `index.html`. Les chemins sont
relatifs, tout s'affiche sans serveur. Seule `404.html` utilise des chemins absolus
et ne s'affiche correctement qu'en ligne.

---

## 2. Modifier le menu ou le pied de page

Chaque page contient sa propre copie de la tête, de l'en-tête et du pied de page,
entre des marqueurs `<!-- debut:... -->` et `<!-- fin:... -->`. **Ne modifiez pas ces
blocs à la main.** Utilisez le gabarit :

1. Ouvrez `outils/gabarit.py` et modifiez `MENU`, `PIED_NAVIGATION`,
   `PIED_INFORMATIONS` ou `APERCUS_MENU` (les mini pages qui s'affichent au survol
   des liens du menu).
2. Lancez depuis la racine du dépôt : `python3 outils/gabarit.py`

Pour créer une nouvelle page, copiez `contact.html` ou `formations.html`, changez
le titre, la description et le contenu de `<main>`, puis relancez le gabarit.

---

## 2 bis. Les trois langues

Le site existe en français (racine), en anglais (`/en/`) et en espagnol (`/es/`)
pour l'accueil, les formations et le contact. Le blog et les pages légales restent
en français ; les versions étrangères y renvoient avec la mention « (FR) ».

**Ne modifiez jamais les fichiers de `en/` et `es/` à la main** : ils sont générés.
Après toute modification d'un texte français sur ces trois pages :

1. ajoutez ou corrigez la traduction dans `outils/traductions/textes.py`
   (une ligne par texte : français, anglais, espagnol) ;
2. lancez `python3 outils/traduire.py`.

Le script régénère les pages traduites, applique le gabarit, et liste les textes
qui n'ont pas encore de traduction. Le sélecteur FR · EN · ES (en-tête, accueil,
pied de page) est produit par `outils/gabarit.py`.

## 3. Structure

```
index.html                          Accueil : radar, services, protocole (méthode),
                                    missions, formations, équipe
formations.html                     Catalogue des 10 formations IA
contact.html                        Formulaire (Formspree) et prise de rendez-vous
mentions-legales.html               Obligations légales (LCEN)
politique-de-confidentialite.html   RGPD
404.html                            Page d'erreur
actualites/                         Blog : index + un fichier par article

Anciennes adresses, redirigées vers la nouvelle page correspondante :
domaines.html approche.html methode.html experiences.html parcours.html
agenda.html essca.html

Pages personnelles, hors menu, en attente du site Phoxy dédié :
hobbies.html  phoxy.html  agents.html  statut-phoxy-music.html  phoxy/
(elles gardent l'ancienne feuille de style assets/css/style.css)

assets/css/site.css                 Feuille de style du site (thème sombre)
assets/js/vitrine.js                Accueil : chargement, logo 3D (Three.js), texte géant,
                                    mur de projets animés
assets/js/site.js                   Interactions : défilement fluide, curseur,
                                    aperçus au survol, animations, carrousel,
                                    fenêtres de détail, formulaire
assets/img/                         Logos, portraits, visuels
outils/gabarit.py                   Gabarit commun (voir section 2)
sitemap.xml  robots.txt  CNAME  .nojekyll  site.webmanifest
```

### Les interactions

- **Fiches au survol** : tout élément portant `data-apercu="cle"` fait sortir, au survol,
  une fiche qui suit le curseur, avec le contenu du `<template id="apercu-cle">`.
- **Panneau de détail** : `data-ouvrir="detail-cle"` ouvre le panneau latéral avec le
  contenu du `<template id="detail-cle">`.
- **Curseur viseur** : ses coins encadrent automatiquement les liens et boutons.
  `data-curseur="Voir"` affiche une étiquette « Voir » à côté du curseur.
- **Boutons aimantés** : `data-aimant`.
- **Apparition au défilement** : `data-reveler` (avec `style="--delai:.2s"` en option),
  titres animés mot par mot : `data-titre-anime`.
- **Réseau de points lumineux** qui réagit au curseur : `<canvas class="carte-marine" data-carte>`.
- **Radar** de l'accueil : son faisceau suit le curseur (`data-boussole`).
- **Transitions** : un rideau aux trois couleurs du logo passe entre deux pages.
- **Logo 3D de l'accueil** : les trois barres du symbole, reconstruites en 3D avec
  Three.js (cdnjs), suivent la souris et s'écartent quand on s'en approche. Sans
  WebGL, une image du logo s'affiche à la place.
- **Mur de projets** : deux rangées de cartes animées qui défilent en sens inverse,
  ralentissent au survol et accélèrent avec le défilement. Chaque carte ouvre un
  panneau `detail-pXX`. Pour ajouter un projet, dupliquez une carte `.projet` et son
  `<template>`.
- **Écran de chargement** : affiché une seule fois par visite.
- Sur mobile et pour les visiteurs qui ont réduit les animations dans leur système,
  le curseur, les fiches, le défilement horizontal du protocole et les effets de mouvement sont
  désactivés automatiquement.

### Modifier une formation

Chaque formation apparaît à trois endroits de `formations.html` : la ligne du
catalogue (`data-ouvrir="detail-f01"`), sa fiche (`<template id="apercu-form-f01">`)
et son programme complet (`<template id="detail-f01">`). Les quatre formations mises en
avant sur l'accueil ont aussi leur ligne et leur aperçu dans `index.html`.
Un lien direct vers une formation ouvre son programme : `formations.html#f04`.

---

## 4. Ajouter des photos

Les photos doivent rester légères pour que le site soit rapide sur mobile :

- **Taille** : 1200 px maximum sur le plus grand côté pour une vignette de galerie,
  1600 px pour une photo affichée en pleine largeur.
- **Format** : JPG qualité 78 à 80 pour les photos, PNG seulement si l'image a
  besoin de transparence (logos).
- **Poids visé** : moins de 250 Ko par photo.
- Retirez les métadonnées de localisation (GPS) avant publication.

---

## 5. Ajouter un article au blog

1. Dupliquez un article de `actualites/` et remplacez son titre, sa description,
   son URL canonique et le contenu de la `<div class="prose">`.
2. Ajoutez sa carte dans `actualites/index.html` (bloc `.articles`).
3. Ajoutez l'URL dans `sitemap.xml`, puis lancez `python3 outils/gabarit.py`.

Les trois articles actuels portent sur le conseil aux PME (avant le virage IA).
Un premier article sur un usage concret de l'IA renforcerait le nouveau positionnement.

---

## 6. Services branchés

| Service | Où | Détail |
|---|---|---|
| Formulaire de contact | `contact.html` | Formspree, endpoint `xpqggbqg` |
| Prise de rendez-vous | liens sur toutes les pages | Calendly, `mathieu-phoxia/30min` |
| Défilement fluide | toutes les pages | Lenis 1.1.13, chargé depuis jsDelivr (le site fonctionne sans) |
| Polices | toutes les pages | Google Fonts (EB Garamond pour le logo, Instrument Sans, IBM Plex Mono) |
| Réseaux | pied de page | LinkedIn `company/phoxia`, Instagram et TikTok `phoxia.fr` |

Aucun cookie n'est déposé : pas de bandeau de consentement nécessaire. Pour des
statistiques, préférez Plausible ou Matomo (sans cookie) à Google Analytics.

---

## 7. Référencement

Déjà en place : titres et descriptions uniques, URL canoniques, Open Graph,
données structurées JSON-LD, `sitemap.xml`, `robots.txt`, un seul `<h1>` par page.

À faire ou à vérifier, hors du dépôt :

1. **Google Search Console** : propriété `phoxia.fr` validée par DNS chez OVH,
   sitemaps `sitemap.xml` et `phoxy/sitemap.xml` soumis.
2. **Google Business Profile** : premier levier pour les recherches locales
   (« consultant développement commercial Marseille »). Les avis clients comptent.
3. **Bing Webmaster Tools** : import direct depuis Search Console.
4. **Domaine www** : vérifier que `www.phoxia.fr` redirige vers `phoxia.fr`
   (réglages Pages du dépôt et enregistrement CNAME `www` chez OVH).

---

## 8. Points en attente

- **Adresse du siège** dans `mentions-legales.html` : obligatoire (LCEN), c'est la
  seule ville qui reste sur le site.
- **Statut de Phoxy Music** : voir `phoxy/LISEZ-MOI.md` (activité déclarée,
  formulaire de contact du sous-site).
- **Site Phoxy dédié** : les pages personnelles (Hobbies, Phoxy, DJ Bond) sont
  sorties du menu et attendent leur propre site.
- **Tarifs des formations** : affichés « sur devis » pour l'instant.
