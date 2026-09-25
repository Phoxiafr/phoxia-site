// Génère le carrousel (1080 x 1350), le PDF LinkedIn et les calques texte de la vidéo (1080 x 1920).
// Lancement : node build.mjs (Playwright installé en global ou en local)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(resolve(execSync('npm root -g').toString().trim(), 'playwright'))); }

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const img = (p) => pathToFileURL(resolve(root, p)).href;
const out = resolve(here, '..');
const LOGO = img('assets/img/univers/logos/phoxia.png');
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Instrument+Sans:wght@400;500;600&display=swap">';
const brand = `<div class="brand"><img src="${LOGO}" alt="">Phoxia</div>`;
const TOTAL = 7;
const num = (n) => `<div class="num">${String(n).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}</div>`;

const slides = [
  // 1. Couverture
  `<img class="photo" src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="object-position:50% 0%">
   <div class="scrim"></div>
   <div class="slide" style="justify-content:flex-end;padding-bottom:170px">
     <p class="kicker">Phoxia × Mode</p>
     <h1 style="margin-top:28px">Une photo de vos vêtements.<br><em>Toute une campagne.</em></h1>
     <p class="swipe" style="margin-top:44px">Glissez pour voir →</p>
   </div>${brand}${num(1)}`,

  // 2. Le point de départ
  `<div class="slide">
     <p class="kicker">Étape 1</p>
     <h2 style="margin-top:24px">Au départ, <em>une seule photo.</em></h2>
     <p class="lead" style="margin-top:28px">Un portrait, une tenue. Pas de décor, pas de mannequin à réserver, pas de lieu à louer.</p>
     <div style="margin-top:52px;flex:1;display:flex;justify-content:center">
       <img src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="height:640px;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45)">
     </div>
   </div>${brand}${num(2)}`,

  // 3. Mise en scène
  `<div class="slide">
     <p class="kicker">Étape 2</p>
     <h2 style="margin-top:24px">Phoxia la met <em>en scène.</em></h2>
     <p class="lead" style="margin-top:28px">Même tenue, même coupe, même tissu. Les décors changent à l'infini.</p>
     <div style="margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
       <img src="${img('assets/img/bond/mathieu-db5-photo.jpg')}" style="grid-column:1/3;width:100%;height:380px;object-fit:cover;border-radius:16px">
       <img src="${img('assets/img/bond/mathieu-bar-casino.jpg')}" style="width:100%;height:250px;object-fit:cover;border-radius:16px">
       <img src="${img('assets/img/bond/mathieu-salon-db5.jpg')}" style="width:100%;height:250px;object-fit:cover;border-radius:16px">
     </div>
   </div>${brand}${num(3)}`,

  // 4. Photo en vidéo
  `<div class="slide" style="flex-direction:row;gap:56px;align-items:center;padding-top:0;padding-bottom:120px">
     <div style="flex:1">
       <p class="kicker">Étape 3</p>
       <h2 style="margin-top:24px;font-size:78px">Puis la photo <em>devient vidéo.</em></h2>
       <p class="lead" style="margin-top:28px;font-size:33px">Un format vertical de 15 secondes, prêt pour les Reels, les Stories et Snapchat.</p>
     </div>
     <div style="width:380px;height:760px;border-radius:52px;border:10px solid #0B1426;box-shadow:0 0 0 2px rgba(237,234,225,.25),0 40px 90px rgba(0,0,0,.5);overflow:hidden;position:relative;flex:none">
       <img src="${img('assets/img/bond/mathieu-db5-studio.jpg')}" style="position:absolute;height:100%;left:50%;transform:translateX(-50%)">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,0) 55%,rgba(20,33,61,.85))"></div>
       <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:rgba(252,251,249,.9);display:flex;align-items:center;justify-content:center">
         <div style="width:0;height:0;border-left:40px solid var(--encre);border-top:26px solid transparent;border-bottom:26px solid transparent;margin-left:10px"></div>
       </div>
       <div style="position:absolute;left:26px;right:26px;bottom:30px;height:6px;border-radius:3px;background:rgba(237,234,225,.3)"><div style="width:40%;height:100%;border-radius:3px;background:var(--azur-clair)"></div></div>
     </div>
   </div>${brand}${num(4)}`,

  // 5. Offre
  `<div class="slide">
     <p class="kicker">Pour les marques de vêtements</p>
     <h2 style="margin-top:24px">Ce que Phoxia <em>fait pour vous.</em></h2>
     <ul style="list-style:none;margin:40px 0 90px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly">
       ${[
         ['Shooting IA', 'Vos pièces portées, dans le décor de votre choix.'],
         ['Photo en vidéo', 'Vos visuels animés pour Reels, Stories et Snapchat.'],
         ['Carrousels et posts', 'Instagram et LinkedIn, aux couleurs de votre marque.'],
         ['Légendes et hashtags', 'Rédigés pour chaque réseau, prêts à copier.'],
         ['Fiches produits', 'Visuels et textes pour votre boutique en ligne.'],
       ].map(([t, d]) => `<li style="display:flex;gap:26px;align-items:baseline">
         <span style="flex:none;width:14px;height:14px;background:var(--azur-clair);transform:rotate(45deg) translateY(-4px)"></span>
         <span><strong style="font-size:42px;font-weight:600;color:var(--blanc)">${t}</strong><br><span style="font-size:34px;line-height:1.4;color:var(--sable)">${d}</span></span></li>`).join('')}
     </ul>
   </div>${brand}${num(5)}`,

  // 6. Méthode
  `<div class="slide">
     <p class="kicker">Comment ça marche</p>
     <h2 style="margin-top:24px">Trois étapes, <em>zéro shooting.</em></h2>
     <ol style="list-style:none;margin:40px 0 100px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly">
       ${[
         ['Vous envoyez vos photos', 'Une photo par pièce suffit, même prise au téléphone.'],
         ['Nous créons la campagne', 'Visuels, vidéos, carrousels et légendes.'],
         ['Vous publiez partout', 'Instagram, Snapchat, LinkedIn et votre site.'],
       ].map(([t, d], i) => `<li style="display:flex;gap:36px;align-items:flex-start">
         <span style="flex:none;font-family:var(--serif);font-style:italic;font-size:110px;line-height:.8;color:var(--azur-clair)">${i + 1}</span>
         <span><strong style="font-size:46px;font-weight:600;color:var(--blanc)">${t}</strong><br><span style="font-size:35px;line-height:1.45;color:var(--sable)">${d}</span></span></li>`).join('')}
     </ol>
   </div>${brand}${num(6)}`,

  // 7. Appel à l'action
  `<img class="photo" src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="object-position:50% 100%;opacity:.3">
   <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,.4),var(--encre) 80%)"></div>
   <div class="slide" style="justify-content:center;align-items:center;text-align:center">
     <img src="${LOGO}" style="width:150px;height:150px;border-radius:50%;clip-path:circle(46%)">
     <h2 style="margin-top:48px;font-size:92px">Votre collection mérite <em>sa campagne.</em></h2>
     <p class="lead" style="margin-top:36px">Réservez 30 minutes avec nous, on vous montre le résultat sur vos propres pièces.</p>
     <p style="margin-top:56px;padding:22px 44px;border-radius:999px;background:var(--azur);color:var(--blanc);font-size:36px;font-weight:600;letter-spacing:.02em">phoxia.fr</p>
     <p style="margin-top:28px;font-size:30px;color:var(--sable)">@phoxia.fr sur Instagram</p>
   </div>${num(7)}`,
];

