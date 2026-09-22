// Génère les images (PNG) et la vidéo (MP4) dans export/
// Usage : node render.js   (nécessite playwright et ffmpeg)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ici = __dirname;
const sortie = path.join(ici, "export");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FPS = 30;

(async () => {
  fs.mkdirSync(sortie, { recursive: true });
  const nav = await chromium.launch();

  for (const f of ["post", "story"]) {
    const page = await nav.newPage({ viewport: { width: 1080, height: f === "story" ? 1920 : 1080 } });
    for (const v of [1, 2, 3, 4, 5]) {
      await page.goto(`file://${ici}/visuels.html?v=${v}&f=${f}`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".toile").screenshot({ path: path.join(sortie, `paradis-${f}-${v}.png`) });
    }
    await page.close();
  }

  // Vidéo : chaque image est rendue à un instant précis, puis assemblée par ffmpeg
  const images = path.join(sortie, "_images");
  fs.rmSync(images, { recursive: true, force: true });
  fs.mkdirSync(images);
  const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`file://${ici}/video.html`);
  await page.evaluate(() => document.fonts.ready);
  const duree = await page.evaluate(() => DUREE);
  for (let i = 0; i < duree * FPS; i++) {
    await page.evaluate((t) => rendre(t), i / FPS);
    await page.screenshot({ path: path.join(images, `${String(i).padStart(4, "0")}.png`) });
  }
  await nav.close();

  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(images, "%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart",
    path.join(sortie, "paradis-story-video.mp4")]);
  fs.rmSync(images, { recursive: true, force: true });
  console.log("Terminé :", fs.readdirSync(sortie).join(", "));
})();
