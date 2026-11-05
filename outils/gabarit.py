#!/usr/bin/env python3
"""Gabarit commun du site Phoxia : tête, en-tête, menu mobile, pied de page.

Chaque page HTML contient sa propre copie de ces blocs, délimités par des
marqueurs :

    <!-- debut:tete -->    ... <!-- fin:tete -->     (polices, styles, icônes, langues)
    <!-- debut:entete -->  ... <!-- fin:entete -->   (barre de navigation + menu mobile)
    <!-- debut:langues --> ... <!-- fin:langues -->  (sélecteur de langue, facultatif)
    <!-- debut:pied -->    ... <!-- fin:pied -->     (pied de page, fiches du menu,
                                                      tiroir de détail, scripts)

Le site existe en trois langues : français à la racine, anglais dans /en/,
espagnol dans /es/ (pages traduites : accueil, formations, contact). Les blocs
ci-dessus sont produits dans la langue de chaque page.

Pour modifier le menu, le pied de page ou les fiches du menu : changez ce
fichier, puis lancez depuis la racine du dépôt

    python3 outils/gabarit.py

(outils/traduire.py le lance aussi après avoir régénéré les pages traduites.)
"""
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

TELEPHONE = "+33 7 82 59 09 91"
TELEPHONE_LIEN = "+33782590991"
EMAIL = "mathieu@phoxia.fr"
CALENDLY = "https://calendly.com/mathieu-phoxia/30min"

LANGUES = ("fr", "en", "es")
# Pages qui existent dans les trois langues ; les autres restent en français.
PAGES_TRADUITES = ("index.html", "formations.html", "contact.html")

# Textes de l'interface commune, par langue.
UI = {
    "fr": dict(saut="Aller au contenu", accueil="Phoxia, retour à l'accueil", nav="Navigation principale",
               nav_mobile="Navigation mobile", discutons="Discutons", menu="Menu", contact="Contact",
               slogan="Là où les idées prennent le large. L'intelligence artificielle appliquée à la croissance des PME.",
               slogan_court="Là où les idées prennent le large", navigation="Navigation", infos="Informations",
               reserver="Réserver 30 minutes", haut="Retour en haut ↑", detail="Détail", fermer="Fermer ✕",
               sur="Phoxia sur", fiche="Fiche", langue="Langue du site"),
    "en": dict(saut="Skip to content", accueil="Phoxia, back to home", nav="Main navigation",
               nav_mobile="Mobile navigation", discutons="Let's talk", menu="Menu", contact="Contact",
               slogan="Where ideas set sail. Artificial intelligence applied to the growth of small and mid-sized businesses.",
               slogan_court="Where ideas set sail", navigation="Navigation", infos="Information",
               reserver="Book 30 minutes", haut="Back to top ↑", detail="Details", fermer="Close ✕",
               sur="Phoxia on", fiche="Sheet", langue="Site language"),
    "es": dict(saut="Ir al contenido", accueil="Phoxia, volver al inicio", nav="Navegación principal",
               nav_mobile="Navegación móvil", discutons="Hablemos", menu="Menú", contact="Contacto",
               slogan="Donde las ideas zarpan. Inteligencia artificial aplicada al crecimiento de las pymes.",
               slogan_court="Donde las ideas zarpan", navigation="Navegación", infos="Información",
               reserver="Reservar 30 minutos", haut="Volver arriba ↑", detail="Detalle", fermer="Cerrar ✕",
               sur="Phoxia en", fiche="Ficha", langue="Idioma del sitio"),
}

# (cible depuis la racine, libellés fr/en/es, clé de fiche)
MENU = [
    ("index.html#services", ("Services", "Services", "Servicios"), "nav-services"),
    ("index.html#traversee", ("Méthode", "Process", "Método"), "nav-methode"),
    ("index.html#journal", ("Missions", "Projects", "Misiones"), "nav-journal"),
    ("formations.html", ("Formations", "Training", "Formación"), "nav-formations"),
    ("index.html#equipage", ("Équipe", "Team", "Equipo"), "nav-equipage"),
    ("actualites/", ("Blog", "Blog (FR)", "Blog (FR)"), "nav-blog"),
]

