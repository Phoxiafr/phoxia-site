# Film de marque Phoxia

Deux formats, 56 secondes, avec bande son originale :

| Fichier | Format | Usage |
|---|---|---|
| `phoxia-film-16x9.mp4` | 1920 × 1080 | Site, LinkedIn, YouTube, présentations |
| `phoxia-film-9x16.mp4` | 1080 × 1920 | Instagram Reels, TikTok, stories |

## Déroulé

| Temps | Plan |
|---|---|
| 0 à 4,8 s | Phocée fonde Marseille en regardant au-delà de l’horizon |
| 4,8 à 9,6 s | Le constat : prospection, support, reporting. Et si l’IA s’en chargeait ? |
| 9,6 à 12 s | Apparition de la marque sur l’impact musical |
| 12 à 21,6 s | Les trois offres |
| 21,6 à 28,8 s | Le déroulé d’une mission en quatre étapes |
| 28,8 à 34,8 s | Les engagements : 30 min, 48 h, 3 langues |
| 34,8 à 39,6 s | Le fondateur |
| 39,6 à 48 s | Là où je suis déjà allé : seize pays, une photo par temps |
| 48 à 56,4 s | Signature, devise et appel à l’action |

## Modifier le film

Tout est dans `source/` : textes et animations dans `film.html`, musique dans
`bande_son.py` (synthétisée, libre de droits). Ouvrir `film.html` dans un navigateur
lit le film en boucle ; un clic lance la musique.

```
cd source
python3 bande_son.py                  # régénère bande-son.wav (numpy)
node rendre.mjs 1920x1080 30          # rend ../phoxia-film-16x9.mp4 (Playwright + ffmpeg)
node rendre.mjs 1080x1920 30          # rend ../phoxia-film-9x16.mp4
node rendre.mjs 1920x1080 apercu      # une image par plan dans apercus/
```
