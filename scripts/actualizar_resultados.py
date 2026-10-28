#!/usr/bin/env python3
"""Actualiza el array M de Web/js/app.js y Web/data/playoff.json con el fixture de la URBA (Primera B 2026).

Uso: python3 scripts/actualizar_resultados.py
Sale con 0 haya o no cambios; imprime "cambios" o "sin cambios".
Si la API falla o devuelve algo raro, no toca nada y sale con error.
"""

# ############################################################
# IMPORTACIONES
# ############################################################
import json, re, sys, unicodedata, urllib.request
from pathlib import Path

# ############################################################
# CONFIGURACIÓN
# ############################################################
CHAMP = 2025178
URL = f"https://urba.org.ar/api/fixture/championship/{CHAMP}"
CLUB = "Don Bosco"
APP = Path(__file__).resolve().parent.parent / "Web" / "js" / "app.js"
PLAYOFF = APP.parent.parent / "data" / "playoff.json"

# ############################################################
# UTILIDADES
# ############################################################
def norm(s):
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if not unicodedata.combining(c)).lower().strip()

# ############################################################
# DESCARGA DEL FIXTURE DE LA URBA
# ############################################################
def fetch():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (DonBoscoRugby-Web)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["championship"]

# ############################################################
# POSICIONES Y PLAYOFF DE ASCENSO
# ############################################################
def playoff(champ, names):
    """Arma data/playoff.json. Solo hay cruce si terminaron las 26 fechas y Don Bosco quedó 2º a 5º
    (1º asciende directo, 2º vs 5º y 3º vs 4º; el mejor ubicado es local). Tabla: 4 pts ganado, 2 empate,
    +1 bonus ofensivo, +1 bonus defensivo (perder por 7 o menos); desempate por diferencia de tantos."""
    pts, dif, done = {}, {}, True
    for r in champ["rounds"]:
        if not r["name"].startswith("Fecha"):
            continue
        for g in r["matches"]:
            if not g["fulfilled"] or g["suspended"]:
                done = False
                continue
            a, b = g["local_team_score"], g["visit_team_score"]
            for t, s, o, bon in ((g["local_team"]["name"], a, b, g["local_team_offensive_bonus"]),
                                 (g["visit_team"]["name"], b, a, g["visit_team_offensive_bonus"])):
                pts[t] = pts.get(t, 0) + (4 if s > o else 2 if s == o else 0) + (1 if bon else 0) + (1 if 0 < o - s <= 7 else 0)
                dif[t] = dif.get(t, 0) + s - o
    out = {"juega": False}
    if done and sum(r["name"].startswith("Fecha") for r in champ["rounds"]) >= 26 and CLUB in pts:
        tabla = sorted(pts, key=lambda t: (-pts[t], -dif[t]))
        pos = tabla.index(CLUB) + 1
        if 2 <= pos <= 5:
            rival = tabla[5 - pos + 1]  # 2-5, 3-4
            out = {"juega": True, "pos": pos, "rival": names.get(norm(rival), rival), "local": pos in (2, 3)}
            # si la URBA ya cargó el cruce (ronda PLAYOFF), vale lo que dice ella
            for r in champ["rounds"]:
                for g in r["matches"] if not r["name"].startswith("Fecha") else []:
                    lo, vi = g["local_team"]["name"], g["visit_team"]["name"]
                    if CLUB in (lo, vi):
                        rv = vi if lo == CLUB else lo
                        out.update({"rival": names.get(norm(rv), rv), "local": lo == CLUB, "fecha": r["playdate"][:10]})
    new = json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    if PLAYOFF.exists() and PLAYOFF.read_text(encoding="utf-8") == new:
        return False
    PLAYOFF.write_text(new, encoding="utf-8")
    return True

# ############################################################
# ACTUALIZACIÓN DEL ARRAY M EN app.js
# ############################################################
def main():

    # ############################################################
    # LECTURA DE app.js
    # ############################################################
    src = APP.read_text(encoding="utf-8")
    m = re.search(r"(  var M = \[\n)(.*?)(\n  \];)", src, re.S)
    if not m:
        sys.exit("No encuentro el array M en app.js")
    # nombres y horas que ya están cargados (con tildes) por número de fecha
    old = {}
    for row in re.findall(r"\[(\d+),\"([\d-]+)\",\"([^\"]+)\",\"([LV])\",(null|\d+),(null|\d+)(?:,\"([\d:]+)\")?\]", m.group(2)):
        old[int(row[0])] = row
    names = {norm(r[2]): r[2] for r in old.values()}

    # ############################################################
    # ARMADO DE LAS FILAS
    # ############################################################
    champ = fetch()
    rounds = champ["rounds"]
    if len(rounds) < 20:
        sys.exit(f"El fixture trae {len(rounds)} fechas, algo cambió")
    rows = []
    for r in rounds:
        if not r["name"].startswith("Fecha"):
            continue
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

    # ############################################################
    # ESCRITURA
    # ############################################################
    body = "\n".join(rows).rstrip(",")
    new = src[:m.start(2)] + body + src[m.end(2):]
    cambio = playoff(champ, names)
    if new != src:
        APP.write_text(new, encoding="utf-8")
        cambio = True
    print("cambios" if cambio else "sin cambios")

# ############################################################
# PUNTO DE ENTRADA
# ############################################################
if __name__ == "__main__":
    main()