PIED_NAVIGATION = [
    ("index.html#services", ("Services", "Services", "Servicios")),
    ("index.html#traversee", ("Méthode", "Process", "Método")),
    ("index.html#journal", ("Missions", "Projects", "Misiones")),
    ("formations.html", ("Formations", "Training", "Formación")),
    ("index.html#equipage", ("Équipe", "Team", "Equipo")),
    ("actualites/", ("Blog", "Blog (FR)", "Blog (FR)")),
    ("contact.html", ("Contact", "Contact", "Contacto")),
]

PIED_INFORMATIONS = [
    ("mentions-legales.html", ("Mentions légales", "Legal notice (FR)", "Aviso legal (FR)")),
    ("politique-de-confidentialite.html", ("Politique de confidentialité", "Privacy policy (FR)", "Política de privacidad (FR)")),
    ("sitemap.xml", ("Plan du site", "Sitemap", "Mapa del sitio")),
]

# Fiches qui sortent au survol des liens du menu : clé -> {langue: (rubrique, titre, texte, puces)}
FICHES_MENU = {
    "nav-services": {
        "fr": ("Services", "Ce qu'on met en place", "Formations, automatisations, assistants IA, prospection, contenus et pilotage : six chantiers concrets.", ["Six services", "Prix fixe annoncé avant de commencer"]),
        "en": ("Services", "What we set up", "Training, automation, AI assistants, prospecting, content and reporting: six practical services.", ["Six services", "Fixed price agreed before we start"]),
        "es": ("Servicios", "Lo que ponemos en marcha", "Formación, automatizaciones, asistentes de IA, prospección, contenidos y gestión: seis servicios concretos.", ["Seis servicios", "Precio cerrado antes de empezar"]),
    },
    "nav-methode": {
        "fr": ("Méthode", "Le protocole", "Quatre étapes, du premier appel à l'autonomie de vos équipes.", ["Diagnostic offert", "Proposition sous 48 h", "Mise en place", "Autonomie"]),
        "en": ("Process", "Our process", "Four steps, from the first call to your team's autonomy.", ["Free assessment", "Proposal within 48 h", "Implementation", "Autonomy"]),
        "es": ("Método", "El proceso", "Cuatro etapas, de la primera llamada a la autonomía de su equipo.", ["Diagnóstico gratuito", "Propuesta en 48 h", "Implantación", "Autonomía"]),
    },
    "nav-journal": {
        "fr": ("Missions", "Missions réelles", "Ce qui a déjà été fait, sans exemple inventé.", ["Formation IA dispensée", "3 projets sur mesure", "Formation interne aux assistants IA"]),
        "en": ("Projects", "Real projects", "What we have already done, no invented examples.", ["AI training delivered", "3 tailored projects", "In-house AI assistant training"]),
        "es": ("Misiones", "Misiones reales", "Lo que ya hemos hecho, sin ejemplos inventados.", ["Formación de IA impartida", "3 proyectos a medida", "Formación interna en asistentes de IA"]),
    },
    "nav-formations": {
        "fr": ("Catalogue", "10 formations", "Du socle pour débuter jusqu'à la création d'un agent IA, sur vos propres cas.", ["Socle", "Métiers", "Automatisation", "Transversal"]),
        "en": ("Catalogue", "10 courses", "From the basics to building an AI agent, on your own cases.", ["Foundations", "By role", "Automation", "Cross-functional"]),
        "es": ("Catálogo", "10 formaciones", "Desde la base hasta la creación de un agente de IA, con sus propios casos.", ["Base", "Por oficio", "Automatización", "Transversal"]),
    },
    "nav-equipage": {
        "fr": ("Équipe", "Qui fait Phoxia", "Mathieu Barthélémy, gérant et fondateur, et Pragun Bilgaiyan, International Sales Manager.", ["Vente, conseil, data, international", "Français, anglais, espagnol"]),
        "en": ("Team", "Who makes Phoxia", "Mathieu Barthélémy, managing director and founder, and Pragun Bilgaiyan, International Sales Manager.", ["Sales, consulting, data, international", "French, English, Spanish"]),
        "es": ("Equipo", "Quién hace Phoxia", "Mathieu Barthélémy, gerente y fundador, y Pragun Bilgaiyan, International Sales Manager.", ["Ventas, consultoría, datos, internacional", "Francés, inglés, español"]),
    },
    "nav-blog": {
        "fr": ("Blog", "Articles de fond", "Stratégie commerciale, pilotage, international : écrits depuis le terrain.", ["3 articles"]),
        "en": ("Blog", "In-depth articles", "Sales strategy, reporting, international: written from the field. In French.", ["3 articles in French"]),
        "es": ("Blog", "Artículos de fondo", "Estrategia comercial, gestión, internacional: escritos desde el terreno. En francés.", ["3 artículos en francés"]),
    },
    "nav-contact": {
        "fr": ("Contact", "Discutons", "Trente minutes offertes pour savoir ce que l'IA peut changer chez vous.", [EMAIL, TELEPHONE]),
        "en": ("Contact", "Let's talk", "Thirty free minutes to find out what AI can change for you.", [EMAIL, TELEPHONE]),
        "es": ("Contacto", "Hablemos", "Treinta minutos gratuitos para saber qué puede cambiar la IA en su empresa.", [EMAIL, TELEPHONE]),
    },
}

