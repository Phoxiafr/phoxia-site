#!/usr/bin/env python3
"""Gabarit commun du site Phoxia : tête, en-tête, menu mobile et pied de page.

Chaque page HTML contient sa propre copie de ces blocs, délimités par des
marqueurs :

    <!-- debut:tete -->   ... <!-- fin:tete -->     (polices, styles, icônes)
    <!-- debut:entete --> ... <!-- fin:entete -->   (barre de navigation + menu mobile)
    <!-- debut:pied -->   ... <!-- fin:pied -->     (pied de page, fiches du menu,
                                                     tiroir de détail, scripts)

Pour modifier le menu, le pied de page ou les fiches qui s'affichent au survol
du menu : changez ce fichier, puis lancez depuis la racine du dépôt

    python3 outils/gabarit.py

Toutes les pages qui portent les marqueurs sont mises à jour. Le reste des pages
n'est jamais touché. La page en cours reçoit automatiquement aria-current="page".
"""
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

TELEPHONE = "+33 7 82 59 09 91"
TELEPHONE_LIEN = "+33782590991"
EMAIL = "mathieu@phoxia.fr"
CALENDLY = "https://calendly.com/mathieu-phoxia/30min"

# (cible depuis la racine, libellé, clé de fiche d'aperçu)
MENU = [
    ("index.html#services", "Services", "nav-services"),
    ("index.html#traversee", "Méthode", "nav-methode"),
    ("index.html#journal", "Missions", "nav-journal"),
    ("formations.html", "Formations", "nav-formations"),
    ("index.html#equipage", "Équipe", "nav-equipage"),
    ("actualites/", "Blog", "nav-blog"),
]

PIED_NAVIGATION = [
    ("index.html#services", "Services"),
    ("index.html#traversee", "Méthode"),
    ("index.html#journal", "Missions"),
    ("formations.html", "Formations"),
    ("index.html#equipage", "Équipe"),
    ("actualites/", "Blog"),
    ("contact.html", "Contact"),
]

PIED_INFORMATIONS = [
    ("mentions-legales.html", "Mentions légales"),
    ("politique-de-confidentialite.html", "Politique de confidentialité"),
    ("sitemap.xml", "Plan du site"),
]

# Fiches qui sortent au survol des liens du menu (ordinateur uniquement).
# clé : (rubrique, titre, texte, puces)
FICHES_MENU = {
    "nav-services": ("Services", "Ce qu'on met en place",
                     "Formations, automatisations, assistants IA, prospection, contenus et pilotage : six chantiers concrets.",
                     ["Six services", "Prix fixe annoncé avant de commencer"]),
    "nav-methode": ("Méthode", "Le protocole",
                    "Quatre étapes, du premier appel à l'autonomie de vos équipes.",
                    ["Diagnostic offert", "Proposition sous 48 h", "Mise en place", "Autonomie"]),
    "nav-journal": ("Missions", "Missions réelles",
                    "Ce qui a déjà été fait, sans exemple inventé.",
                    ["Formation IA dispensée", "3 projets sur mesure", "Formation interne aux assistants IA"]),
    "nav-formations": ("Catalogue", "10 formations",
                       "Du socle pour débuter jusqu'à la création d'un agent IA, sur vos propres cas.",
                       ["Socle", "Métiers", "Automatisation", "Transversal"]),
    "nav-equipage": ("Équipe", "Qui fait Phoxia",
                     "Mathieu Barthélémy, gérant et fondateur, et Pragun Bilgaiyan, International Sales Manager.",
                     ["Vente, conseil, data, international", "Français, anglais, espagnol"]),
    "nav-blog": ("Blog", "Articles de fond",
                 "Stratégie commerciale, pilotage, international : écrits depuis le terrain.",
                 ["3 articles"]),
    "nav-contact": ("Contact", "Discutons",
                    "Trente minutes offertes pour savoir ce que l'IA peut changer chez vous.",
                    [EMAIL, TELEPHONE]),
}

FLECHE = '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true"><path d="M10 1l5 5-5 5M15 6H0" stroke="currentColor" stroke-width="1.6"/></svg>'

