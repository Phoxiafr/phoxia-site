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
const TOTAL = 9;
const num = (n) => `<div class="num">${String(n).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}</div>`;

// Composants réutilisés dans le carrousel et dans la vidéo.
const puces = (items, taille = 34) => `<ul style="list-style:none;display:flex;flex-direction:column;gap:${taille * 0.6}px">
  ${items.map((t) => `<li style="display:flex;gap:22px;align-items:baseline;font-size:${taille}px;line-height:1.35;color:var(--sable)">
    <span style="flex:none;width:12px;height:12px;background:var(--azur-clair);transform:rotate(45deg) translateY(-4px)"></span><span>${t}</span></li>`).join('')}</ul>`;

const villes = (h) => `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
  ${[['royaume-uni', 'Londres'], ['espagne', 'Madrid'], ['italie', 'Rome'], ['emirats-arabes-unis', 'Dubaï']].map(([f, v]) => `
  <div style="position:relative;height:${h}px;border-radius:14px;overflow:hidden">
    <img src="${img(`assets/img/univers/pays/${f}.jpg`)}" style="width:100%;height:100%;object-fit:cover">
    <span style="position:absolute;left:0;right:0;bottom:0;padding:40px 14px 14px;background:linear-gradient(transparent,rgba(20,33,61,.9));font-size:26px;font-weight:600;color:var(--blanc)">${v}</span>
  </div>`).join('')}</div>`;

const navigateur = (e = 1) => `<div style="border-radius:${18 * e}px;overflow:hidden;background:var(--blanc);color:var(--encre);box-shadow:0 30px 80px rgba(0,0,0,.45)">
  <div style="display:flex;align-items:center;gap:${10 * e}px;padding:${16 * e}px ${22 * e}px;background:#E4E1D8">
    ${['#E0625A', '#E4B64C', '#62B36B'].map((c) => `<span style="width:${14 * e}px;height:${14 * e}px;border-radius:50%;background:${c}"></span>`).join('')}
    <span style="margin-left:${14 * e}px;flex:1;padding:${8 * e}px ${18 * e}px;border-radius:999px;background:var(--blanc);font-size:${20 * e}px;color:var(--encre-doux,#4A566E)">votre-marque.com/en</span>
  </div>
  <div style="display:flex;gap:${10 * e}px;padding:${20 * e}px ${22 * e}px 0">
    ${['FR', 'EN', 'ES', 'IT', 'DE'].map((l, i) => `<span style="padding:${6 * e}px ${16 * e}px;border-radius:999px;font-size:${20 * e}px;font-weight:600;${i === 1 ? 'background:var(--azur);color:#fff' : 'border:2px solid #D5D1C6;color:#4A566E'}">${l}</span>`).join('')}
  </div>
  <div style="display:flex;gap:${24 * e}px;padding:${22 * e}px">
    <img src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="width:${190 * e}px;height:${230 * e}px;object-fit:cover;border-radius:${10 * e}px">
    <div style="display:flex;flex-direction:column;gap:${10 * e}px;justify-content:center">
      <span style="font-family:var(--serif);font-size:${40 * e}px;line-height:1">Tuxedo jacket</span>
      <span style="font-size:${24 * e}px;color:#4A566E">Slim fit · Italian wool</span>
      <span style="font-size:${30 * e}px;font-weight:600">£250 · $320 · 290 €</span>
      <span style="font-size:${20 * e}px;color:#4A566E">Size guide: EU 48 = UK 38 = US 38</span>
      <span style="align-self:flex-start;margin-top:${6 * e}px;padding:${10 * e}px ${22 * e}px;border-radius:999px;background:var(--encre);color:#fff;font-size:${22 * e}px;font-weight:600">Add to bag</span>
    </div>
  </div>
</div>`;

