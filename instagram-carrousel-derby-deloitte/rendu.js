// Génère les 6 visuels 1080 x 1350 à partir de source.html.
// Usage : node instagram-carrousel-derby-deloitte/rendu.js
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const dossier = __dirname;
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 1400 } });
  await page.goto("file://" + path.join(dossier, "source.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$("section.slide");
  for (const slide of slides) {
    const id = (await slide.getAttribute("id")).replace("s", "");
    await slide.screenshot({ path: path.join(dossier, `${id}-derby-deloitte.jpg`), type: "jpeg", quality: 92 });
  }
  await navigateur.close();
  console.log(`${slides.length} visuels générés`);
})();
