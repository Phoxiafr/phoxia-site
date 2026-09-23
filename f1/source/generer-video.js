// Rend la vidéo « Phoxia Aston Martin F1 Team » image par image, puis l'encode en MP4 (H.264 + AAC).
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.NODE_PATH_PW);
const G = require('./generer-livree.js');

const OUT = process.argv[2];
const AUDIO = process.argv[3];
const FFMPEG = process.env.FFMPEG;
const FPS = 30, DUREE = 24, W = 1920, H = 1080;
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null; // aperçus

const { C } = G;
const symboleSVG = (h) => `<svg viewBox="0 0 139.03 102.15" height="${h}" style="overflow:visible">
  <path class="p1" fill="${C.ciel}" d="M0 102.15h34.05L53.91 68.1H19.86z"/>
  <path class="p2" fill="${C.azur}" d="M42.56 68.1h34.05l19.86-34.05H62.42z"/>
  <path class="p3" fill="${C.sable}" d="M85.12 34.05h34.05L139.03 0h-34.05z"/></svg>`;

const partenaires = [
  ['Monster Energy', 'Partenaire titre'], ['Claude', 'Intelligence artificielle'],
  ['Apple', 'Technologie'], ['Yamaha', 'Moteur et performance'],
  ['Ducati', 'Ingénierie'], ['Uniqlo', 'Équipementier officiel'],
  ['Decathlon', 'Sport et préparation'], ['Aston Martin', 'Constructeur'],
];

const labels = {
  front: [['Decathlon', 'Sport et préparation'], ['Claude', 'Intelligence artificielle']],
  side: [['Phoxia', 'Écurie'], ['Apple', 'Technologie'], ['Uniqlo', 'Équipementier officiel'], ['Aston Martin', 'Constructeur']],
  rear: [['Monster Energy', 'Partenaire titre'], ['Yamaha', 'Moteur et performance'], ['Ducati', 'Ingénierie']],
};
const labelRow = (k) => `<div class="row" id="lab-${k}">${labels[k].map(([n, r]) =>
  `<div class="lab"><span class="role">${r}</span><span class="nom">${n}</span></div>`).join('')}</div>`;

