#!/usr/bin/env python3
"""
Optimiza las fotos del sitio.

Uso (desde la carpeta del proyecto):
    python tools/optimize-images.py            # procesa todo lo que haya en tools/originals/
    python tools/optimize-images.py pileta     # procesa solo "pileta"

Por cada foto de tools/originals/<nombre>.(jpg|png|webp) genera en assets/img/:
    <nombre>-480.webp   celulares chicos / miniaturas
    <nombre>-800.webp   tarjetas y celulares grandes
    <nombre>-<ancho>.webp   tamaño completo (hasta 1280 px de ancho, sin agrandar nunca la foto)

También quita los metadatos (ubicación GPS, modelo del celular, etc.) y al final imprime
el ancho, el alto y el color promedio de cada foto, listos para pegar en js/data.js.

Necesita Pillow:  pip install pillow
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "originals"
OUT = ROOT / "assets" / "img"
WIDTHS = (480, 800)       # variantes chicas; la completa se calcula por foto
MAX_FULL = 1280           # ancho máximo de la variante completa
QUALITY = {480: 68, 800: 70, "full": 74}
EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def save_webp(img: Image.Image, path: Path, quality: int) -> int:
    img.save(path, "WEBP", quality=quality, method=6)  # method=6: compresión máxima (más lento, más liviano)
    return path.stat().st_size


def process(src: Path) -> dict:
    name = src.stem
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")  # respeta la rotación y descarta el resto de los metadatos
        w, h = im.size
        full_w = min(w, MAX_FULL)
        sizes = {}
        variants = [(x, QUALITY[x]) for x in WIDTHS if x < full_w] + [(full_w, QUALITY["full"])]
        for vw, q in variants:
            vh = round(h * vw / w)
            out = im if vw == w else im.resize((vw, vh), Image.LANCZOS)
            sizes[vw] = save_webp(out, OUT / f"{name}-{vw}.webp", q)
        avg = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    return {
        "id": name,
        "w": full_w,
        "h": round(h * full_w / w),
        "color": "#%02x%02x%02x" % avg,
        "orig_kb": src.stat().st_size // 1024,
        "sizes_kb": {k: v // 1024 for k, v in sizes.items()},
    }


def main() -> None:
    only = set(sys.argv[1:])
    files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS and (not only or p.stem in only))
    if not files:
        sys.exit(f"No hay fotos para procesar en {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    rows = [process(f) for f in files]
    total = 0
    print(f"{'foto':<18}{'original':>9}   variantes (KB)")
    for r in rows:
        total += sum(r["sizes_kb"].values())
        print(f"{r['id']:<18}{r['orig_kb']:>7} KB   {r['sizes_kb']}")
    print(f"\nTotal generado: {total} KB en {len(rows)} fotos\n")
    print("Para js/data.js:")
    print(json.dumps([{k: r[k] for k in ("id", "w", "h", "color")} for r in rows], ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
