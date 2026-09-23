// Génère la livrée « Phoxia Aston Martin F1 Team » en SVG puis rend les slides en PNG.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.NODE_PATH_PW);

const OUT = process.argv[2];
const FONTS = fs.readFileSync(path.join(__dirname, 'fonts/embed.css'), 'utf8');

const C = {
  encre: '#14213D', encreProfond: '#0B1428', azur: '#1C6BA8', ciel: '#5BA3DD',
  sable: '#EDEAE1', or: '#C9B98F', carbone: '#15171C',
};

// Générateur pseudo-aléatoire déterministe pour la skyline.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ------------------------------------------------------------------ */
/* Monoplace, coordonnées locales : longueur ~1360, sol à y = 470      */
/* ------------------------------------------------------------------ */
function wheel(cx, cy, r, id) {
  const rim = r * 0.6;
  let spokes = '';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const x1 = cx + Math.cos(a) * rim * 0.45, y1 = cy + Math.sin(a) * rim * 0.45;
    const x2 = cx + Math.cos(a + 0.18) * rim * 0.82, y2 = cy + Math.sin(a + 0.18) * rim * 0.82;
    spokes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.ciel}" stroke-width="${r * 0.045}" stroke-linecap="round"/>`;
  }
  const arcR = r * 0.83;
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tyre)"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 3}" fill="none" stroke="#2a2c31" stroke-width="3"/>
    <path id="${id}-arc" d="M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${cy}" fill="none"/>
    <text font-family="Barlow Condensed" font-weight="800" font-style="italic" font-size="${r * 0.2}" fill="${C.ciel}" letter-spacing="${r * 0.02}">
      <textPath href="#${id}-arc" startOffset="50%" text-anchor="middle">PHOXIA · RACE</textPath>
    </text>
    <path d="M ${cx - arcR} ${cy + 8} A ${arcR} ${arcR} 0 0 0 ${cx + arcR * 0.2} ${cy + arcR - 4}" fill="none" stroke="${C.ciel}" stroke-width="${r * 0.05}" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="${rim}" fill="url(#rim)"/>
    <circle cx="${cx}" cy="${cy}" r="${rim}" fill="none" stroke="#0c0d10" stroke-width="4"/>
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${rim * 0.28}" fill="#0a0b0d" stroke="#30333a" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tyreSheen)"/>
  </g>`;
}

// Symbole Phoxia : trois parallélogrammes, repris du logo.
function symbole(x, y, s, cols = [C.ciel, C.azur, C.sable]) {
  const t = (dx, dy) => `translate(${x + dx * s} ${y + dy * s})`;
  const p = 'M0 34.05h34.05L53.91 0H19.86z';
  return `<g>
    <path transform="${t(0, 68.1)} scale(${s})" d="${p}" fill="${cols[0]}"/>
    <path transform="${t(42.56, 34.05)} scale(${s})" d="${p}" fill="${cols[1]}"/>
    <path transform="${t(85.12, 0)} scale(${s})" d="${p}" fill="${cols[2]}"/>
  </g>`;
}

function car() {
  const body = 'M 395 334 C 470 302 560 290 640 286 L 790 283 C 800 252 812 222 830 205 L 874 205 C 905 216 962 246 1030 280 C 1080 305 1132 322 1188 332 L 1192 418 L 1100 442 L 420 442 C 408 412 402 380 395 334 Z';
  const sidepod = 'M 588 332 L 770 320 C 880 320 985 352 1100 402 L 1104 442 L 588 442 Z';
  return `
  <g id="car">
    <!-- éléments arrière-plan (côté opposé) -->
    <path d="M 1195 180 L 1345 172 L 1352 382 L 1240 392 Z" fill="#0d1526"/>
    <line x1="440" y1="352" x2="296" y2="352" stroke="#0e0f13" stroke-width="7"/>
    <line x1="440" y1="392" x2="296" y2="372" stroke="#0e0f13" stroke-width="7"/>
    <line x1="1060" y1="352" x2="1150" y2="350" stroke="#0e0f13" stroke-width="7"/>
    <line x1="1060" y1="400" x2="1150" y2="368" stroke="#0e0f13" stroke-width="7"/>

    <!-- aileron avant (plans) -->
    <path d="M 18 452 C 90 446 170 440 250 444 L 252 462 L 18 466 Z" fill="${C.encreProfond}"/>
    <path d="M 26 438 C 100 430 170 424 238 428 L 240 440 C 170 437 100 441 26 448 Z" fill="${C.azur}"/>
    <path d="M 40 424 C 105 414 165 410 225 413 L 226 423 C 165 421 105 426 40 434 Z" fill="${C.ciel}"/>

    <!-- nez -->
    <path d="M 36 424 C 120 408 250 368 400 332 L 422 388 C 300 402 160 430 56 442 Z" fill="${C.encre}"/>
    <path d="M 36 424 C 120 408 250 368 400 332 L 404 346 C 260 380 130 414 44 432 Z" fill="url(#topSheen)"/>

    <!-- carrosserie -->
    <path d="${body}" fill="url(#bodyGrad)"/>
    <path d="${sidepod}" fill="url(#podGrad)"/>
    <path d="M 588 332 L 612 331 L 612 400 L 588 402 Z" fill="#05080f"/>

    <!-- bande azur + filet sable, signature de la livrée -->
    <path d="M 404 396 C 480 386 560 380 640 380 L 1100 416 L 1101 430 L 640 396 C 560 396 480 402 410 412 Z" fill="${C.azur}"/>
    <path d="M 404 388 C 480 378 560 372 640 372 L 1100 408 L 1100 412 L 640 377 C 560 377 480 383 405 393 Z" fill="${C.or}"/>
    <path d="M 60 434 C 160 420 290 396 404 388 L 405 393 C 290 402 160 426 62 440 Z" fill="${C.or}"/>

    <!-- capot moteur : reflet, dérive -->
    <path d="M 640 286 L 790 283 C 800 252 812 222 830 205 L 874 205 C 905 216 962 246 1030 280 C 1080 305 1132 322 1188 332 L 1188 340 C 1100 334 1000 300 900 262 C 850 250 780 300 640 300 Z" fill="url(#topSheen)"/>
    <path d="M 874 206 L 1118 300 L 1118 316 L 874 234 Z" fill="${C.encreProfond}"/>
    <path d="M 874 206 L 1118 300 L 1118 304 L 874 211 Z" fill="${C.ciel}" opacity=".85"/>

    <!-- entrée d'air + caméra -->
    <path d="M 812 223 L 830 205 L 846 205 L 828 228 Z" fill="#04060b"/>
    <rect x="832" y="192" width="30" height="10" rx="3" fill="${C.ciel}"/>
    <rect x="845" y="186" width="4" height="8" fill="#0b0d12"/>

    <!-- cockpit, pilote, halo -->
    <path d="M 640 286 L 792 283 L 786 296 L 646 298 Z" fill="#04060b"/>
    <circle cx="738" cy="268" r="23" fill="${C.sable}"/>
    <path d="M 716 262 C 724 250 752 248 761 262 L 758 270 L 718 270 Z" fill="${C.encre}"/>
    <path d="M 722 262 L 758 262 L 756 268 L 722 268 Z" fill="#111" />
    <path d="M 716 274 L 760 274 L 758 280 L 717 280 Z" fill="${C.azur}"/>
    <path d="M 616 290 C 648 252 722 238 806 244 L 808 256 C 728 252 662 264 632 292 Z" fill="#1b1d22"/>
    <path d="M 644 266 L 656 262 L 648 290 L 638 290 Z" fill="#1b1d22"/>
    <path d="M 622 286 C 652 256 724 244 804 248" fill="none" stroke="${C.ciel}" stroke-width="2.5" opacity=".9"/>

    <!-- rétroviseur -->
    <line x1="578" y1="300" x2="590" y2="286" stroke="#0e0f13" stroke-width="4"/>
    <ellipse cx="572" cy="282" rx="17" ry="9" fill="${C.encre}" stroke="#0a0c12" stroke-width="2"/>

    <!-- fond plat, planche, diffuseur -->
    <path d="M 410 442 L 1110 442 L 1116 458 L 404 458 Z" fill="${C.carbone}"/>
    <path d="M 404 456 L 1116 456 L 1116 462 L 404 462 Z" fill="#0a0a0c"/>
    <path d="M 1188 398 L 1300 392 L 1312 452 L 1186 460 Z" fill="${C.carbone}"/>
    <rect x="1290" y="404" width="12" height="10" rx="2" fill="#ff3b3b" opacity=".9"/>

    <!-- aileron arrière -->
    <path d="M 1200 176 L 1350 166 L 1356 384 L 1246 394 L 1224 214 Z" fill="${C.encre}"/>
    <path d="M 1200 176 L 1350 166 L 1352 206 L 1204 214 Z" fill="${C.encreProfond}"/>
    <path d="M 1204 214 L 1352 206 L 1353 214 L 1206 222 Z" fill="${C.ciel}"/>
    <path d="M 1246 394 L 1356 384 L 1356 372 L 1244 382 Z" fill="${C.azur}"/>
    <path d="M 1206 150 L 1336 142 L 1338 172 L 1210 180 Z" fill="${C.encreProfond}"/>
    <path d="M 1208 154 L 1336 146 L 1336 150 L 1208 158 Z" fill="${C.ciel}" opacity=".8"/>
    <line x1="1180" y1="318" x2="1250" y2="210" stroke="#0e0f13" stroke-width="6"/>

    <!-- roues -->
    ${wheel(290, 365, 105, 'rf')}
    ${wheel(1150, 358, 112, 'rr')}

    <!-- dérive d'aileron avant (côté visible) -->
    <path d="M 14 380 L 118 386 L 124 468 L 10 468 Z" fill="${C.encre}"/>
    <path d="M 14 380 L 118 386 L 119 396 L 14 391 Z" fill="${C.ciel}"/>
    <path d="M 10 456 L 124 456 L 124 468 L 10 468 Z" fill="${C.azur}"/>

    <!-- ===== partenaires ===== -->
    <!-- Claude : nez -->
    <text x="0" y="0" transform="translate(126 420) rotate(-13.5)" font-family="EB Garamond" font-style="italic" font-weight="500" font-size="24" fill="${C.sable}">Claude</text>

    <!-- Decathlon : dérive avant -->
    <text x="67" y="430" text-anchor="middle" font-family="Barlow Condensed" font-weight="800" font-size="22" fill="${C.sable}" letter-spacing="0.5">DECATHLON</text>

    <!-- Apple : flanc du cockpit -->
    <text x="490" y="352" font-family="Instrument Sans" font-weight="600" font-size="22" fill="${C.sable}" transform="rotate(-6 490 352)">Apple</text>

    <!-- Phoxia : ponton -->
    ${symbole(640, 336, 0.3, [C.ciel, C.azur, C.sable])}
    <text x="690" y="366" font-family="Instrument Sans" font-weight="600" font-size="36" fill="${C.sable}" letter-spacing="7">PHOXIA</text>

    <!-- Uniqlo : bas du ponton -->
    <rect x="520" y="416" width="88" height="24" fill="${C.sable}" transform="skewX(-8)"/>
    <text x="459" y="435" font-family="Barlow Condensed" font-weight="800" font-size="22" fill="${C.encre}" letter-spacing="2">UNIQLO</text>

    <!-- Aston Martin : capot moteur -->
    <g transform="translate(900 268) rotate(24)">
      <path d="M -40 -6 C -20 -12 -6 -12 0 -4 C 6 -12 20 -12 40 -6 C 20 -8 8 -6 0 2 C -8 -6 -20 -8 -40 -6 Z" fill="${C.or}"/>
      <text x="0" y="16" text-anchor="middle" font-family="Instrument Sans" font-weight="600" font-size="13" fill="${C.sable}" letter-spacing="3">ASTON MARTIN</text>
    </g>

    <!-- Yamaha, Ducati : arrière du capot -->
    <text x="0" y="0" transform="translate(928 322) rotate(19)" font-family="Barlow Condensed" font-weight="800" font-style="italic" font-size="23" fill="${C.sable}" letter-spacing="1.5">YAMAHA</text>
    <text x="0" y="0" transform="translate(800 322) rotate(-2)" font-family="Barlow Condensed" font-weight="800" font-size="19" fill="${C.ciel}" letter-spacing="2.5">DUCATI</text>

    <!-- numéro : dérive -->
    <text x="0" y="0" transform="translate(992 284) rotate(22)" font-family="Barlow Condensed" font-weight="800" font-style="italic" font-size="30" fill="${C.ciel}">26</text>

    <!-- Monster Energy : dérive d'aileron arrière -->
    <g transform="translate(1290 284)">
      <path d="M -24 -52 L -17 -10 M -5 -55 L 0 -8 M 14 -53 L 16 -10" stroke="${C.ciel}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <text x="0" y="30" text-anchor="middle" font-family="Barlow Condensed" font-weight="800" font-size="30" fill="${C.sable}" letter-spacing="1">MONSTER</text>
      <text x="0" y="58" text-anchor="middle" font-family="Barlow Condensed" font-weight="600" font-size="22" fill="${C.ciel}" letter-spacing="5">ENERGY</text>
    </g>

    <!-- nom d'équipe : aileron arrière, plan supérieur -->
    <text x="1275" y="200" text-anchor="middle" font-family="Instrument Sans" font-weight="600" font-size="8.5" fill="${C.sable}" letter-spacing="1.2">PHOXIA ASTON MARTIN F1 TEAM</text>
  </g>`;
}

const defs = `
<defs>
  <style>${FONTS}</style>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7d868f"/><stop offset=".55" stop-color="#b3b9be"/><stop offset="1" stop-color="#d3d6d8"/>
  </linearGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cfd3d6" stop-opacity="0"/><stop offset="1" stop-color="#cfd3d6" stop-opacity=".75"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9c9b97"/><stop offset=".4" stop-color="#b4b2ad"/><stop offset="1" stop-color="#8b8a86"/>
  </linearGradient>
  <linearGradient id="ceiling" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b2d30"/><stop offset="1" stop-color="#4a4c4f"/>
  </linearGradient>
  <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a4270"/><stop offset=".35" stop-color="${C.encre}"/><stop offset="1" stop-color="${C.encreProfond}"/>
  </linearGradient>
  <linearGradient id="podGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1d3160"/><stop offset=".5" stop-color="${C.encre}"/><stop offset="1" stop-color="#08101f"/>
  </linearGradient>
  <linearGradient id="topSheen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".32"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="tyre" cx=".45" cy=".4" r=".65">
    <stop offset="0" stop-color="#2a2b2f"/><stop offset=".8" stop-color="#141518"/><stop offset="1" stop-color="#0b0b0d"/>
  </radialGradient>
  <radialGradient id="rim" cx=".4" cy=".35" r=".7">
    <stop offset="0" stop-color="#23262d"/><stop offset="1" stop-color="#0b0c0f"/>
  </radialGradient>
  <linearGradient id="tyreSheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="shadow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".7" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".5" r=".75">
    <stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
  </radialGradient>
  <linearGradient id="reflet" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
    <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .07 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="blur2"><feGaussianBlur stdDeviation="1.6"/></filter>
