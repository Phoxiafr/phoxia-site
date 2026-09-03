# Phoxy Music — site du label

Site statique, sans dépendance ni build, sur le même modèle que le site Phoxia
(consulting) situé à la racine de ce dépôt. Ce dossier `/phoxy/` est
indépendant : il ne modifie aucun fichier du site Phoxia existant, mais une
page de présentation (`/phoxy-music.html`, à la racine) y renvoie et fait
partie du même dépôt.

**Direction artistique** : nuit encre (`#060c14`) + néon cyan (`#5be8ff`),
logotype manuscrit (police Caveat), photo de couverture fournie par vous.

**Identité réelle** : Mathieu Barthélémy, également fondateur de Phoxia, sous
la même entreprise individuelle (SIREN 937 810 067 / SIRET 937 810 067 00010).
Réseaux confirmés : Instagram et TikTok `@phoxy.music`.

---

## 1. Ce qui est réel, ce qui reste à faire

Le site n'a plus de fausses personnes ni de faux catalogue : le fondateur, le
SIRET, l'email (`mathieu@phoxia.fr`) et les réseaux sociaux affichés sont
réels. Le catalogue est honnêtement présenté comme vide (le label démarre),
et la page équipe ne montre que vous — pas de collaborateurs inventés.

### Ce qui reste à faire avant une mise en ligne à part entière

| Élément | Où | État actuel |
|---|---|---|
| Nom de domaine | `<link rel="canonical">`, Open Graph, `sitemap.xml`, `robots.txt` | `phoxy-music.example` (domaine réservé, ne résout jamais) — à remplacer si le site est un jour déployé ailleurs qu'en `/phoxy/` sous `phoxia.fr` |
| Activité déclarée | Guichet unique (hors site) | Le SIRET existe (celui de Phoxia) mais l'activité déclarée est encore « conseil ». Une déclaration de modification d'activité (code APE/NAF musique) est probablement nécessaire avant facturation — voir `mentions-legales.html` |
| Formulaire de contact | `contact.html`, attribut `action` | `https://formspree.io/f/REMPLACER_ID` — en attendant, le bouton « Envoyer » ouvre directement `mathieu@phoxia.fr` en `mailto:`, donc le formulaire fonctionne déjà en pratique |
| Prise de rendez-vous | `index.html`, `contact.html` | Réutilise le Calendly réel de Phoxia (`calendly.com/mathieu-phoxia/30min`) — créez un Calendly dédié si vous voulez séparer les agendas |
| Catalogue | `catalogue.html` | Vide, honnêtement affiché « à venir ». À remplir dès la première sortie réelle |
| Studios partenaires | `equipe.html` | Retiré (aucun partenaire réel à annoncer pour l'instant) |
| Spotify / YouTube | — | Retirés partout : seuls Instagram et TikTok `@phoxy.music` sont confirmés. Ajoutez les autres liens dès que les comptes existent |

---

## 2. Prévisualiser en local

Depuis ce dossier :

```
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000/`. Les chemins sont relatifs à `/phoxy/`.

---

## 3. Mise en ligne

Ce dossier est pensé pour être servi sous `phoxia.fr/phoxy/`, avec la page de
présentation `/phoxy-music.html` à la racine qui y renvoie. `robots.txt` et
`sitemap.xml` de `/phoxy/` sont redondants avec ceux de la racine si les deux
sont publiés ensemble — vous pouvez les supprimer ou les laisser, ils ne
gênent pas.

---

## 4. Structure des fichiers

```
index.html                          Accueil : hero, repères, sommaire des 5 pages
activites.html                      Les trois activités : production, développement d'artiste, distribution
approche.html                       Origine du nom, quatre engagements
methode.html                        Déroulé en 4 étapes : écoute, diagnostic, production, sortie
catalogue.html                      Catalogue (vide, honnête) + bandeau plateformes prévues
equipe.html                         Fondateur (Mathieu Barthélémy)
contact.html                        Formulaire + prise de rendez-vous
mentions-legales.html               Réel : même SIRET que Phoxia, renvoie vers les mentions légales complètes
politique-de-confidentialite.html   RGPD, responsable de traitement réel
404.html                            Page d'erreur
sitemap.xml  robots.txt  site.webmanifest
assets/
  css/style.css                     Feuille unique
  js/main.js                        Menu, apparitions au scroll, formulaire
  img/hero-phoxy.png                Photo de couverture fournie
  img/phoxy-symbole.svg             Mark du logo (icône d'en-tête)
  img/favicon.svg                   Favicon
```

---

## 5. Notes techniques

- **Formulaire** : tant que l'ID Formspree n'est pas configuré, le bouton
  « Envoyer » ouvre directement la messagerie du visiteur avec le message
  pré-rempli vers `mathieu@phoxia.fr` (repli `mailto:`). Dès que vous
  renseignez un vrai endpoint Formspree, l'envoi se fait en AJAX sans
  rechargement de page.
- **Polices** chargées depuis Google Fonts (Caveat, Space Grotesk, Inter).
- **Accessibilité** : lien d'évitement, `aria-expanded` sur le menu,
  `aria-current` sur la navigation, focus visible, respect de
  `prefers-reduced-motion`.
- **Apparitions au scroll** : les blocs marqués `data-apparait` restent
  invisibles jusqu'à ce qu'ils entrent dans le viewport (IntersectionObserver).
  C'est voulu — si JavaScript est désactivé, tout s'affiche immédiatement.