const bulle = (t, moi, e) => `<div style="align-self:${moi ? 'flex-end' : 'flex-start'};max-width:86%;padding:${16 * e}px ${22 * e}px;border-radius:${22 * e}px;${moi ? `border-bottom-right-radius:${6 * e}px;background:var(--azur);color:#fff` : `border-bottom-left-radius:${6 * e}px;background:var(--blanc);color:var(--encre)`};font-size:${27 * e}px;line-height:1.35">${t}</div>`;
const discussion = (e = 1) => `<div style="display:flex;flex-direction:column;gap:${14 * e}px;padding:${26 * e}px;border-radius:${26 * e}px;background:rgba(237,234,225,.08);border:2px solid rgba(237,234,225,.16)">
  <div style="display:flex;align-items:center;gap:${14 * e}px;margin-bottom:${6 * e}px">
    <img src="${LOGO}" style="width:${48 * e}px;height:${48 * e}px;border-radius:50%;clip-path:circle(46%)">
    <span style="font-size:${24 * e}px;font-weight:600;color:var(--blanc)">Assistant de votre marque</span>
    <span style="margin-left:auto;font-size:${20 * e}px;color:#62D08A">● en ligne</span>
  </div>
  ${bulle('Je fais 1,80 m pour 75 kg, quelle taille pour la veste ?', true, e)}
  ${bulle('Je vous conseille le M pour une coupe ajustée, le L si vous la portez sur un pull.', false, e)}
  ${bulle('Do you ship to London?', true, e)}
  ${bulle('Yes! Delivery to the UK takes 3 to 5 days, tracking included.', false, e)}
</div>`;