</defs>`;

/* ------------------------------------------------------------------ */
/* Décor : terrasse vitrée en hauteur, skyline, ciel couvert           */
/* ------------------------------------------------------------------ */
const W = 1600, H = 2300, HORIZON = 1330;

function building(x, w, top, tone, far) {
  const h = HORIZON - top;
  let wins = '';
  const cw = far ? 9 : 14, ch = far ? 10 : 16, gx = far ? 5 : 7, gy = far ? 6 : 9;
  for (let yy = top + 18; yy < HORIZON - 10; yy += ch + gy)
    for (let xx = x + 10; xx < x + w - cw - 6; xx += cw + gx)
      if (rnd() > 0.12) wins += `<rect x="${xx}" y="${yy}" width="${cw}" height="${ch}" fill="${rnd() > 0.93 ? '#d9d4c2' : '#1d2630'}" opacity="${far ? .35 : .55}"/>`;
  const edge = far ? '' : `<rect x="${x}" y="${top}" width="${w * 0.18}" height="${h}" fill="#fff" opacity=".05"/>`;
  const cap = rnd() > 0.6 ? `<rect x="${x + w * 0.3}" y="${top - 24}" width="${w * 0.4}" height="24" fill="${tone}"/>` : '';
  const mast = rnd() > 0.85 ? `<line x1="${x + w / 2}" y1="${top - 24}" x2="${x + w / 2}" y2="${top - 180}" stroke="${tone}" stroke-width="4"/>` : '';
  return `<g>${mast}${cap}<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${tone}"/>${wins}${edge}</g>`;
}

