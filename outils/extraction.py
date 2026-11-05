"""Extraction des textes traduisibles d'une page (hors blocs du gabarit commun)."""
import re

ATTRS = ("alt", "aria-label", "placeholder", "data-curseur", "title")
PAGES = ["index.html", "formations.html", "contact.html", "404.html"]


def sans_gabarit(html):
    return re.sub(r"<!-- debut:(tete|entete|pied) -->.*?<!-- fin:\1 -->", "", html, flags=re.S)


def segments(html):
    """Renvoie la liste des textes à traduire, dans l'ordre d'apparition."""
    html = sans_gabarit(html)
    html = re.sub(r"<(script|style)\b.*?</\1>", "", html, flags=re.S)
    out = []
    for m in re.finditer(r">([^<>]+)<", html):
        t = m.group(1).strip()
        if re.search(r"[A-Za-zÀ-ÿ]{2}", t):
            out.append(t)
    for a in ATTRS:
        for m in re.finditer(rf'\s{a}="([^"]*)"', html):
            t = m.group(1).strip()
            if re.search(r"[A-Za-zÀ-ÿ]{2}", t):
                out.append(t)
    for m in re.finditer(r'<meta (?:name|property)="(?:description|og:title|og:description)" content="([^"]*)"', html):
        out.append(m.group(1))
    return out
