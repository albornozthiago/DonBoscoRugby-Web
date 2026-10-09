#!/usr/bin/env python3
"""Actualiza el array M de Web/js/app.js con el fixture de la URBA (Primera B 2026).

Uso: python3 scripts/actualizar_resultados.py
Sale con 0 haya o no cambios; imprime "cambios" o "sin cambios".
Si la API falla o devuelve algo raro, no toca nada y sale con error.
"""
import json, re, sys, unicodedata, urllib.request
from pathlib import Path

CHAMP = 2025178
URL = f"https://urba.org.ar/api/fixture/championship/{CHAMP}"
CLUB = "Don Bosco"
APP = Path(__file__).resolve().parent.parent / "Web" / "js" / "app.js"

def norm(s):
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if not unicodedata.combining(c)).lower().strip()

def fetch():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (DonBoscoRugby-Web)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["championship"]

def main():
    src = APP.read_text(encoding="utf-8")
    m = re.search(r"(  var M = \[\n)(.*?)(\n  \];)", src, re.S)
    if not m:
        sys.exit("No encuentro el array M en app.js")
    # nombres y horas que ya están cargados (con tildes) por número de fecha
    old = {}
    for row in re.findall(r"\[(\d+),\"([\d-]+)\",\"([^\"]+)\",\"([LV])\",(null|\d+),(null|\d+)(?:,\"([\d:]+)\")?\]", m.group(2)):
        old[int(row[0])] = row
    names = {norm(r[2]): r[2] for r in old.values()}

    champ = fetch()
    rounds = champ["rounds"]
    if len(rounds) < 20:
        sys.exit(f"El fixture trae {len(rounds)} fechas, algo cambió")
    rows = []
    for r in rounds:
        n = int(re.search(r"\d+", r["name"]).group())
        for g in r["matches"]:
            lo, vi = g["local_team"]["name"], g["visit_team"]["name"]
            if CLUB not in (lo, vi):
                continue
            home = lo == CLUB
            rival = vi if home else lo
            rival = names.get(norm(rival), rival)
            date = r["playdate"][:10]
            if g["fulfilled"] and not g["suspended"]:
                a, b = g["local_team_score"], g["visit_team_score"]
                db, rv = (a, b) if home else (b, a)
                rows.append(f'    [{n},"{date}","{rival}","{"L" if home else "V"}",{db},{rv}],')
            else:
                hora = old.get(n, [None] * 7)[6] or "15:30"
                rows.append(f'    [{n},"{date}","{rival}","{"L" if home else "V"}",null,null,"{hora}"],')
    if not rows:
        sys.exit(f"No encontré partidos de {CLUB}")
    body = "\n".join(rows).rstrip(",")
    new = src[:m.start(2)] + body + src[m.end(2):]
    if new == src:
        print("sin cambios"); return
    APP.write_text(new, encoding="utf-8")
    print("cambios")

if __name__ == "__main__":
    main()
