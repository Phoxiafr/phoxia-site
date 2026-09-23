# Phoxia Aston Martin F1 Team : concept de livrée

Création conceptuelle, non liée depuis le site et sans partenariat officiel avec les marques citées.

## Visuels (`visuels/`)

| Fichier | Format | Contenu |
|---|---|---|
| `01-rooftop.png` | 4:5, 2160×2700 | Monoplace de profil sur une terrasse vitrée en hauteur |
| `02-avant.png` | 4:5 | Détail avant : Decathlon, Claude |
| `03-ponton.png` | 4:5 | Détail ponton : Phoxia, Apple, Ducati, Yamaha, Aston Martin |
| `04-arriere.png` | 4:5 | Détail arrière : Monster Energy, nom de l'équipe |
| `05-equipe.png` | 4:5 | Carte titre et liste des partenaires |
| `06-bandeau-16x9.png` | 16:9, 3840×2160 | Bandeau paysage |

Les slides 01 à 05 forment un carrousel Instagram prêt à publier.

## Vidéo (`video/phoxia-aston-martin-f1.mp4`)

24 secondes, 1920×1080, 30 i/s, H.264 + AAC stéréo. Intro titre, arrivée de la monoplace
avec freinage et flou de bougé, trois plans détail avec les partenaires, départ, carte de fin.
Bande son entièrement synthétisée (moteur, pulsation, impacts), donc libre de droits.

## Présentation 3D (`video/phoxia-aston-martin-px27.mp4`)

52 secondes, 1920×1080, 24 i/s, format cinéma (bandes noires 2,39:1), son stéréo.
Monoplace modélisée en 3D (three.js), studio sombre avec plateau réfléchissant et barres LED,
découpage façon lancement officiel : silhouette, gros plans balayés par la lumière, titre,
allumage des LED, révélation, orbite, vue du dessus, travelling, trois-quarts avant et arrière,
carte des partenaires. Bande son synthétisée (moteur, impacts, pulsation), libre de droits.
Sources dans `presentation-3d/` ; rendu : `npm i` puis `node render.js sortie.mp4 son.wav`
(variables `NODE_PATH_PW`, `FFMPEG`, `START`/`END` pour découper le rendu en segments).

## Livrée

Couleurs de la charte Phoxia : encre `#14213D`, azur `#1C6BA8`, azur clair `#5BA3DD`, sable `#EDEAE1`, filet or `#C9B98F`. Symbole Phoxia sur le ponton, numéro 26.

## Régénérer

```
NODE_PATH_PW=$(npm root -g)/playwright node source/generer-livree.js visuels
python3 source/bande-son.py bande-son.wav            # nécessite numpy
FFMPEG=<chemin ffmpeg> NODE_PATH_PW=$(npm root -g)/playwright \
  node source/generer-video.js video/phoxia-aston-martin-f1.mp4 bande-son.wav
```