RESEAUX = [
    ("https://www.linkedin.com/company/phoxia", "LinkedIn", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.6 8.65 23 10.9 23 14.25V21h-4v-6.05c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.57-2.33 3.2V21h-4V9Z"/></svg>'),
    ("https://www.instagram.com/phoxia.fr/", "Instagram", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'),
    ("https://www.tiktok.com/@phoxia.fr", "TikTok", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2h-3v14.2a2.8 2.8 0 1 1-2.3-2.76V10.4a6.1 6.1 0 1 0 5.3 6.04V8.9a7 7 0 0 0 4 1.27V7.1a4.1 4.1 0 0 1-4-4.1V2Z"/></svg>'),
]


# ---------------------------------------------------------------------------

def prefixe(page):
    rel = page.relative_to(RACINE)
    if rel.as_posix() == "404.html":
        return "/"
    return "../" * (len(rel.parts) - 1)


def lien(cible, page):
    rel = page.relative_to(RACINE).as_posix()
    if rel == "index.html" and cible.startswith("index.html#"):
        return cible[len("index.html"):]
    p = prefixe(page)
    if p == "/" and cible.startswith("index.html"):
        return "/" + cible[len("index.html"):]
    if rel.startswith("actualites/") and cible == "actualites/":
        return "./"
    return p + cible


def courant(cible, page):
    rel = page.relative_to(RACINE).as_posix()
    if cible == "actualites/":
        return rel.startswith("actualites/")
    return "#" not in cible and rel == cible


def accueil(page):
    p = prefixe(page)
    return "/" if p == "/" else p + "index.html"


def tete(page):
    p = prefixe(page)
    return f"""<!-- debut:tete -->
<script>document.documentElement.classList.add('js')</script>
<meta name="theme-color" content="#05070b">
<link rel="icon" href="{p}assets/img/phoxia-favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="{p}assets/img/favicon.png" sizes="512x512" type="image/png">
<link rel="apple-touch-icon" href="{p}assets/img/favicon.png">
<link rel="manifest" href="{p}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400;1,500&amp;family=Instrument+Sans:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="{p}assets/css/site.css">
<!-- fin:tete -->"""


def entete(page):
    p = prefixe(page)
    liens, mobiles = [], []
    for i, (cible, texte, cle) in enumerate(MENU, 1):
        cur = ' aria-current="page"' if courant(cible, page) else ""
        liens.append(f'      <a class="nav__lien" href="{lien(cible, page)}" data-apercu="{cle}"{cur}><sup>0{i}</sup><span data-brouille-texte>{texte}</span></a>')
        mobiles.append(f'    <a class="menu-mobile__lien" href="{lien(cible, page)}"{cur}><sup>0{i}</sup>{texte}</a>')
    cur_c = ' aria-current="page"' if courant("contact.html", page) else ""
    mobiles.append(f'    <a class="menu-mobile__lien" href="{lien("contact.html", page)}"{cur_c}><sup>0{len(MENU) + 1}</sup>Contact</a>')
    return f"""<!-- debut:entete -->
<a class="saut-contenu" href="#contenu">Aller au contenu</a>
<div class="progression-page" data-progression aria-hidden="true"></div>
<header class="entete" data-entete data-etat="haut">
  <div class="enveloppe entete__interieur">
    <a class="marque" href="{accueil(page)}" aria-label="Phoxia, retour à l'accueil">
      <span class="marque__mot">Phoxia</span>
      <img class="marque__symbole" src="{p}assets/img/phoxia-symbole-clair.svg" alt="" width="139" height="102">
    </a>
    <nav class="nav" aria-label="Navigation principale">
{chr(10).join(liens)}
      <a class="nav__contact" href="{lien("contact.html", page)}" data-apercu="nav-contact"{cur_c}>Discutons</a>
    </nav>
    <button class="bascule-menu" type="button" data-bascule-menu aria-expanded="false" aria-controls="menu-mobile">Menu</button>
  </div>
</header>
<div class="menu-mobile" id="menu-mobile" data-menu-mobile data-ouvert="false">
  <nav aria-label="Navigation mobile">
{chr(10).join(mobiles)}
  </nav>
  <div class="menu-mobile__pied">
    <a href="tel:{TELEPHONE_LIEN}">{TELEPHONE}</a>
    <a href="mailto:{EMAIL}">{EMAIL}</a>
  </div>
</div>
<!-- fin:entete -->"""


def liste(entrees, page):
    out = []
    for cible, texte in entrees:
        cur = ' aria-current="page"' if courant(cible, page) else ""
        out.append(f'          <li><a href="{lien(cible, page)}"{cur}>{texte}</a></li>')
    return "\n".join(out)


def fiches():
    blocs = []
    for i, (cle, (rub, titre, texte, puces)) in enumerate(FICHES_MENU.items(), 1):
        items = "".join(f"<li>{x}</li>" for x in puces)
        blocs.append(
            f'<template id="apercu-{cle}"><div class="fiche__tete"><span>{rub}</span><span>Fiche M{i:02d}</span></div>'
            f'<p class="fiche__titre">{titre}</p><p class="fiche__texte">{texte}</p>'
            f'<ul class="fiche__liste">{items}</ul></template>'
        )
    return "\n".join(blocs)


def pied(page):
    p = prefixe(page)
    reseaux = "\n".join(
        f'          <a class="reseau" href="{url}" target="_blank" rel="noopener me" aria-label="Phoxia sur {nom}" data-curseur="{nom}">{svg}</a>'
        for url, nom, svg in RESEAUX
    )
    return f"""<!-- debut:pied -->
<footer class="pied">
  <div class="enveloppe">
    <div class="pied__haut">
      <div>
        <a class="marque" href="{accueil(page)}" aria-label="Phoxia"><span class="marque__mot">Phoxia</span><img class="marque__symbole" src="{p}assets/img/phoxia-symbole-clair.svg" alt="" width="139" height="102"></a>
        <p class="pied__slogan">Là où les idées prennent le large. L'intelligence artificielle appliquée à la croissance des PME.</p>
        <div class="reseaux">
{reseaux}
        </div>
      </div>
      <nav aria-labelledby="pied-nav">
        <p class="pied__titre" id="pied-nav">Navigation</p>
        <ul class="pied__liste">
{liste(PIED_NAVIGATION, page)}
        </ul>
      </nav>
      <div>
        <p class="pied__titre">Contact</p>
        <ul class="pied__liste">
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a href="tel:{TELEPHONE_LIEN}">{TELEPHONE}</a></li>
          <li><a href="{CALENDLY}" target="_blank" rel="noopener">Réserver 30 minutes</a></li>
        </ul>
      </div>
      <nav aria-labelledby="pied-legal">
        <p class="pied__titre" id="pied-legal">Informations</p>
        <ul class="pied__liste">
{liste(PIED_INFORMATIONS, page)}
        </ul>
      </nav>
    </div>
    <div class="pied__bas">
      <p>© <span data-annee>2026</span> Phoxia</p>
      <p>Là où les idées prennent le large</p>
      <a href="#contenu">Retour en haut ↑</a>
    </div>
  </div>
</footer>
<div class="tiroir" data-tiroir data-ouvert="false" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Détail">
  <div class="tiroir__voile" data-fermer></div>
  <div class="tiroir__panneau" data-lenis-prevent>
    <button class="tiroir__fermer" type="button" data-fermer>Fermer ✕</button>
    <div data-tiroir-contenu></div>
  </div>
</div>
{fiches()}
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="{p}assets/js/site.js" defer></script>
<!-- fin:pied -->"""


BLOCS = {"tete": tete, "entete": entete, "pied": pied}


def traiter(page):
    html = page.read_text(encoding="utf-8")
    origine = html
    for nom, fabrique in BLOCS.items():
        motif = re.compile(rf"<!-- debut:{nom} -->.*?<!-- fin:{nom} -->", re.S)
        if motif.search(html):
            contenu = fabrique(page)
            html = motif.sub(lambda m: contenu, html, count=1)
    if html != origine:
        page.write_text(html, encoding="utf-8")
        return True
    return False


def pages():
    for p in sorted(RACINE.glob("*.html")) + sorted(RACINE.glob("actualites/*.html")):
        if "<!-- debut:entete -->" in p.read_text(encoding="utf-8"):
            yield p


def main():
    modifiees = [p.relative_to(RACINE).as_posix() for p in pages() if traiter(p)]
    print("Pages mises à jour : " + ", ".join(modifiees) if modifiees else "Tout est déjà synchronisé.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
