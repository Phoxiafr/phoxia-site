# Phoxia × Mode : kit de promotion pour les marques de vêtements

Le message du kit : **Phoxia met toute l'IA au service de votre marque de vêtements**,
de la photo jusqu'à la vente à l'étranger.

Six sujets, dans cet ordre, dans le carrousel comme dans la vidéo :

1. **Photos** : une photo de vos pièces suffit, l'IA la met en scène dans tous les décors.
2. **Vidéo** : vos photos deviennent des vidéos verticales (Reels, Stories, Snapchat, TikTok).
3. **Développement international** : choix des marchés sur des données, agents IA qui
   repèrent boutiques, distributeurs et acheteurs, prospection en français, anglais et
   espagnol, équipe de vente internationale.
4. **Site web localisé** : boutique traduite et adaptée à chaque pays, guides des tailles
   EU, UK, US, prix en devise locale, référencement Google pays par pays.
5. **Assistant et application** : un assistant qui répond aux questions des clients
   (tailles, livraison, retours, stock) dans leur langue, sur le site, sur Instagram ou
   dans une application sur mesure.
6. **Toute l'IA** : contenus, international, site web, service client, automatisation
   (commandes, stocks, reporting) et stratégie avec formation des équipes, en s'appuyant
   sur les meilleurs modèles d'IA du marché, dont Claude.

## Contenu du dossier

| Fichier | Format | Où le publier |
|---|---|---|
| `instagram-carrousel/01` à `09` | PNG 1080 x 1350 (4:5) | Carrousel Instagram, dans l'ordre |
| `video-9x16-phoxia-mode.mp4` | MP4 1080 x 1920, 24 s, sans son | Reel Instagram, Story Instagram, Snapchat (Story et Spotlight), TikTok |
| `linkedin-carrousel-phoxia-mode.pdf` | PDF, 9 pages | Post LinkedIn, option « Ajouter un document » |
| `source/` | Scripts | Pour régénérer le kit (voir plus bas) |

La vidéo est livrée **sans musique** : ajoutez un son tendance directement dans
Instagram, Snapchat ou TikTok. C'est ce qui donne le plus de portée et cela évite tout
problème de droits d'auteur.

Les échanges affichés dans l'assistant et la fiche produit « Tuxedo jacket » sont des
exemples de démonstration.

---

## Instagram (carrousel ou Reel)

```
Votre marque de vêtements, propulsée par l'IA. 🚀

Phoxia vous accompagne de la photo jusqu'à la vente à l'étranger :

📸 Photos sans shooting : une photo de vos pièces, des décors à l'infini
🎬 Vidéos verticales pour les Reels, les Stories et Snapchat
🌍 Développement international : marchés, acheteurs, distributeurs
🌐 Site web traduit et référencé dans chaque pays
💬 Un assistant qui répond à vos clients jour et nuit, dans leur langue
⚙️ Automatisation des commandes, des stocks et du reporting

Un seul partenaire pour toute l'IA de votre marque.

30 minutes pour voir ce que l'IA peut faire pour vos collections, vos ventes et vos clients.
👉 Lien en bio : phoxia.fr

#mode #marquedevetements #pretaporter #IA #intelligenceartificielle #export #ecommerce #siteweb #chatbot #marketingdigital #marseille #phoxia
```

**Story Instagram** : publiez la vidéo, ajoutez le sticker **Lien** vers
`https://phoxia.fr/contact.html` avec le texte « Parler de ma marque », puis un sticker
**Sondage** : « Votre priorité ? Vendre à l'étranger / Plus de contenus ».

## Snapchat

Texte court à poser sur la vidéo ou en légende Spotlight :

```
Ta marque de vêtements + l'IA 👕🤖
📸 photos et vidéos sans shooting
🌍 ventes à l'étranger
🌐 site dans toutes les langues
💬 assistant client 24 h/24
phoxia.fr
```

Dans la Story, ajoutez le lien (icône trombone) vers `https://phoxia.fr/contact.html`.
Hashtags Spotlight : `#mode #IA #export #outfit #phoxia`

## LinkedIn

À publier avec le PDF en document :

```
Une marque de vêtements qui veut grandir se heurte toujours aux mêmes murs : produire assez de contenus, trouver des acheteurs à l'étranger, parler la langue de ses clients, répondre à toutes leurs questions.

L'IA permet aujourd'hui de lever ces quatre freins en même temps.

Chez Phoxia, voici ce que nous faisons pour les marques de mode :

→ Photos et vidéos : une photo de vos pièces suffit, l'IA la met en scène et l'anime pour les Reels et les Stories.
→ Développement international : choix des marchés sur des données, agents IA qui repèrent boutiques et distributeurs, prospection en français, anglais et espagnol.
→ Site web localisé : fiches produits traduites, guides des tailles EU, UK, US, prix en devise locale, référencement pays par pays.
→ Assistant client et application : tailles, livraison, retours, stock, des réponses jour et nuit, dans la langue du client.
→ Automatisation et stratégie : commandes, stocks, reporting, feuille de route et formation des équipes.

Le tout avec les meilleurs modèles d'IA du marché, dont Claude, et un périmètre défini avant de commencer, jamais en cours de route.

Vous dirigez une marque de mode ou une boutique ? 30 minutes suffisent pour savoir ce que l'IA peut changer chez vous : phoxia.fr

#Mode #IA #Export #Ecommerce #Retail #DéveloppementInternational #Entrepreneuriat
```

---

## Calendrier conseillé

| Jour | Réseau | Publication |
|---|---|---|
| Mardi 18 h | Instagram | Carrousel 9 diapositives |
| Mercredi 12 h 30 | LinkedIn | Post avec le PDF |
| Jeudi 19 h | Instagram | Reel avec la vidéo et un son tendance |
| Jeudi 19 h | Snapchat | Story et Spotlight avec la même vidéo |
| Samedi | Instagram | Story : vidéo, sticker Lien et sondage |

## Régénérer le kit

Depuis `promo-vetements/source/` :

```
pip install pillow imageio-ffmpeg
node build.mjs     # carrousel, PDF LinkedIn et calques de la vidéo (Playwright requis)
python3 video.py   # vidéo 9:16
```

Les textes des diapositives et des cartes vidéo sont dans `build.mjs`, l'ordre et la
durée des plans dans la liste `PLANS` de `video.py`.
