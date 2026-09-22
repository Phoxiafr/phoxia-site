# Supérette Paradis : site et visuels promo

Supérette Paradis, 396 rue Paradis, 13008 Marseille. 09 83 09 75 27.
4,9/5 sur Google (152 avis, relevé le 22/09/2026). Livraison Uber Eats.

## Le site (`site/`)

Une page unique, pensée pour le mobile : appeler, itinéraire, Uber Eats en un clic,
horaires avec badge « Ouvert maintenant », plan Google Maps. Dossier autonome
(polices incluses), hébergeable gratuitement sur GitHub Pages, Netlify ou Cloudflare Pages.

À faire avant la mise en ligne :

1. Faire valider le site par la supérette.
2. Confirmer les horaires jour par jour (relevés sur Google Maps un seul jour : 12h30 à 4h).
3. Remplacer le lien Uber Eats par le lien direct de la boutique.
4. Retirer la ligne `<meta name="robots" content="noindex">`.
5. Ajouter l'adresse du site dans la fiche Google Maps de la supérette.

## Les automatisations (`automatisations/`)

Publication hebdo Instagram et Facebook, réponses aux avis Google, assistant WhatsApp.
Mode d'emploi détaillé dans `automatisations/LISEZ-MOI.md`.

## Les visuels

## Les fichiers prêts à poster (`export/`)

| Fichier | Format | Usage |
|---|---|---|
| `paradis-post-1.png` à `5` | 1080 × 1080 | Publication Instagram, Facebook |
| `paradis-story-1.png` à `5` | 1080 × 1920 | Story Instagram, Facebook, WhatsApp |
| `paradis-story-video.mp4` | 1080 × 1920, 10 s | Reel, TikTok, story |

Les 5 visuels :

1. Bienvenue : « Votre petit paradis du quotidien »
2. Boissons bien fraîches
3. « C'est juste à côté » : l'achat de dépannage
4. Ouvert jusqu'à 4h
5. 4,9/5 sur Google, livraison Uber Eats

## Modifier les textes

- Images : bloc `CONFIG` et objet `VISUELS` dans `visuels.html`
- Vidéo : textes directement dans `video.html`

Aperçu : ouvrez `visuels.html?v=1&f=post` (ou `v=2`, `f=story`...) dans un navigateur.

## Régénérer les fichiers

```
node render.js
```

Nécessite Playwright (Chromium) et ffmpeg. Les polices (Fraunces, DM Sans) sont libres
de droits et incluses dans `polices/`. Les illustrations viennent de Noto Color Emoji,
également sous licence libre.
