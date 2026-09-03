# Phoxy Music — site de démonstration

Site statique, sans dépendance ni build, sur le même modèle que le site Phoxia
(consulting) situé à la racine de ce dépôt. Ce dossier `/phoxy/` est
totalement indépendant : il ne modifie aucun fichier du site Phoxia existant.

**Direction artistique** : nuit encre (`#060c14`) + néon cyan (`#5be8ff`),
logotype manuscrit (police Caveat), photo de couverture fournie par vous.

---

## 1. Ce site est un brouillon complet, pas un site prêt à publier

Toutes les pages sont fonctionnelles et navigables, mais **le contenu est en
grande partie fictif ou placeholder**. Vous avez choisi de démarrer sur cette
base pour avoir un site entier à modifier plutôt que d'attendre. Voici tout ce
qui doit être vérifié ou remplacé avant une mise en ligne publique.

### À remplacer avant toute mise en ligne

| Élément | Où | Valeur actuelle (placeholder) |
|---|---|---|
| Nom de domaine | balises `<link rel="canonical">`, Open Graph, `sitemap.xml`, `robots.txt` | `phoxy-music.example` (domaine réservé, ne résout jamais) |
| Email de contact | partout | `contact@phoxy-music.example` |
| Formulaire de contact | `contact.html`, attribut `action` | `https://formspree.io/f/REMPLACER_ID` — créez un formulaire sur [formspree.io](https://formspree.io) et remplacez l'ID |
| Prise de rendez-vous | `index.html`, `contact.html` | `https://calendly.com/phoxy-music/30min` — à créer sur Calendly |
| Fondatrice / équipe | `equipe.html`, `index.html` | Noms, rôles et bios entièrement inventés (Camille Reynier, Théo Salembier, Nina Askari, Malo Ferreira) |
| Localisation | partout | « Paris » posé par défaut, à confirmer |
| Réseaux sociaux | pied de page, `contact.html` | Liens Instagram/TikTok/Spotify placeholder, comptes non vérifiés |
| Catalogue / artistes | `catalogue.html` | 5 sorties entièrement fictives (Noé Veldt, Sasha Kirin, Lunar Hymns, Iris & Loup, Kobalt Room) |
| Studios partenaires | `equipe.html` | 3 noms de studios inventés |
| Mentions légales | `mentions-legales.html` | Aucune forme juridique ni SIREN/SIRET réels : le label n'est pas immatriculé dans cette version |
| Politique de confidentialité | `politique-de-confidentialite.html` | Structure RGPD standard, à valider avec vos vrais prestataires |
| Image de couverture | `assets/img/hero-phoxy.png` | La photo que vous avez fournie, déjà intégrée |

Chaque page placeholder porte un bandeau **⚠** ou une mention *(placeholder)*
visible directement dans le texte pour qu'aucune fausse information ne passe
inaperçue.

---

## 2. Prévisualiser en local

Depuis ce dossier :

```
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000/`. Les chemins sont relatifs à `/phoxy/`.

---

## 3. Mettre en ligne

Ce dossier est autonome et peut être déployé tel quel comme site indépendant
(son propre dépôt ou sous-domaine), ou publié en sous-dossier d'un site
existant. Dans ce second cas :

- si le site parent a déjà un `robots.txt` / `sitemap.xml` à la racine,
  ceux de `/phoxy/` deviennent redondants — gardez celui du parent et
  supprimez ceux d'ici, ou fusionnez-les ;
- `404.html` utilise ici des chemins relatifs (adapté à un déploiement en
  sous-dossier) ; si vous déployez `/phoxy/` comme site racine à part entière,
  ça fonctionne aussi tel quel.

---

## 4. Structure des fichiers

```
index.html                          Accueil : hero, repères, sommaire des 5 pages
activites.html                      Les trois activités : production, développement d'artiste, distribution
approche.html                       Origine du nom, quatre engagements
methode.html                        Déroulé en 4 étapes : écoute, diagnostic, production, sortie
catalogue.html                      Sorties et artistes (placeholder) + bandeau plateformes
equipe.html                         Fondatrice, équipe, studios partenaires
contact.html                        Formulaire + prise de rendez-vous
mentions-legales.html               Placeholder LCEN — à compléter
politique-de-confidentialite.html   Placeholder RGPD — à valider
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
  pré-rempli (repli `mailto:`). Dès que vous renseignez un vrai endpoint
  Formspree, l'envoi se fait en AJAX sans rechargement de page.
- **Polices** chargées depuis Google Fonts (Caveat, Space Grotesk, Inter).
- **Accessibilité** : lien d'évitement, `aria-expanded` sur le menu,
  `aria-current` sur la navigation, focus visible, respect de
  `prefers-reduced-motion`.
- **Apparitions au scroll** : les blocs marqués `data-apparait` restent
  invisibles jusqu'à ce qu'ils entrent dans le viewport (IntersectionObserver).
  C'est voulu — si JavaScript est désactivé, tout s'affiche immédiatement.