RESEAUX = [
    ("https://www.linkedin.com/company/phoxia", "LinkedIn", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.6 8.65 23 10.9 23 14.25V21h-4v-6.05c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.57-2.33 3.2V21h-4V9Z"/></svg>'),
    ("https://www.instagram.com/phoxia.fr/", "Instagram", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'),
    ("https://www.tiktok.com/@phoxia.fr", "TikTok", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2h-3v14.2a2.8 2.8 0 1 1-2.3-2.76V10.4a6.1 6.1 0 1 0 5.3 6.04V8.9a7 7 0 0 0 4 1.27V7.1a4.1 4.1 0 0 1-4-4.1V2Z"/></svg>'),
]


# ---------------------------------------------------------------------------

def rel(page):
    return page.relative_to(RACINE).as_posix()


def langue(page):
    r = rel(page)
    for l in ("en", "es"):
        if r.startswith(l + "/"):
            return l
    return "fr"


def idx(page):
    return LANGUES.index(langue(page))


def prefixe(page):
    """Chemin vers la racine du site depuis la page."""
    r = page.relative_to(RACINE)
    if r.as_posix() == "404.html":
        return "/"
    return "../" * (len(r.parts) - 1)


def lien(cible, page):
    """Lien vers une page cible (exprimée depuis la racine, en français)."""
    r = rel(page)
    l = langue(page)
    base, _, ancre = cible.partition("#")
    ancre = "#" + ancre if ancre else ""
    p = prefixe(page)
    if l != "fr" and base in PAGES_TRADUITES:
        # Lien vers la version traduite, dans le même dossier de langue.
        if base == "index.html" and r == f"{l}/index.html" and ancre:
            return ancre
        return base + ancre
    if r == "index.html" and base == "index.html" and ancre:
        return ancre
    if p == "/" and base == "index.html":
        return "/" + ancre
    if r.startswith("actualites/") and cible == "actualites/":
        return "./"
    return p + cible


def courant(cible, page):
    r = rel(page)
    l = langue(page)
    if l != "fr":
        r = r[len(l) + 1:]
    if cible == "actualites/":
        return r.startswith("actualites/")
    return "#" not in cible and r == cible


def accueil(page):
    return lien("index.html", page) if langue(page) != "fr" else ("/" if prefixe(page) == "/" else prefixe(page) + "index.html")


def equivalent(page, cible_langue):
    """Adresse de la même page dans une autre langue (l'accueil si elle n'est pas traduite)."""
    r = rel(page)
    l = langue(page)
    nom = r[len(l) + 1:] if l != "fr" else r
    if nom not in PAGES_TRADUITES:
        nom = "index.html"
    racine = prefixe(page)
    if racine == "/":
        racine = "/"
    cible = nom if cible_langue == "fr" else f"{cible_langue}/{nom}"
    return racine + cible


def selecteur(page, classe="langues"):
    l = langue(page)
    liens = []
    for code, nom in (("fr", "Français"), ("en", "English"), ("es", "Español")):
        cur = ' aria-current="true"' if code == l else ""
        liens.append(f'<a href="{equivalent(page, code)}" hreflang="{code}" lang="{code}" title="{nom}"{cur}>{code.upper()}</a>')
    return f'<span class="{classe}" aria-label="{UI[l]["langue"]}">' + "".join(liens) + "</span>"


def tete(page):
    p = prefixe(page)
    alternates = ""
    l = langue(page)
    nom = rel(page)[len(l) + 1:] if l != "fr" else rel(page)
    if nom in PAGES_TRADUITES:
        url = lambda code: "https://phoxia.fr/" + ("" if code == "fr" else code + "/") + ("" if nom == "index.html" else nom)
        alternates = "\n" + "\n".join(f'<link rel="alternate" hreflang="{c}" href="{url(c)}">' for c in LANGUES) + \
                     f'\n<link rel="alternate" hreflang="x-default" href="{url("fr")}">'
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
<link rel="stylesheet" href="{p}assets/css/site.css">{alternates}
<!-- fin:tete -->"""


def entete(page):
    p = prefixe(page)
    t = UI[langue(page)]
    i_l = idx(page)
    liens, mobiles = [], []
    for i, (cible, textes, cle) in enumerate(MENU, 1):
        cur = ' aria-current="page"' if courant(cible, page) else ""
        liens.append(f'      <a class="nav__lien" href="{lien(cible, page)}" data-apercu="{cle}"{cur}><sup>0{i}</sup><span data-brouille-texte>{textes[i_l]}</span></a>')
        mobiles.append(f'    <a class="menu-mobile__lien" href="{lien(cible, page)}"{cur}><sup>0{i}</sup>{textes[i_l]}</a>')
    cur_c = ' aria-current="page"' if courant("contact.html", page) else ""
    mobiles.append(f'    <a class="menu-mobile__lien" href="{lien("contact.html", page)}"{cur_c}><sup>0{len(MENU) + 1}</sup>{t["contact"]}</a>')
    return f"""<!-- debut:entete -->
<a class="saut-contenu" href="#contenu">{t["saut"]}</a>
<div class="progression-page" data-progression aria-hidden="true"></div>
<header class="entete" data-entete data-etat="haut">
  <div class="enveloppe entete__interieur">
    <a class="marque" href="{accueil(page)}" aria-label="{t["accueil"]}">
      <span class="marque__mot">Phoxia</span>
      <img class="marque__symbole" src="{p}assets/img/phoxia-symbole-clair.svg" alt="" width="139" height="102">
    </a>
    <nav class="nav" aria-label="{t["nav"]}">
{chr(10).join(liens)}
      <a class="nav__contact" href="{lien("contact.html", page)}" data-apercu="nav-contact"{cur_c}>{t["discutons"]}</a>
      {selecteur(page)}
    </nav>
    <div class="entete__mobile">{selecteur(page, "langues langues--mobile")}<button class="bascule-menu" type="button" data-bascule-menu aria-expanded="false" aria-controls="menu-mobile">{t["menu"]}</button></div>
  </div>
</header>
<div class="menu-mobile" id="menu-mobile" data-menu-mobile data-ouvert="false">
  <nav aria-label="{t["nav_mobile"]}">
{chr(10).join(mobiles)}
  </nav>
  <div class="menu-mobile__pied">
    <a href="tel:{TELEPHONE_LIEN}">{TELEPHONE}</a>
    <a href="mailto:{EMAIL}">{EMAIL}</a>
  </div>
</div>
<!-- fin:entete -->"""


def langues(page):
    return "<!-- debut:langues -->" + selecteur(page, "langues langues--grand") + "<!-- fin:langues -->"


def liste(entrees, page):
    out = []
    for cible, textes in entrees:
        cur = ' aria-current="page"' if courant(cible, page) else ""
        out.append(f'          <li><a href="{lien(cible, page)}"{cur}>{textes[idx(page)]}</a></li>')
    return "\n".join(out)


def fiches(page):
    l = langue(page)
    blocs = []
    for i, (cle, par_langue) in enumerate(FICHES_MENU.items(), 1):
        rub, titre, texte, puces = par_langue[l]
        items = "".join(f"<li>{x}</li>" for x in puces)
        blocs.append(
            f'<template id="apercu-{cle}"><div class="fiche__tete"><span>{rub}</span><span>{UI[l]["fiche"]} M{i:02d}</span></div>'
            f'<p class="fiche__titre">{titre}</p><p class="fiche__texte">{texte}</p>'
            f'<ul class="fiche__liste">{items}</ul></template>'
        )
    return "\n".join(blocs)


def pied(page):
    p = prefixe(page)
    t = UI[langue(page)]
    reseaux = "\n".join(
        f'          <a class="reseau" href="{url}" target="_blank" rel="noopener me" aria-label="{t["sur"]} {nom}" data-curseur="{nom}">{svg}</a>'
        for url, nom, svg in RESEAUX
    )
    return f"""<!-- debut:pied -->
<footer class="pied">
  <div class="enveloppe">
    <div class="pied__haut">
      <div>
        <a class="marque" href="{accueil(page)}" aria-label="Phoxia"><span class="marque__mot">Phoxia</span><img class="marque__symbole" src="{p}assets/img/phoxia-symbole-clair.svg" alt="" width="139" height="102"></a>
        <p class="pied__slogan">{t["slogan"]}</p>
        <div class="reseaux">
{reseaux}
        </div>
      </div>
      <nav aria-labelledby="pied-nav">
        <p class="pied__titre" id="pied-nav">{t["navigation"]}</p>
        <ul class="pied__liste">
{liste(PIED_NAVIGATION, page)}
        </ul>
      </nav>
      <div>
        <p class="pied__titre">{t["contact"]}</p>
        <ul class="pied__liste">
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a href="tel:{TELEPHONE_LIEN}">{TELEPHONE}</a></li>
          <li><a href="{CALENDLY}" target="_blank" rel="noopener">{t["reserver"]}</a></li>
        </ul>
      </div>
      <nav aria-labelledby="pied-legal">
        <p class="pied__titre" id="pied-legal">{t["infos"]}</p>
        <ul class="pied__liste">
{liste(PIED_INFORMATIONS, page)}
        </ul>
      </nav>
    </div>
    <div class="pied__bas">
      <p>© <span data-annee>2026</span> Phoxia</p>
      {selecteur(page)}
      <a href="#contenu">{t["haut"]}</a>
    </div>
  </div>
</footer>
<div class="tiroir" data-tiroir data-ouvert="false" aria-hidden="true" role="dialog" aria-modal="true" aria-label="{t["detail"]}">
  <div class="tiroir__voile" data-fermer></div>
  <div class="tiroir__panneau" data-lenis-prevent>
    <button class="tiroir__fermer" type="button" data-fermer>{t["fermer"]}</button>
    <div data-tiroir-contenu></div>
  </div>
</div>
{fiches(page)}
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
    html = re.sub(r"<!-- debut:langues -->.*?<!-- fin:langues -->", lambda m: langues(page), html, flags=re.S)
    if html != origine:
        page.write_text(html, encoding="utf-8")
        return True
    return False


def pages():
    motifs = ["*.html", "actualites/*.html", "en/*.html", "es/*.html"]
    for motif in motifs:
        for p in sorted(RACINE.glob(motif)):
            if "<!-- debut:entete -->" in p.read_text(encoding="utf-8"):
                yield p


def main():
    modifiees = [rel(p) for p in pages() if traiter(p)]
    print("Pages mises à jour : " + ", ".join(modifiees) if modifiees else "Tout est déjà synchronisé.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