function skyline() {
  let far = '', near = '';
  for (let x = -20; x < W; ) {
    const w = 60 + rnd() * 110;
    far += building(x, w, 780 + rnd() * 280, '#6f7780', true);
    x += w + rnd() * 10;
  }
  for (let x = -40; x < W; ) {
    const w = 110 + rnd() * 170;
    const top = 620 + rnd() * 420;
    near += building(x, w, top, ['#39434d', '#434d57', '#2f3842', '#4b545d'][Math.floor(rnd() * 4)], false);
    x += w + 10 + rnd() * 70;
  }
  return `<g>${far}<rect x="0" y="700" width="${W}" height="${HORIZON - 700}" fill="url(#haze)"/>${near}<rect x="0" y="1000" width="${W}" height="${HORIZON - 1000}" fill="url(#haze)" opacity=".7"/></g>`;
}

function floorTiles() {
  let lines = '';
  const vpX = 800, vpY = 1080;
  for (let i = -14; i <= 14; i++) {
    const xb = vpX + i * 260;
    const t = (HORIZON - vpY) / (H - vpY);
    const xt = vpX + (xb - vpX) * t;
    lines += `<line x1="${xt}" y1="${HORIZON}" x2="${xb}" y2="${H}" stroke="#6f6e6a" stroke-width="2" opacity=".55"/>`;
  }
  let y = HORIZON, step = 38;
  while (y < H) { y += step; step *= 1.32; lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#6f6e6a" stroke-width="2" opacity=".5"/>`; }
  return lines;
}

const CAR_X = 25, CAR_S = 1.14, GROUND = 1780;
const CAR_Y = GROUND - 470 * CAR_S;

function scene() {
  seed = 7;
  const posts = [120, 560, 1060, 1480].map(x => `<rect x="${x}" y="560" width="34" height="${HORIZON - 560}" fill="#15171a"/>`).join('');
  return `
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g filter="url(#blur2)">${skyline()}</g>
  <!-- verrière -->
  <rect x="0" y="540" width="${W}" height="46" fill="#17191c"/>
  <rect x="0" y="586" width="${W}" height="8" fill="#2a2c30"/>
  ${posts}
  <rect x="0" y="1240" width="${W}" height="${HORIZON - 1240}" fill="#b9c4cb" opacity=".18"/>
  <rect x="0" y="1236" width="${W}" height="4" fill="#1b1d20" opacity=".7"/>
  <!-- plafond -->
  <path d="M 0 0 L ${W} 0 L ${W} 400 L 0 470 Z" fill="url(#ceiling)"/>
  <path d="M 0 470 L ${W} 400 L ${W} 420 L 0 492 Z" fill="#1c1d20"/>
  <line x1="380" y1="0" x2="300" y2="455" stroke="#1a1b1e" stroke-width="3"/>
  <line x1="1150" y1="0" x2="1210" y2="410" stroke="#1a1b1e" stroke-width="3"/>
  <!-- sol -->
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  ${floorTiles()}
  <!-- ombre + reflet -->
  <ellipse cx="${CAR_X + 690 * CAR_S}" cy="${GROUND + 6}" rx="${760 * CAR_S}" ry="46" fill="url(#shadow)" filter="url(#blur6)"/>
  <g transform="translate(${CAR_X} ${GROUND + 470 * CAR_S}) scale(${CAR_S} ${-CAR_S * 0.9}) translate(0 -470)" opacity=".13" filter="url(#blur6)"><use href="#car"/></g>
  <g transform="translate(${CAR_X} ${CAR_Y}) scale(${CAR_S})">${car()}</g>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>`;
}

function sceneSVG(vb, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}" width="${w}" height="${h}">${defs}${scene()}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Carte titre et planche partenaires                                  */
/* ------------------------------------------------------------------ */
function titleSVG() {
  const partners = [
    ['Monster Energy', 'Partenaire titre énergie'], ['Claude', 'Partenaire intelligence artificielle'],
    ['Apple', 'Partenaire technologie'], ['Yamaha', 'Partenaire moteur et performance'],
    ['Ducati', 'Partenaire ingénierie'], ['Uniqlo', 'Équipementier officiel'],
    ['Decathlon', 'Partenaire sport et préparation'], ['Aston Martin', 'Constructeur'],
  ];
  const rows = partners.map(([n, r], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 110 + col * 700, y = 1250 + row * 170;
    return `<line x1="${x}" y1="${y - 62}" x2="${x + 620}" y2="${y - 62}" stroke="${C.sable}" stroke-opacity=".18" stroke-width="2"/>
      <text x="${x}" y="${y}" font-family="Instrument Sans" font-weight="600" font-size="46" fill="${C.sable}">${n}</text>
      <text x="${x}" y="${y + 46}" font-family="Instrument Sans" font-weight="500" font-size="26" fill="${C.ciel}">${r}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 2000" width="1080" height="1350">${defs}
    <rect width="1600" height="2000" fill="${C.encre}"/>
    <path d="M 0 2000 L 0 1500 L 1600 700 L 1600 900 L 300 2000 Z" fill="${C.azur}" opacity=".12"/>
    ${symbole(110, 150, 1.25, [C.ciel, C.azur, C.sable])}
    <text x="110" y="470" font-family="Barlow Condensed" font-weight="600" font-size="40" fill="${C.ciel}" letter-spacing="8">CONCEPT LIVRÉE · SAISON 2027</text>
    <text x="104" y="640" font-family="EB Garamond" font-weight="500" font-size="172" fill="${C.sable}">Phoxia</text>
    <text x="104" y="800" font-family="EB Garamond" font-weight="500" font-size="172" fill="${C.sable}">Aston Martin</text>
    <text x="110" y="930" font-family="Barlow Condensed" font-weight="800" font-style="italic" font-size="120" fill="${C.ciel}" letter-spacing="4">F1 TEAM</text>
    <rect x="110" y="1000" width="160" height="6" fill="${C.or}"/>
    <text x="110" y="1090" font-family="Barlow Condensed" font-weight="600" font-size="38" fill="${C.sable}" fill-opacity=".7" letter-spacing="6">PARTENAIRES</text>
    ${rows}
    <text x="110" y="1935" font-family="Instrument Sans" font-weight="500" font-size="24" fill="${C.sable}" fill-opacity=".5">Création conceptuelle Phoxia. Marques citées à titre illustratif, sans partenariat officiel.</text>
  </svg>`;
}

/* ------------------------------------------------------------------ */
const slides = [
  // [nom, viewBox, largeur, hauteur]
  ['01-rooftop', '0 170 1600 2000', 1080, 1350],
  ['02-avant', '10 1450 420 525', 1080, 1350],
  ['03-ponton', '640 1250 520 650', 1080, 1350],
  ['04-arriere', '1080 1240 520 650', 1080, 1350],
  ['06-bandeau-16x9', '0 1020 1600 900', 1920, 1080],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const jobs = slides.map(([n, vb, w, h]) => [n, sceneSVG(vb, w, h), w, h]);
  jobs.splice(4, 0, ['05-equipe', titleSVG(), 1080, 1350]);
  for (const [name, svg, w, h] of jobs) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log('ok', name);
  }
  fs.writeFileSync(path.join(OUT, 'livree-source.svg'), sceneSVG('0 170 1600 2000', 1600, 2000));
  await browser.close();
})();
