"""Assemble la vidéo verticale 1080 x 1920 (Reels, Stories, Snapchat) à partir des photos.

Lancer d'abord build.mjs (il produit les calques texte), puis : python3 video.py
Dépendances : pip install pillow imageio-ffmpeg
"""
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

ICI = Path(__file__).parent
RACINE = ICI.parent.parent
W, H, FPS = 1080, 1920, 30
FONDU = 0.5  # secondes de fondu enchaîné entre deux plans

# (photo, calque, durée en s, zoom début, zoom fin, décalage horizontal début, fin)
PLANS = [
    ("assets/img/bond/mathieu-bond-portrait.jpg", 1, 3.2, 1.00, 1.12, 0.0, 0.0),
    ("assets/img/bond/mathieu-bar-casino.jpg", 2, 3.0, 1.05, 1.15, -0.04, 0.04),
    ("assets/img/bond/mathieu-salon-db5.jpg", 3, 3.0, 1.15, 1.05, 0.03, -0.03),
    ("assets/img/bond/mathieu-db5-photo.jpg", 4, 3.2, 1.00, 1.12, 0.05, -0.02),
    (None, 5, 4.6, 1.0, 1.0, 0, 0),
]
ENCRE = (20, 33, 61)


def ease(t):
    return t * t * (3 - 2 * t)


def cadre(photo, zoom, dx):
    """Recadre la photo en 9:16 autour du centre, avec zoom et décalage horizontal."""
    pw, ph = photo.size
    ch = ph / zoom
    cw = ch * W / H
    if cw > pw:
        cw = pw
        ch = cw * H / W
    cx = pw / 2 + dx * pw
    cx = min(max(cx, cw / 2), pw - cw / 2)
    cy = ph / 2
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return photo.resize((W, H), Image.LANCZOS, box=box)


def images_du_plan(plan):
    src, calque, duree, z0, z1, x0, x1 = plan
    over = Image.open(ICI / "calques" / f"{calque}.png").convert("RGBA")
    photo = Image.open(RACINE / src).convert("RGB") if src else None
    n = round(duree * FPS)
    for i in range(n):
        t = ease(i / (n - 1))
        if photo:
            fond = cadre(photo, z0 + (z1 - z0) * t, x0 + (x1 - x0) * t).convert("RGBA")
        else:
            fond = Image.new("RGBA", (W, H), ENCRE + (255,))
        # Le texte apparaît en fondu une fois le fondu enchaîné terminé.
        a = min(1.0, max(0.0, (i - FONDU * FPS) / (0.4 * FPS)))
        calque_i = over.copy()
        calque_i.putalpha(calque_i.getchannel("A").point(lambda v: int(v * a)))
        yield Image.alpha_composite(fond, calque_i).convert("RGB")


def main():
    sortie = ICI.parent / "video-9x16-phoxia-mode.mp4"
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", str(sortie)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    f = round(FONDU * FPS)
    queue = []  # dernières images du plan précédent, pour le fondu enchaîné
    for plan in PLANS:
        images = list(images_du_plan(plan))
        for k, im in enumerate(images):
            if k < len(queue):
                im = Image.blend(queue[k], im, (k + 1) / (len(queue) + 1))
            if k >= len(images) - f and plan is not PLANS[-1]:
                continue
            proc.stdin.write(im.tobytes())
        queue = images[-f:]
    proc.stdin.close()
    proc.wait()
    print(sortie)


if __name__ == "__main__":
    main()
