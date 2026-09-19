# Outreach Phoxia — prospection email B2B

Outil pour envoyer des emails de prospection à des entreprises françaises dans le sport,
l'automobile, la technologie, la musique et la mode. Ce dossier fournit les modèles et le
script d'envoi ; il ne contient aucune liste de destinataires réels.

## Ce qu'il faut avant de lancer une campagne

1. **Une liste de contacts réelle et légalement obtenue.** Ce dépôt ne fournit qu'un exemple
   (`contacts.exemple.csv`) avec des lignes fictives, pour montrer le format attendu. Une
   liste de vraies entreprises doit venir d'une source légitime : export LinkedIn Sales
   Navigator, annuaire professionnel (Pappers, Société.com), liste d'un salon ou d'un
   événement, fichier client existant, etc. Ne pas utiliser d'adresses collectées par
   scraping massif sans base légale.
2. **Un service d'envoi dédié pour du volume.** Pour quelques dizaines d'emails, une adresse
   SMTP classique (Gmail, OVH) suffit. Pour approcher 1000 emails, utilisez un service pensé
   pour l'emailing transactionnel/prospection (Brevo, Mailjet, Mailgun...) avec SPF, DKIM et
   DMARC configurés sur le domaine `phoxia.fr` : sans cela, une grosse partie des emails finit
   en spam et le domaine peut être blacklisté.
3. **Un cadre légal respecté.** Voir la section suivante.

## Cadre légal (droit français / RGPD)

La prospection B2B par email vers l'adresse professionnelle générique d'une entreprise
(`contact@`, `info@`) est admise en France sans consentement préalable, à condition de :

- identifier clairement l'expéditeur (nom, société, adresse) — déjà fait dans les modèles ;
- proposer un moyen simple, gratuit et immédiat de se désinscrire — la ligne « répondez STOP »
  et l'en-tête `List-Unsubscribe` sont déjà en place dans le script ;
- traiter les désinscriptions sans délai (voir `desinscriptions.csv`) ;
- ne pas maquiller l'objet ou l'expéditeur du message.

Pour une adresse email professionnelle nominative (`prenom.nom@entreprise.fr`) rattachée à une
personne physique identifiable, le consentement préalable ou l'intérêt légitime documenté est
recommandé par la CNIL. Dans le doute, privilégiez les adresses génériques d'entreprise plutôt
que les adresses nominatives pour une prospection à froid de ce volume.

## Utilisation

```bash
cd outreach
cp contacts.exemple.csv contacts.csv
# éditez contacts.csv avec votre liste réelle : colonnes email, prenom, entreprise, secteur (+ nom, ville en option)
# secteur doit valoir : sport, automobile, technologie, musique ou mode

# 1) simulation (rien n'est envoyé, juste un aperçu et une trace dans envois.csv)
python3 send_campaign.py --max-send 20

# 2) envoi réel, par lots
export PHOXIA_SMTP_HOST="smtp.votre-service.fr"
export PHOXIA_SMTP_PORT=587
export PHOXIA_SMTP_USER="..."
export PHOXIA_SMTP_PASSWORD="..."
python3 send_campaign.py --live --max-send 100 --delay 10
```

Le script :

- ignore automatiquement les contacts déjà présents dans `desinscriptions.csv` ou dans
  `envois.csv` (déjà contactés), pour éviter les doublons et les relances non désirées ;
- choisit le modèle dans `templates/` en fonction de la colonne `secteur` ;
- journalise chaque envoi dans `envois.csv` avec horodatage.

## Étaler l'envoi de 1000 emails

N'envoyez jamais 1000 emails en une seule exécution : la plupart des services SMTP limitent
le volume horaire/quotidien, et un pic brutal déclenche les filtres anti-spam. Relancez la
commande `--live` par lots (ex. 100 à 150 par jour, `--max-send 100`) sur 7 à 10 jours,
idéalement via une tâche planifiée (cron). Le fichier `envois.csv` garantit qu'aucun contact
ne reçoit deux fois le même message d'un lot à l'autre.

## Traiter une désinscription

Ajoutez une ligne `email,date` dans `desinscriptions.csv` dès qu'un contact répond « STOP »
ou demande à ne plus être contacté. Le script l'excluera de tous les envois suivants.

## Fichiers

| Fichier | Rôle |
|---|---|
| `templates/*.txt` | Un modèle d'email par secteur (objet + corps, placeholders `{{prenom}}`, `{{entreprise}}`, `{{secteur}}`) |
| `contacts.exemple.csv` | Exemple de format, avec des données fictives |
| `contacts.csv` | Votre vraie liste (à créer, non versionnée si elle contient des données réelles) |
| `desinscriptions.csv` | Liste des emails à ne plus jamais contacter |
| `envois.csv` | Journal des envois (généré automatiquement) |
| `send_campaign.py` | Script d'envoi |