const svgScene = `<svg id="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 1000 1600 900" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
  ${G.defs}
  <defs>
    <filter id="mblur" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur id="mblurStd" stdDeviation="0 0"/></filter>
    <filter id="toWhite"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
    <mask id="carMask" maskUnits="userSpaceOnUse" x="-100" y="0" width="1600" height="600"><use href="#car" filter="url(#toWhite)"/></mask>
    <linearGradient id="sheenGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${G.scene()}
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#000}
  #stage{position:relative;width:${W}px;height:${H}px;overflow:hidden}
  #scene{position:absolute;inset:0}
  .card{position:absolute;inset:0;background:${C.encre};color:${C.sable}}
  .card::before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 45%,rgba(28,107,168,.16) 45%,rgba(28,107,168,.16) 62%,transparent 62%)}
  .kicker{font-family:"Barlow Condensed";font-weight:600;letter-spacing:.3em;color:${C.ciel};text-transform:uppercase}
  .serif{font-family:"EB Garamond";font-weight:500;line-height:.95}
  .f1{font-family:"Barlow Condensed";font-weight:800;font-style:italic;color:${C.ciel};letter-spacing:.04em}
  .bar{height:6px;background:${C.or}}
  #intro .inner{position:absolute;left:170px;top:190px}
  #intro .kicker{font-size:30px;margin-top:56px}
  #intro .serif{font-size:156px;margin-top:22px}
  #intro .f1{font-size:118px;margin-top:6px}
  .reveal{display:inline-block}
  #shade{position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(to top,rgba(8,14,28,.82),rgba(8,14,28,0))}
  .row{position:absolute;left:120px;right:120px;bottom:96px;display:flex;gap:70px}
  .lab{border-left:5px solid ${C.ciel};padding-left:22px;display:flex;flex-direction:column}
  .role{font-family:"Barlow Condensed";font-weight:600;font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:${C.ciel}}
  .nom{font-family:"Instrument Sans";font-weight:600;font-size:54px;color:${C.sable};line-height:1.1}
  #bug{position:absolute;left:64px;top:52px;display:flex;align-items:center;gap:18px;color:${C.sable};font-family:"Instrument Sans";font-weight:600;font-size:22px;letter-spacing:.24em;text-shadow:0 1px 8px rgba(0,0,0,.35)}
  #end .inner{position:absolute;left:170px;top:210px;right:170px}
  #end .serif{font-size:120px;margin-top:40px}
  #end .f1{font-size:84px}
  #end .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:34px 40px;margin-top:64px}
  #end .p{border-top:2px solid rgba(237,234,225,.2);padding-top:16px}
  #end .p b{display:block;font-family:"Instrument Sans";font-weight:600;font-size:36px}
  #end .p i{font-style:normal;font-family:"Instrument Sans";font-size:20px;color:${C.ciel}}
  #end .legal{position:absolute;left:170px;bottom:52px;font-family:"Instrument Sans";font-size:18px;color:rgba(237,234,225,.5)}
  #fade{position:absolute;inset:0;background:#000;opacity:0}
</style></head><body><div id="stage">
  ${svgScene}
  <div id="shade"></div>
  ${labelRow('front')}${labelRow('side')}${labelRow('rear')}
  <div id="bug">${symboleSVG(30)}<span>PHOXIA ASTON MARTIN F1 TEAM</span></div>
  <div class="card" id="intro"><div class="inner">
    <div id="i-sym">${symboleSVG(120)}</div>
    <div class="kicker" id="i-kick">Concept livrée · Saison 2027</div>
    <div class="serif"><span class="reveal" id="i-t1">Phoxia Aston Martin</span></div>
    <div class="f1"><span class="reveal" id="i-t2">F1 TEAM</span></div>
    <div class="bar" id="i-bar" style="width:180px;margin-top:30px"></div>
  </div></div>
  <div class="card" id="end"><div class="inner">
    <div id="e-sym">${symboleSVG(84)}</div>
    <div class="serif" id="e-t1">Phoxia Aston Martin <span class="f1" id="e-t2">F1 TEAM</span></div>
    <div class="grid">${partenaires.map(([n, r]) => `<div class="p"><b>${n}</b><i>${r}</i></div>`).join('')}</div>
  </div><div class="legal" id="e-legal">Création conceptuelle Phoxia. Marques citées à titre illustratif, sans partenariat officiel.</div></div>
  <div id="fade"></div>
</div>
<script>
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo4 = x => 1 - Math.pow(1 - x, 4);
const eo3 = x => 1 - Math.pow(1 - x, 3);
const ei3 = x => x * x * x;
const mix = (a, b, k) => a + (b - a) * k;

// ---- caméra : images clés (x, y, largeur, hauteur) en unités de scène, toutes en 16:9
const K = [
  [0, [0, 1080, 1600, 900]], [3.0, [0, 1080, 1600, 900]], [7.2, [60, 1110, 1480, 832.5]],
  [8.3, [0, 1500, 700, 393.75]], [10.3, [20, 1506, 672, 378]],
  [11.4, [380, 1410, 924, 519.75]], [13.8, [410, 1418, 880, 495]],
  [14.9, [640, 1380, 960, 540]], [16.9, [660, 1386, 940, 528.75]],
  [18.0, [0, 1080, 1600, 900]], [24, [0, 1080, 1600, 900]],
];
function cam(t) {
  for (let i = 0; i < K.length - 1; i++) {
    const [t0, a] = K[i], [t1, b] = K[i + 1];
    if (t <= t1) { const k = eio(lin(t, t0, t1)); return a.map((v, j) => mix(v, b[j], k)); }
  }
  return K[K.length - 1][1];
}

// ---- position de la monoplace (décalage horizontal, unités de scène)
function carX(t) {
  if (t < 2.85) return 2100;
  if (t < 6.3) return 2100 * (1 - eo4(lin(t, 2.85, 6.3)));
  if (t < 18.3) return 0;
  return -2600 * ei3(lin(t, 18.3, 19.9));
}

const $ = id => document.getElementById(id);
const roues = [...document.querySelectorAll('#carBody .roue')];
const S = ${G.CAR_S};
function show(el, o, dy = 0, dx = 0) { el.style.opacity = o; el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
function wipe(el, k) { el.style.clipPath = 'inset(-20% ' + (100 - k * 100) + '% -20% 0)'; }

// reflet lumineux balayant la carrosserie
const ns = 'http://www.w3.org/2000/svg';
const g = document.createElementNS(ns, 'g'); g.setAttribute('mask', 'url(#carMask)');
const sheen = document.createElementNS(ns, 'rect');
sheen.setAttribute('y', 100); sheen.setAttribute('width', 260); sheen.setAttribute('height', 420);
sheen.setAttribute('fill', 'url(#sheenGrad)');
g.appendChild(sheen); $('carBody').appendChild(g);

window.render = function (t, frame) {
  // caméra + léger tremblement à haute vitesse
  const dx = carX(t), v = (carX(t + 1 / 60) - carX(t - 1 / 60)) * 30;
  const sp = Math.abs(v);
  const shake = Math.min(sp / 2500, 1) * 3;
  const c = cam(t);
  $('scene').setAttribute('viewBox', (c[0] + Math.sin(t * 37) * shake) + ' ' + (c[1] + Math.cos(t * 29) * shake) + ' ' + c[2] + ' ' + c[3]);

  // voiture : translation, roues, flou de bougé, tangage au freinage
  $('carRig').setAttribute('transform', 'translate(' + dx + ' 0)');
  for (const r of roues) {
    const a = dx / (r.dataset.r * S) * 180 / Math.PI;
    r.setAttribute('transform', 'rotate(' + a + ' ' + r.dataset.cx + ' ' + r.dataset.cy + ')');
  }
  if (sp > 40) { $('carRig').setAttribute('filter', 'url(#mblur)'); $('mblurStd').setAttribute('stdDeviation', Math.min(sp * 0.011, 34) + ' 0'); }
  else $('carRig').removeAttribute('filter');
  const acc = (carX(t + 1 / 30) - 2 * dx + carX(t - 1 / 30)) * 900;
  $('car').setAttribute('transform', 'rotate(' + clamp(acc / 3000, -1, 1) * -0.9 + ' 700 470)');
  sheen.setAttribute('x', mix(-400, 1600, eio(lin(t, 6.2, 7.4))));
  sheen.setAttribute('transform', 'skewX(-24)');
  $('grainNoise').setAttribute('seed', frame % 12);

  // intro
  const io = lin(t, 2.55, 3.25);
  $('intro').style.clipPath = 'polygon(0 0,' + (100 - io * 130) + '% 0,' + (100 - io * 130 - 25) + '% 100%,0 100%)';
  $('intro').style.display = io >= 1 ? 'none' : 'block';
  document.querySelectorAll('#i-sym path').forEach((p, i) => {
    const k = eo3(lin(t, 0.15 + i * 0.16, 0.65 + i * 0.16));
    p.style.opacity = k; p.style.transform = 'translate(' + (-60 * (1 - k)) + 'px,0)';
  });
  show($('i-kick'), eo3(lin(t, 0.7, 1.2)), 16 * (1 - eo3(lin(t, 0.7, 1.2))));
  wipe($('i-t1'), eo3(lin(t, 0.95, 1.75)));
  wipe($('i-t2'), eo3(lin(t, 1.4, 1.95)));
  $('i-bar').style.width = 180 * eo3(lin(t, 1.7, 2.3)) + 'px';

  // bandeau d'équipe discret pendant la scène
  const bug = lin(t, 3.6, 4.2) * (1 - lin(t, 18.9, 19.4));
  show($('bug'), bug, 0, -20 * (1 - bug));

  // étiquettes partenaires
  const seg = { front: [8.1, 10.35], side: [11.2, 13.85], rear: [14.7, 16.95] };
  let shade = 0;
  for (const k in seg) {
    const [a, b] = seg[k];
    const row = $('lab-' + k); const kids = [...row.children];
    kids.forEach((el, i) => {
      const kin = eo3(lin(t, a + i * 0.14, a + 0.5 + i * 0.14));
      const kout = lin(t, b - 0.35, b);
      show(el, kin * (1 - kout), 30 * (1 - kin));
    });
    shade = Math.max(shade, lin(t, a - 0.2, a + 0.3) * (1 - lin(t, b - 0.2, b + 0.2)));
    row.style.display = t > a - 0.1 && t < b + 0.1 ? 'flex' : 'none';
  }
  $('shade').style.opacity = shade;

  // carte de fin
  const eo = lin(t, 19.3, 19.9);
  $('end').style.display = eo > 0 ? 'block' : 'none';
  $('end').style.clipPath = 'polygon(0 0,' + (eo * 130) + '% 0,' + (eo * 130 - 25) + '% 100%,0 100%)';
  document.querySelectorAll('#e-sym path').forEach((p, i) => {
    const k = eo3(lin(t, 19.8 + i * 0.12, 20.3 + i * 0.12));
    p.style.opacity = k; p.style.transform = 'translate(' + (-50 * (1 - k)) + 'px,0)';
  });
  wipe($('e-t1'), eo3(lin(t, 20.0, 20.8)));
  document.querySelectorAll('#end .p').forEach((p, i) => {
    const k = eo3(lin(t, 20.7 + i * 0.1, 21.2 + i * 0.1));
    show(p, k, 24 * (1 - k));
  });
  show($('e-legal'), lin(t, 21.8, 22.4));
  $('fade').style.opacity = lin(t, 23.3, 24);
};
</script></body></html>`;

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const total = FPS * DUREE;

  if (ONLY) {
    for (const s of ONLY) {
      await page.evaluate(([t, f]) => window.render(t, f), [s, Math.round(s * FPS)]);
      await page.screenshot({ path: `${OUT}-${String(s).replace('.', '_')}.jpg`, type: 'jpeg', quality: 85 });
    }
    await browser.close();
    return;
  }

  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', AUDIO, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(([t, fr]) => window.render(t, fr), [f / FPS, f]);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`image ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('terminé', OUT);
})();
