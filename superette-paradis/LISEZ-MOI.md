# Supérette Paradis : visuels promo

Des visuels gratuits et prêts à publier, sans filigrane.

## Les fichiers prêts à poster (`export/`)

| Fichier | Format | Usage |
|---|---|---|
| `paradis-post-1.png` à `4` | 1080 × 1080 | Publication Instagram, Facebook |
| `paradis-story-1.png` à `4` | 1080 × 1920 | Story Instagram, Facebook, WhatsApp |
| `paradis-story-video.mp4` | 1080 × 1920, 10 s | Reel, TikTok, story |

Les 4 visuels :

1. Bienvenue : « Votre petit paradis du quotidien »
2. Fruits et légumes frais
3. « C'est juste à côté » : l'achat de dépannage
4. Bon plan : **exemple de promo (-20 %) à remplacer par une vraie offre avant de publier**

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