// Calques texte de la vidéo, sur fond transparent.
const V = (inner) => `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,0) 52%,rgba(20,33,61,.9) 82%,rgba(20,33,61,.96))"></div>
  <div style="position:absolute;left:80px;right:80px;bottom:250px">${inner}</div>
  <div style="position:absolute;left:80px;top:110px;display:flex;align-items:center;gap:16px;font-family:var(--serif);font-style:italic;font-size:44px;color:var(--blanc);text-shadow:0 2px 12px rgba(0,0,0,.5)"><img src="${LOGO}" style="width:64px;height:64px;border-radius:50%;clip-path:circle(46%)">Phoxia</div>`;
const overlays = [
  V(`<p class="kicker" style="font-size:30px">Phoxia × Mode</p><h1 style="margin-top:22px;font-size:112px">Une seule <em>photo.</em></h1>`),
  V(`<h1 style="font-size:104px">Même tenue.</h1><p class="lead" style="margin-top:20px;font-size:42px">Un bar feutré.</p>`),
  V(`<h1 style="font-size:104px">Même tissu.</h1><p class="lead" style="margin-top:20px;font-size:42px">Un salon au coin du feu.</p>`),
  V(`<h1 style="font-size:104px"><em>Décors infinis.</em></h1><p class="lead" style="margin-top:20px;font-size:42px">Sans shooting, sans lieu à louer.</p>`),
  `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px">
     <img src="${LOGO}" style="width:190px;height:190px;border-radius:50%;clip-path:circle(46%)">
     <h1 style="margin-top:60px;font-size:108px">Vos vêtements, <em>en vidéo.</em></h1>
     <p class="lead" style="margin-top:36px;font-size:42px">Photos, vidéos et posts pour votre marque.</p>
     <p style="margin-top:70px;padding:26px 54px;border-radius:999px;background:var(--azur);color:var(--blanc);font-size:46px;font-weight:600">phoxia.fr</p>
   </div>`,
];

const page = (body, w, h, transparent) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<link rel="stylesheet" href="${pathToFileURL(resolve(here, 'styles.css')).href}">
<style>html,body{width:${w}px;height:${h}px}${transparent ? 'body{background:transparent}' : ''}</style></head><body>${body}</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
const p = await ctx.newPage();
const tmp = resolve(here, '.tmp.html');

mkdirSync(resolve(out, 'instagram-carrousel'), { recursive: true });
const pdfPages = [];
for (const [i, s] of slides.entries()) {
  writeFileSync(tmp, page(s, 1080, 1350));
  await p.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const file = resolve(out, 'instagram-carrousel', `${String(i + 1).padStart(2, '0')}-phoxia-mode.png`);
  await p.screenshot({ path: file });
  pdfPages.push(file);
}

mkdirSync(resolve(here, 'calques'), { recursive: true });
await p.setViewportSize({ width: 1080, height: 1920 });
for (const [i, o] of overlays.entries()) {
  writeFileSync(tmp, page(o, 1080, 1920, true));
  await p.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: resolve(here, 'calques', `${i + 1}.png`), omitBackground: true });
}

// PDF LinkedIn : une page par diapositive.
const pdfHtml = `<!doctype html><html><head><style>@page{size:1080px 1350px;margin:0}body{margin:0}img{display:block;width:1080px;height:1350px;page-break-after:always}</style></head><body>${pdfPages.map((f) => `<img src="${pathToFileURL(f).href}">`).join('')}</body></html>`;
writeFileSync(tmp, pdfHtml);
await p.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await p.pdf({ path: resolve(out, 'linkedin-carrousel-phoxia-mode.pdf'), width: '1080px', height: '1350px', printBackground: true });

await browser.close();
