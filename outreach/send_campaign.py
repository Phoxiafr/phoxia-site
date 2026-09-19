#!/usr/bin/env python3
"""Campagne d'emailing B2B pour Phoxia. Voir outreach/README.md avant utilisation."""

import argparse
import csv
import os
import smtplib
import sys
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REQUIRED_COLUMNS = {"email", "prenom", "entreprise", "secteur"}


def load_emails(path: Path) -> set[str]:
    if not path.exists():
        return set()
    with path.open(newline="", encoding="utf-8") as f:
        return {row["email"].strip().lower() for row in csv.DictReader(f) if row.get("email")}


def load_template(templates_dir: Path, secteur: str) -> tuple[str, str]:
    slug = secteur.strip().lower()
    path = templates_dir / f"{slug}.txt"
    if not path.exists():
        raise FileNotFoundError(
            f"Pas de modèle pour le secteur '{secteur}' (attendu : {path})"
        )
    raw = path.read_text(encoding="utf-8")
    subject_line, _, body = raw.partition("\n")
    if not subject_line.upper().startswith("OBJET:"):
        raise ValueError(f"Le modèle {path} doit commencer par une ligne 'OBJET: ...'")
    return subject_line.split(":", 1)[1].strip(), body.strip("\n")


def render(text: str, contact: dict) -> str:
    for key, value in contact.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def append_row(path: Path, fieldnames: list[str], row: dict) -> None:
    is_new = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if is_new:
            writer.writeheader()
        writer.writerow(row)


def build_message(subject: str, body: str, from_name: str, from_email: str, to_email: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Reply-To"] = from_email
    msg["List-Unsubscribe"] = f"<mailto:{from_email}?subject=STOP>"
    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    msg.set_content(body)
    return msg


def send_live(msg: EmailMessage) -> None:
    host = os.environ["PHOXIA_SMTP_HOST"]
    port = int(os.environ.get("PHOXIA_SMTP_PORT", "587"))
    user = os.environ["PHOXIA_SMTP_USER"]
    password = os.environ["PHOXIA_SMTP_PASSWORD"]
    with smtplib.SMTP(host, port, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(user, password)
        smtp.send_message(msg)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contacts", type=Path, default=BASE_DIR / "contacts.csv")
    parser.add_argument("--templates-dir", type=Path, default=BASE_DIR / "templates")
    parser.add_argument("--unsubscribe", type=Path, default=BASE_DIR / "desinscriptions.csv")
    parser.add_argument("--sent-log", type=Path, default=BASE_DIR / "envois.csv")
    parser.add_argument("--max-send", type=int, default=50, help="Nombre maximal d'emails à envoyer sur cette exécution (envoyer par lots, pas 1000 d'un coup).")
    parser.add_argument("--delay", type=float, default=8.0, help="Secondes d'attente entre deux envois.")
    parser.add_argument("--from-name", default=os.environ.get("PHOXIA_FROM_NAME", "Mathieu Barthélémy — Phoxia"))
    parser.add_argument("--from-email", default=os.environ.get("PHOXIA_FROM_EMAIL", "mathieu@phoxia.fr"))
    parser.add_argument("--live", action="store_true", help="Envoie réellement les emails. Sans cette option : simulation (aucun email envoyé).")
    args = parser.parse_args()

    if not args.contacts.exists():
        print(f"Fichier de contacts introuvable : {args.contacts}", file=sys.stderr)
        print("Copiez contacts.exemple.csv vers contacts.csv et remplissez-le avec une liste réelle et légalement obtenue.", file=sys.stderr)
        return 1

    unsubscribed = load_emails(args.unsubscribe)
    already_sent = load_emails(args.sent_log)

    with args.contacts.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            print(f"Colonnes manquantes dans {args.contacts} : {', '.join(sorted(missing))}", file=sys.stderr)
            return 1
        contacts = list(reader)

    sent_count = 0
    for contact in contacts:
        if sent_count >= args.max_send:
            break

        email = contact["email"].strip().lower()
        if not email or email in unsubscribed or email in already_sent:
            continue

        try:
            subject, body = load_template(args.templates_dir, contact["secteur"])
        except (FileNotFoundError, ValueError) as exc:
            print(f"[ignoré] {email} : {exc}", file=sys.stderr)
            continue

        subject = render(subject, contact)
        body = render(body, contact)
        msg = build_message(subject, body, args.from_name, args.from_email, email)

        if args.live:
            send_live(msg)
        else:
            print(f"--- SIMULATION : {email} ({contact['secteur']}) ---")
            print(f"Objet : {subject}")
            print(body)
            print()

        append_row(
            args.sent_log,
            ["email", "entreprise", "secteur", "date", "mode"],
            {
                "email": email,
                "entreprise": contact.get("entreprise", ""),
                "secteur": contact.get("secteur", ""),
                "date": datetime.now(timezone.utc).isoformat(),
                "mode": "live" if args.live else "simulation",
            },
        )
        sent_count += 1
        if args.live and sent_count < args.max_send:
            time.sleep(args.delay)

    mode = "envoyés" if args.live else "simulés (aucun email réellement envoyé, utilisez --live pour envoyer)"
    print(f"{sent_count} email(s) {mode}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
