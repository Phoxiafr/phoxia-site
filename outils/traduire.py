#!/usr/bin/env python3
"""Génère les versions anglaise (/en/) et espagnole (/es/) des pages principales.

Le français est la source. Lancez depuis la racine du dépôt :

    python3 outils/traduire.py

Le script :
  1. lit index.html, formations.html et contact.html ;
  2. remplace chaque texte par sa traduction (outils/traductions/textes.py) ;
  3. ajuste les liens (les pages non traduites renvoient vers la version française) ;
  4. écrit en/*.html et es/*.html, puis applique le gabarit commun ;
  5. liste les textes français qui n'ont pas encore de traduction.
"""
import pathlib
import re
import sys

ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parent
sys.path.insert(0, str(ICI))

import gabarit  # noqa: E402
from extraction import ATTRS  # noqa: E402
import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("trad", ICI / "traductions" / "textes.py")
trad = importlib.util.module_from_spec(spec)
spec.loader.exec_module(trad)

PAGES = list(gabarit.PAGES_TRADUITES)
LOCALES = {"en": "en_US", "es": "es_ES"}


def dictionnaire(langue):
    i = {"en": 1, "es": 2}[langue]
    return {ligne[0]: ligne[i] for ligne in trad.T}


def echapper_attr(t):
    return t.replace('"', "&quot;")


def traduire_html(html, d, manquants):
    # Les blocs du gabarit sont régénérés ensuite : on les vide.
    html = re.sub(r"<!-- debut:(tete|entete|pied|langues) -->.*?<!-- fin:\1 -->", lambda m: f"<!-- debut:{m.group(1)} --><!-- fin:{m.group(1)} -->", html, flags=re.S)
    html = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', "", html, flags=re.S)

    def texte(m):
        brut = m.group(1)
        t = brut.strip()
        if not t or not re.search(r"[A-Za-zÀ-ÿ]{2}", t):
            return m.group(0)
        if t in d:
            return ">" + brut.replace(t, d[t]) + "<"
        manquants.add(t)
        return m.group(0)

    # Textes entre balises, hors scripts et styles
    morceaux = re.split(r"(<(?:script|style)\b.*?</(?:script|style)>)", html, flags=re.S)
    for k in range(0, len(morceaux), 2):
        morceaux[k] = re.sub(r">([^<>]+)<", texte, morceaux[k])
    html = "".join(morceaux)

    for a in ATTRS:
        def attr(m, a=a):
            t = m.group(1).strip()
            if t in d:
                return f' {a}="{echapper_attr(d[t])}"'
            if re.search(r"[A-Za-zÀ-ÿ]{2}", t):
                manquants.add(t)
            return m.group(0)
        html = re.sub(rf'\s{a}="([^"]*)"', attr, html)

    def meta(m):
        t = m.group(2)
        if t in d:
            return f'{m.group(1)}"{echapper_attr(d[t])}"'
        manquants.add(t)
        return m.group(0)
    html = re.sub(r'(<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)" content=)"([^"]*)"', meta, html)
    return html


def ajuster_liens(html, langue, nom):
    def corriger(m):
        attr, val = m.group(1), m.group(2)
        if re.match(r"(https?:|mailto:|tel:|#|data:|/|javascript:)", val):
            return m.group(0)
        base = val.split("#")[0]
        if base in gabarit.PAGES_TRADUITES:
            return m.group(0)
        return f'{attr}="../{val}"'
    html = re.sub(r'\b(href|src|poster)="([^"]*)"', corriger, html)
    url = f"https://phoxia.fr/{langue}/" + ("" if nom == "index.html" else nom)
    html = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', html)
    html = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', html)
    html = re.sub(r'<meta property="og:locale" content="[^"]*">', f'<meta property="og:locale" content="{LOCALES[langue]}">', html)
    html = re.sub(r'<html lang="[^"]*">', f'<html lang="{langue}">', html)
    return html


def main():
    manquants = {"en": set(), "es": set()}
    for langue in ("en", "es"):
        d = dictionnaire(langue)
        dossier = RACINE / langue
        dossier.mkdir(exist_ok=True)
        for nom in PAGES:
            html = (RACINE / nom).read_text(encoding="utf-8")
            html = traduire_html(html, d, manquants[langue])
            html = ajuster_liens(html, langue, nom)
            (dossier / nom).write_text(html, encoding="utf-8")
    gabarit.main()
    ok = True
    for langue, m in manquants.items():
        if m:
            ok = False
            print(f"\nTextes sans traduction ({langue}) :")
            for t in sorted(m):
                print("  -", t)
    if ok:
        print("Toutes les traductions sont à jour.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
