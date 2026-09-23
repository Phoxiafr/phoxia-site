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

## Livrée

Couleurs de la charte Phoxia : encre `#14213D`, azur `#1C6BA8`, azur clair `#5BA3DD`, sable `#EDEAE1`, filet or `#C9B98F`. Symbole Phoxia sur le ponton, numéro 26.

## Régénérer

```
NODE_PATH_PW=$(npm root -g)/playwright node source/generer-livree.js visuels
```
