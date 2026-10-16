#!/usr/bin/env python3
"""Actualiza Web/data/stream.json con el stream de YouTube del club.

Si el canal está en vivo, guarda ese video con "live": true. Si no, guarda el
último video publicado (feed RSS del canal) con "live": false.

Uso: python3 scripts/actualizar_stream.py
Imprime "cambios" o "sin cambios". Si YouTube falla, no toca nada y sale con error.
"""

# ############################################################
# IMPORTACIONES
# ############################################################
import json, re, sys, urllib.request
from pathlib import Path

# ############################################################
# CONFIGURACIÓN
# ############################################################
CANAL = "UC1QzmPf5WnKTTq2lWsyGvpA"
FEED = f"https://www.youtube.com/feeds/videos.xml?channel_id={CANAL}"
LIVE = f"https://www.youtube.com/channel/{CANAL}/live"
SALIDA = Path(__file__).resolve().parent.parent / "Web" / "data" / "stream.json"

# ############################################################
# UTILIDADES
# ############################################################
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (DonBoscoRugby-Web)", "Accept-Language": "es-AR,es;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

# ############################################################
# VIDEO EN VIVO (la página /live apunta al video si hay transmisión)
# ############################################################
def en_vivo():
    html = get(LIVE)
    m = re.search(r'rel="canonical" href="https://www\.youtube\.com/watch\?v=([\w-]{11})"', html)
    if m and '"isLiveNow":true' in html:
        t = re.search(r'<meta name="title" content="([^"]*)"', html)
        return {"id": m.group(1), "live": True, "title": t.group(1) if t else ""}
    return None

# ############################################################
# ÚLTIMO VIDEO PUBLICADO
# ############################################################
def ultimo():
    xml = get(FEED)
    m = re.search(r"<entry>.*?<yt:videoId>([\w-]{11})</yt:videoId>.*?<title>([^<]*)</title>", xml, re.S)
    if not m:
        sys.exit("No encontré videos en el feed")
    return {"id": m.group(1), "live": False, "title": m.group(2).replace("&amp;", "&")}

# ############################################################
# ESCRITURA
# ############################################################
def main():
    data = en_vivo() or ultimo()
    new = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    old = SALIDA.read_text(encoding="utf-8") if SALIDA.exists() else ""
    if new == old:
        print("sin cambios"); return
    SALIDA.write_text(new, encoding="utf-8")
    print("cambios")

# ############################################################
# PUNTO DE ENTRADA
# ############################################################
if __name__ == "__main__":
    main()