const tuiles = [
  ['Contenus', 'Photos, vidéos, carrousels, légendes'],
  ['International', 'Marchés, prospection, traduction'],
  ['Site web', 'Multilingue et référencé pays par pays'],
  ['Service client', 'Assistant qui répond 24 h/24'],
  ['Automatisation', 'Commandes, stocks, reporting'],
  ['Stratégie', 'Feuille de route et formation'],
];
const grille = (e = 1) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${18 * e}px">
  ${tuiles.map(([t, d], i) => `<div style="padding:${28 * e}px ${26 * e}px;border-radius:${18 * e}px;background:rgba(237,234,225,.07);border:2px solid rgba(237,234,225,.14)">
    <span style="font-family:var(--serif);font-style:italic;font-size:${34 * e}px;color:var(--azur-clair)">0${i + 1}</span>
    <p style="margin-top:${8 * e}px;font-size:${34 * e}px;font-weight:600;color:var(--blanc)">${t}</p>
    <p style="margin-top:${6 * e}px;font-size:${25 * e}px;line-height:1.35;color:var(--sable)">${d}</p></div>`).join('')}</div>`;

const slides = [
  // 1. Couverture
  `<img class="photo" src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="object-position:50% 0%">
   <div class="scrim"></div>
   <div class="slide" style="justify-content:flex-end;padding-bottom:170px">
     <p class="kicker">Phoxia × Mode</p>
     <h1 style="margin-top:28px;font-size:98px">Votre marque de vêtements, <em>propulsée par l'IA.</em></h1>
     <p class="lead" style="margin-top:26px;font-size:32px">Photos, vidéos, export, site multilingue, assistant client.</p>
     <p class="swipe" style="margin-top:36px">Glissez pour voir →</p>
   </div>${brand}${num(1)}`,

  // 2. Photos
  `<div class="slide">
     <p class="kicker">01 · Photos</p>
     <h2 style="margin-top:24px">Des photos <em>sans shooting.</em></h2>
     <p class="lead" style="margin-top:28px">Une photo de vos pièces suffit. Même tenue, même tissu, les décors changent à l'infini.</p>
     <div style="margin-top:44px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
       <img src="${img('assets/img/bond/mathieu-db5-photo.jpg')}" style="grid-column:1/3;width:100%;height:370px;object-fit:cover;border-radius:16px">
       <img src="${img('assets/img/bond/mathieu-bar-casino.jpg')}" style="width:100%;height:240px;object-fit:cover;border-radius:16px">
       <img src="${img('assets/img/bond/mathieu-salon-db5.jpg')}" style="width:100%;height:240px;object-fit:cover;border-radius:16px">
     </div>
   </div>${brand}${num(2)}`,

  // 3. Vidéo
  `<div class="slide" style="flex-direction:row;gap:56px;align-items:center;padding-top:0;padding-bottom:120px">
     <div style="flex:1">
       <p class="kicker">02 · Vidéo</p>
       <h2 style="margin-top:24px;font-size:78px">Vos photos <em>deviennent vidéos.</em></h2>
       <p class="lead" style="margin-top:28px;font-size:33px">Des formats verticaux prêts pour les Reels, les Stories, Snapchat et TikTok.</p>
     </div>
     <div style="width:380px;height:760px;border-radius:52px;border:10px solid #0B1426;box-shadow:0 0 0 2px rgba(237,234,225,.25),0 40px 90px rgba(0,0,0,.5);overflow:hidden;position:relative;flex:none">
       <img src="${img('assets/img/bond/mathieu-db5-studio.jpg')}" style="position:absolute;height:100%;left:50%;transform:translateX(-50%)">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,0) 55%,rgba(20,33,61,.85))"></div>
       <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:rgba(252,251,249,.9);display:flex;align-items:center;justify-content:center">
         <div style="width:0;height:0;border-left:40px solid var(--encre);border-top:26px solid transparent;border-bottom:26px solid transparent;margin-left:10px"></div>
       </div>
       <div style="position:absolute;left:26px;right:26px;bottom:30px;height:6px;border-radius:3px;background:rgba(237,234,225,.3)"><div style="width:40%;height:100%;border-radius:3px;background:var(--azur-clair)"></div></div>
     </div>
   </div>${brand}${num(3)}`,

  // 4. International
  `<div class="slide">
     <p class="kicker">03 · Développement international</p>
     <h2 style="margin-top:24px">Vendez <em>au-delà des frontières.</em></h2>
     <div style="margin-top:40px">${villes(250)}</div>
     <div style="margin-top:44px">${puces([
       'Choisir vos marchés sur des données, pas sur une intuition',
       'Des agents IA qui repèrent boutiques, distributeurs et acheteurs',
       'Prospection rédigée en français, anglais et espagnol',
       'Une équipe de vente internationale à vos côtés',
     ], 32)}</div>
   </div>${brand}${num(4)}`,

  // 5. Site localisé
  `<div class="slide">
     <p class="kicker">04 · Site web localisé</p>
     <h2 style="margin-top:24px">Votre boutique <em>dans la langue de vos clients.</em></h2>
     <div style="margin-top:40px">${navigateur(1)}</div>
     <div style="margin-top:40px">${puces([
       'Fiches produits traduites et adaptées à chaque culture',
       'Guides des tailles EU, UK, US et prix en devise locale',
       'Référencement Google pays par pays',
     ], 31)}</div>
   </div>${brand}${num(5)}`,

  // 6. Assistant et application
  `<div class="slide">
     <p class="kicker">05 · Assistant et application</p>
     <h2 style="margin-top:24px">Il répond à vos clients, <em>jour et nuit.</em></h2>
     <div style="margin-top:40px">${discussion(1)}</div>
     <p class="lead" style="margin-top:36px;font-size:31px">Tailles, livraison, retours, stock : dans la langue du client, sur votre site, sur Instagram ou dans une application sur mesure.</p>
   </div>${brand}${num(6)}`,

  // 7. Toute l'IA
  `<div class="slide">
     <p class="kicker">06 · Toute l'IA pour votre marque</p>
     <h2 style="margin-top:24px">Un seul partenaire, <em>toute l'IA.</em></h2>
     <p class="lead" style="margin-top:22px;font-size:31px">Avec les meilleurs modèles d'IA du marché, dont Claude.</p>
     <div style="margin-top:40px">${grille(1)}</div>
   </div>${brand}${num(7)}`,

  // 8. Méthode
  `<div class="slide">
     <p class="kicker">Comment ça marche</p>
     <h2 style="margin-top:24px">Trois étapes, <em>un cap clair.</em></h2>
     <ol style="list-style:none;margin:40px 0 100px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly">
       ${[
         ['Un échange de 30 minutes', 'On repère ce qui fera gagner le plus à votre marque.'],
         ['Un périmètre défini', 'Fixé avant de commencer, jamais en cours de route.'],
         ['Déploiement et formation', 'Vos équipes gardent la main sur les outils.'],
       ].map(([t, d], i) => `<li style="display:flex;gap:36px;align-items:flex-start">
         <span style="flex:none;font-family:var(--serif);font-style:italic;font-size:110px;line-height:.8;color:var(--azur-clair)">${i + 1}</span>
         <span><strong style="font-size:46px;font-weight:600;color:var(--blanc)">${t}</strong><br><span style="font-size:35px;line-height:1.45;color:var(--sable)">${d}</span></span></li>`).join('')}
     </ol>
   </div>${brand}${num(8)}`,

  // 9. Appel à l'action
  `<img class="photo" src="${img('assets/img/bond/mathieu-bond-portrait.jpg')}" style="object-position:50% 100%;opacity:.3">
   <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,.4),var(--encre) 80%)"></div>
   <div class="slide" style="justify-content:center;align-items:center;text-align:center">
     <img src="${LOGO}" style="width:150px;height:150px;border-radius:50%;clip-path:circle(46%)">
     <h2 style="margin-top:48px;font-size:92px">Faites prendre le large <em>à votre marque.</em></h2>
     <p class="lead" style="margin-top:36px">30 minutes pour voir ce que l'IA peut faire pour vos collections, vos ventes et vos clients.</p>
     <p style="margin-top:56px;padding:22px 44px;border-radius:999px;background:var(--azur);color:var(--blanc);font-size:36px;font-weight:600;letter-spacing:.02em">phoxia.fr</p>
     <p style="margin-top:28px;font-size:30px;color:var(--sable)">Français · English · Español</p>
   </div>${num(9)}`,
];

// Calques de la vidéo 1080 x 1920 : texte sur photo (fond transparent) ou carte pleine.
const logoHaut = `<div style="position:absolute;left:80px;top:110px;display:flex;align-items:center;gap:16px;font-family:var(--serif);font-style:italic;font-size:44px;color:var(--blanc);text-shadow:0 2px 12px rgba(0,0,0,.5)"><img src="${LOGO}" style="width:64px;height:64px;border-radius:50%;clip-path:circle(46%)">Phoxia</div>`;
const V = (inner) => `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,33,61,0) 48%,rgba(20,33,61,.9) 80%,rgba(20,33,61,.96))"></div>
  <div style="position:absolute;left:80px;right:80px;bottom:250px">${inner}</div>${logoHaut}`;
const carte = (kicker, titre, contenu) => `<div style="position:absolute;inset:0;background:var(--encre)"></div>${logoHaut}
  <div style="position:absolute;left:80px;right:80px;top:220px;bottom:160px;display:flex;flex-direction:column;justify-content:center">
    <p class="kicker" style="font-size:30px">${kicker}</p>
    <h1 style="margin-top:24px;font-size:96px">${titre}</h1>
    <div style="margin-top:70px">${contenu}</div>
  </div>`;
const overlays = [
  V(`<p class="kicker" style="font-size:30px">Phoxia × Mode</p><h1 style="margin-top:22px;font-size:104px">Votre marque, <em>propulsée par l'IA.</em></h1>`),
  V(`<p class="kicker" style="font-size:30px">01 · Photos</p><h1 style="margin-top:22px;font-size:100px">Même tenue. <em>Décors infinis.</em></h1>`),
  V(`<p class="kicker" style="font-size:30px">02 · Vidéo</p><h1 style="margin-top:22px;font-size:100px">Vos photos <em>en vidéo.</em></h1>`),
  V(`<p class="kicker" style="font-size:30px">03 · International</p><h1 style="margin-top:22px;font-size:100px">Vendez à Londres…</h1>`),
  V(`<h1 style="font-size:100px">… et jusqu'à <em>Dubaï.</em></h1><p class="lead" style="margin-top:22px;font-size:40px">Marchés, acheteurs, prospection en français, anglais et espagnol.</p>`),
  carte('04 · Site web localisé', 'Votre boutique <em>dans leur langue.</em>', navigateur(1.4)),
  carte('05 · Assistant client', 'Il répond <em>jour et nuit.</em>', discussion(1.3)),
  carte("06 · Toute l'IA", 'Un partenaire, <em>toute l\'IA.</em>', grille(1.2)),
  `<div style="position:absolute;inset:0;background:var(--encre)"></div>
   <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px">
     <img src="${LOGO}" style="width:190px;height:190px;border-radius:50%;clip-path:circle(46%)">
     <h1 style="margin-top:60px;font-size:104px">Faites prendre le large <em>à votre marque.</em></h1>
     <p class="lead" style="margin-top:36px;font-size:42px">Photos, vidéos, export, site multilingue, assistant client.</p>
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
