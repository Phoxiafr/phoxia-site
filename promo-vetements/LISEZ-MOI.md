# Phoxia × Mode : kit de promotion vêtements

Le message du kit : **avec une seule photo de vos vêtements, Phoxia crée toute une
campagne**, en photos et en vidéo, prête à publier sur Instagram, Snapchat et LinkedIn.

La démonstration s'appuie sur la même tenue (le smoking) placée dans plusieurs décors
générés par IA : studio, bar, salon, coupé argent.

## Contenu du dossier

| Fichier | Format | Où le publier |
|---|---|---|
| `instagram-carrousel/01` à `07` | PNG 1080 x 1350 (4:5) | Carrousel Instagram, dans l'ordre |
| `video-9x16-phoxia-mode.mp4` | MP4 1080 x 1920, 15 s, sans son | Reel Instagram, Story Instagram, Snapchat (Story et Spotlight) |
| `linkedin-carrousel-phoxia-mode.pdf` | PDF, 7 pages | Post LinkedIn, option « Ajouter un document » |
| `source/` | Scripts | Pour régénérer le kit (voir plus bas) |

La vidéo est livrée **sans musique** : ajoutez un son tendance directement dans
Instagram ou Snapchat, c'est ce qui donne le plus de portée et évite tout problème de
droits d'auteur.

---

## Instagram (carrousel ou Reel)

```
Une photo de vos vêtements. Toute une campagne. 🎬

Même tenue, même coupe, même tissu. Seul le décor change :
studio, bar feutré, salon au coin du feu, coupé argent.

Avec Phoxia, vos pièces deviennent :
✔️ des visuels mis en scène, sans shooting ni lieu à louer
✔️ des vidéos verticales pour les Reels, les Stories et Snapchat
✔️ des carrousels, des légendes et des fiches produits prêts à publier

Vous avez une marque de vêtements ? Envoyez-nous une photo, on vous montre le résultat sur vos propres pièces.

👉 Lien en bio : phoxia.fr

#mode #marquedevetements #pretaporter #IA #intelligenceartificielle #shootingphoto #contenudemarque #marketingdigital #reels #marseille #entrepreneur #phoxia
```

**Story Instagram** : publiez la vidéo, ajoutez le sticker **Lien** vers
`https://phoxia.fr/contact.html` avec le texte « Voir le résultat sur mes vêtements »,
puis un sticker **Sondage** : « Votre marque a besoin de visuels ? Oui / Carrément ».

## Snapchat

Texte court à poser sur la vidéo ou en légende Spotlight :

```
1 photo de tes vêtements 👕
= toute une campagne 🎬
Photos + vidéos par IA avec Phoxia
phoxia.fr
```

Dans la Story, ajoutez le lien (icône trombone) vers `https://phoxia.fr/contact.html`.
Hashtags Spotlight : `#mode #IA #tenue #outfit #phoxia`

## LinkedIn

À publier avec le PDF en document :

```
Une marque de vêtements a besoin de dizaines de visuels par collection. Un shooting, c'est un mannequin, un photographe, un lieu, une journée entière.

Nous avons voulu montrer une autre voie.

Au départ, une seule photo : un portrait en smoking.
À l'arrivée : la même tenue dans quatre décors différents, puis une vidéo verticale de 15 secondes prête pour les Reels et les Stories.

Même coupe, même tissu, même tenue. Seul le décor change.

Ce que Phoxia fait pour les marques de vêtements :
→ shooting IA de vos pièces, dans le décor de votre choix
→ photos transformées en vidéos pour Instagram, Snapchat et TikTok
→ carrousels, légendes et fiches produits pour votre boutique en ligne

Vous dirigez une marque de mode ou une boutique ? Je vous montre le résultat sur vos propres pièces en 30 minutes : phoxia.fr

#Mode #IA #MarketingDigital #Ecommerce #Retail #Entrepreneuriat
```

---

## Calendrier conseillé

| Jour | Réseau | Publication |
|---|---|---|
| Mardi 18 h | Instagram | Carrousel 7 diapositives |
| Mercredi 12 h 30 | LinkedIn | Post avec le PDF |
| Jeudi 19 h | Instagram | Reel avec la vidéo et un son tendance |
| Jeudi 19 h | Snapchat | Story et Spotlight avec la même vidéo |
| Samedi | Instagram | Story : vidéo, sticker Lien et sondage |

## Régénérer le kit

Depuis `promo-vetements/source/` :

```
pip install pillow imageio-ffmpeg
node build.mjs     # carrousel, PDF LinkedIn et calques texte de la vidéo (Playwright requis)
python3 video.py   # vidéo 9:16
```

Pour une autre tenue ou une autre marque (par exemple Phothes) : remplacez les chemins
des photos dans `build.mjs` et dans la liste `PLANS` de `video.py`, puis relancez.
