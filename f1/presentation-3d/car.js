// Monoplace F1 procédurale, livrée Phoxia Aston Martin. Unités : mètres, x vers l'avant, y vers le haut.
import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

export const COL = {
  encre: 0x14213d, encreProfond: 0x0b1428, azur: 0x1c6ba8, ciel: 0x5ba3dd, sable: 0xedeae1, or: 0xc9b98f,
};
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

/* ---------------------------------------------------------------- matériaux */
export function materials() {
  const paint = new THREE.MeshPhysicalMaterial({
    color: COL.encre, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.04,
  });
  // Bande azur + filet or qui balaient la carrosserie, calculés en espace monde.
  paint.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float yl = 0.19 + 0.035 * vWP.x;               // ligne de la bande, montante vers le nez
        float d = vWP.y - yl;
        vec3 azur = vec3(0.0116, 0.147, 0.392);       // #1C6BA8 linéaire
        vec3 ors = vec3(0.584, 0.485, 0.275);         // #C9B98F linéaire
        vec3 profond = vec3(0.0033, 0.0070, 0.0232);  // #0B1428 linéaire
        if (d < 0.0 && d > -0.075) diffuseColor.rgb = azur;
        else if (d > 0.012 && d < 0.024) diffuseColor.rgb = ors;
        else if (d <= -0.075) diffuseColor.rgb = profond;
      `);
  };
  const plain = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, ...o });
  return {
    paint,
    navy: plain(COL.encre),
    azur: plain(COL.azur),
    ciel: plain(COL.ciel),
    sable: plain(COL.sable, { metalness: 0.2 }),
    carbon: new THREE.MeshPhysicalMaterial({ color: 0x0c0d10, metalness: 0.3, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.9 }),
    tyre: new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.82, metalness: 0 }),
    visor: new THREE.MeshPhysicalMaterial({ color: 0x080a10, metalness: 0.9, roughness: 0.08, clearcoat: 1 }),
    red: new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a1a, emissiveIntensity: 0 }),
  };
}

/* ---------------------------------------------------------------- outils géométriques */
const spow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

// Surface lissée par sections super-elliptiques : {x, zc, hw, yb, yt, n}
function loft(stations, { segs = 64, sub = 8, cap = true } = {}) {
  const keys = ['x', 'zc', 'hw', 'yb', 'yt', 'n'];
  const curves = keys.map((k) => new THREE.SplineCurve(stations.map((s, i) => new THREE.Vector2(i, s[k] ?? (k === 'zc' ? 0 : 3)))));
  const rings = (stations.length - 1) * sub + 1;
  const pos = [], uv = [], idx = [];
  for (let r = 0; r < rings; r++) {
    const t = r / (rings - 1);
    const [x, zc, hw, yb, yt, n] = curves.map((c) => c.getPoint(t).y);
    const ym = (yb + yt) / 2, hh = (yt - yb) / 2, e = 2 / n;
    for (let s = 0; s <= segs; s++) {
      const th = (s / segs) * Math.PI * 2 - Math.PI / 2;
      pos.push(x, ym + hh * spow(Math.sin(th), e), zc + hw * spow(Math.cos(th), e));
      uv.push(t, s / segs);
    }
  }
  for (let r = 0; r < rings - 1; r++)
    for (let s = 0; s < segs; s++) {
      const a = r * (segs + 1) + s, b = a + segs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  if (cap) for (const r of [0, rings - 1]) {
    let cx = 0, cy = 0, cz = 0;
    for (let s = 0; s < segs; s++) { const i = (r * (segs + 1) + s) * 3; cx += pos[i]; cy += pos[i + 1]; cz += pos[i + 2]; }
    const c = pos.length / 3; pos.push(cx / segs, cy / segs, cz / segs); uv.push(r ? 1 : 0, 0.5);
    for (let s = 0; s < segs; s++) {
      const a = r * (segs + 1) + s;
      r ? idx.push(a, c, a + 1) : idx.push(a, a + 1, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Profil d'aile (camber + épaisseur), extrudé selon z et centré.
function wing(chord, thick, span, camber = 0.06) {
  const sh = new THREE.Shape(), N = 24, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = -u * chord;
    const t = 5 * thick * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
    const c = camber * chord * 4 * u * (1 - u);
    top.push([x, c + t * chord]); bot.push([x, c - t * chord]);
  }
  sh.moveTo(...top[0]); top.slice(1).forEach((p) => sh.lineTo(...p));
  bot.reverse().forEach((p) => sh.lineTo(...p));
  const g = new THREE.ExtrudeGeometry(sh, { depth: span, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -span / 2);
  return g;
}

function rod(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 10), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

/* ---------------------------------------------------------------- textures de marquage */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function drawSymbol(x, px, py, s, cols = [COL.ciel, COL.azur, COL.sable]) {
  const P = [[0, 68.1], [42.56, 34.05], [85.12, 0]];
  P.forEach(([dx, dy], i) => {
    x.fillStyle = hex(cols[i]); x.beginPath();
    const ox = px + dx * s, oy = py + dy * s;
    x.moveTo(ox, oy + 34.05 * s); x.lineTo(ox + 34.05 * s, oy + 34.05 * s); x.lineTo(ox + 53.91 * s, oy); x.lineTo(ox + 19.86 * s, oy); x.fill();
  });
}
const logos = {
  phoxia: () => canvasTex(1400, 300, (x, w, h) => {
    drawSymbol(x, 10, 40, 1.85);
    x.fillStyle = hex(COL.sable); x.font = '600 200px "Instrument Sans"'; x.textBaseline = 'middle';
    x.letterSpacing = '30px'; x.fillText('PHOXIA', 300, h / 2 + 8);
  }),
  claude: () => canvasTex(900, 240, (x, w, h) => {
    x.strokeStyle = '#D97757'; x.lineWidth = 16; x.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.moveTo(110, 120); x.lineTo(110 + Math.cos(a) * 70, 120 + Math.sin(a) * 70); x.stroke(); }
    x.fillStyle = hex(COL.sable); x.font = 'italic 500 170px "EB Garamond"'; x.textBaseline = 'middle'; x.fillText('Claude', 210, 118);
  }),
  apple: () => canvasTex(700, 200, (x, w, h) => {
    x.fillStyle = hex(COL.sable); x.font = '600 150px "Instrument Sans"'; x.textBaseline = 'middle'; x.fillText('Apple', 20, h / 2);
  }),
  uniqlo: () => canvasTex(700, 200, (x, w, h) => {
    x.fillStyle = hex(COL.sable); x.fillRect(0, 10, w, h - 20);
    x.fillStyle = hex(COL.encre); x.font = '800 150px "Barlow Condensed"'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.letterSpacing = '14px'; x.fillText('UNIQLO', w / 2, h / 2 + 6);
  }),
  aston: () => canvasTex(1000, 320, (x, w, h) => {
    x.fillStyle = hex(COL.or); x.beginPath();
    x.moveTo(w / 2 - 330, 60); x.bezierCurveTo(w / 2 - 150, 20, w / 2 - 40, 30, w / 2, 110);
    x.bezierCurveTo(w / 2 + 40, 30, w / 2 + 150, 20, w / 2 + 330, 60);
    x.bezierCurveTo(w / 2 + 150, 70, w / 2 + 60, 90, w / 2, 150);
    x.bezierCurveTo(w / 2 - 60, 90, w / 2 - 150, 70, w / 2 - 330, 60); x.fill();
    x.fillStyle = hex(COL.sable); x.font = '600 92px "Instrument Sans"'; x.textAlign = 'center';
    x.letterSpacing = '22px'; x.fillText('ASTON MARTIN', w / 2 + 11, 270);
  }),
  yamaha: () => canvasTex(800, 200, (x, w, h) => {
    x.fillStyle = hex(COL.sable); x.font = 'italic 800 170px "Barlow Condensed"'; x.textBaseline = 'middle'; x.letterSpacing = '8px'; x.fillText('YAMAHA', 20, h / 2 + 6);
  }),
  ducati: () => canvasTex(700, 200, (x, w, h) => {
    x.fillStyle = hex(COL.ciel); x.font = '800 160px "Barlow Condensed"'; x.textBaseline = 'middle'; x.letterSpacing = '12px'; x.fillText('DUCATI', 20, h / 2 + 6);
  }),
  monster: () => canvasTex(800, 700, (x, w, h) => {
    x.strokeStyle = hex(COL.ciel); x.lineWidth = 46; x.lineCap = 'round';
    [[-150, -10], [0, 0], [150, 10]].forEach(([dx, sk]) => { x.beginPath(); x.moveTo(w / 2 + dx - 20, 60); x.quadraticCurveTo(w / 2 + dx + sk, 200, w / 2 + dx + 10, 330); x.stroke(); });
    x.fillStyle = hex(COL.sable); x.font = '800 200px "Barlow Condensed"'; x.textAlign = 'center'; x.fillText('MONSTER', w / 2, 540);
    x.fillStyle = hex(COL.ciel); x.font = '600 110px "Barlow Condensed"'; x.letterSpacing = '40px'; x.fillText('ENERGY', w / 2 + 20, 660);
  }),
  decathlon: () => canvasTex(1000, 240, (x, w, h) => {
    x.fillStyle = hex(COL.sable); x.font = '800 190px "Barlow Condensed"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '6px'; x.fillText('DECATHLON', w / 2, h / 2 + 8);
  }),
  num: () => canvasTex(400, 300, (x, w, h) => {
    x.fillStyle = hex(COL.ciel); x.font = 'italic 800 280px "Barlow Condensed"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('26', w / 2, h / 2 + 10);
  }),
  team: () => canvasTex(1600, 120, (x, w, h) => {
    x.fillStyle = hex(COL.sable); x.font = '600 76px "Instrument Sans"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '18px'; x.fillText('PHOXIA ASTON MARTIN F1 TEAM', w / 2, h / 2);
  }),
  sidewall: () => canvasTex(1024, 1024, (x, w, h) => {
    const c = w / 2; x.translate(c, c);
    x.strokeStyle = hex(COL.ciel); x.lineWidth = 26;
    x.beginPath(); x.arc(0, 0, 470, Math.PI * 0.62, Math.PI * 1.05); x.stroke();
    x.beginPath(); x.arc(0, 0, 470, Math.PI * 1.62, Math.PI * 2.05); x.stroke();
    x.fillStyle = hex(COL.sable); x.font = 'italic 800 78px "Barlow Condensed"'; x.textAlign = 'center';
    for (const base of [-Math.PI / 2, Math.PI / 2]) {
      const txt = 'PHOXIA · RACE', step = 0.085;
      [...txt].forEach((ch, i) => {
        x.save(); x.rotate(base + (i - (txt.length - 1) / 2) * step); x.translate(0, -392); x.fillText(ch, 0, 0); x.restore();
      });
    }
  }),
  cover: () => canvasTex(1024, 1024, (x, w, h) => {
    const c = w / 2; x.fillStyle = '#0d1a33'; x.fillRect(0, 0, w, h); x.translate(c, c);
    x.strokeStyle = hex(COL.ciel); x.lineWidth = 22; x.lineCap = 'round';
    for (let i = 0; i < 7; i++) { x.save(); x.rotate(i * Math.PI * 2 / 7); x.beginPath(); x.moveTo(0, -150); x.lineTo(60, -440); x.stroke(); x.restore(); }
    x.fillStyle = '#05080f'; x.beginPath(); x.arc(0, 0, 110, 0, 7); x.fill();
    x.strokeStyle = hex(COL.or); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 500, 0, 7); x.stroke();
  }),
};

/* ---------------------------------------------------------------- assemblage */
export function buildCar(M) {
  const car = new THREE.Group();
  const add = (m, ...p) => { if (p.length) m.position.set(...p); car.add(m); return m; };

  // coque, nez, capot moteur
  const body = add(new THREE.Mesh(loft([
    { x: 2.92, hw: 0.05, yb: 0.2, yt: 0.25, n: 2.4 },
    { x: 2.55, hw: 0.11, yb: 0.17, yt: 0.33, n: 2.6 },
    { x: 2.05, hw: 0.16, yb: 0.15, yt: 0.44, n: 2.8 },
    { x: 1.5, hw: 0.23, yb: 0.11, yt: 0.56, n: 3 },
    { x: 0.95, hw: 0.31, yb: 0.08, yt: 0.66, n: 3.2 },
    { x: 0.45, hw: 0.36, yb: 0.07, yt: 0.68, n: 3.4 },
    { x: 0.05, hw: 0.36, yb: 0.07, yt: 0.8, n: 3.2 },
    { x: -0.35, hw: 0.3, yb: 0.07, yt: 0.96, n: 2.8 },
    { x: -0.9, hw: 0.25, yb: 0.08, yt: 0.78, n: 2.8 },
    { x: -1.45, hw: 0.17, yb: 0.12, yt: 0.56, n: 2.6 },
    { x: -1.95, hw: 0.1, yb: 0.2, yt: 0.42, n: 2.4 },
    { x: -2.12, hw: 0.07, yb: 0.24, yt: 0.38, n: 2.4 },
  ], { segs: 72, sub: 10 }), M.paint));
  body.name = 'body';

  // pontons
  const pods = [];
  for (const s of [1, -1]) {
    const pod = add(new THREE.Mesh(loft([
      { x: 0.9, zc: 0.63 * s, hw: 0.27, yb: 0.08, yt: 0.52, n: 4 },
      { x: 0.55, zc: 0.63 * s, hw: 0.3, yb: 0.08, yt: 0.6, n: 4.2 },
      { x: -0.1, zc: 0.61 * s, hw: 0.29, yb: 0.08, yt: 0.56, n: 4 },
      { x: -0.75, zc: 0.5 * s, hw: 0.22, yb: 0.08, yt: 0.44, n: 3.4 },
      { x: -1.3, zc: 0.34 * s, hw: 0.12, yb: 0.1, yt: 0.33, n: 3 },
      { x: -1.7, zc: 0.2 * s, hw: 0.05, yb: 0.14, yt: 0.26, n: 2.6 },
    ], { segs: 56, sub: 8 }), M.paint));
    pods.push(pod);
    // entrée d'air
    const inlet = add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.44), M.black), 0.915, 0.33, 0.62 * s);
    inlet.scale.set(1, 1, 1);
  }

  // cockpit, pilote
  const tub = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 6, 16), M.black), 0.5, 0.625, 0);
  tub.rotation.z = Math.PI / 2; tub.scale.set(0.35, 1, 1.25);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.135, 40, 28), M.sable), 0.38, 0.8, 0);
  const visor = add(new THREE.Mesh(new THREE.SphereGeometry(0.138, 40, 16, Math.PI - 0.75, 1.5, 1.2, 0.38), M.visor), 0.38, 0.8, 0);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.137, 40, 8, 0, Math.PI * 2, 1.62, 0.12), M.azur), 0.38, 0.8, 0);

  // halo
  const haloPts = [[0.02, 0.7, -0.3], [0.22, 0.88, -0.3], [0.55, 0.93, -0.25], [0.82, 0.93, -0.11], [0.9, 0.925, 0], [0.82, 0.93, 0.11], [0.55, 0.93, 0.25], [0.22, 0.88, 0.3], [0.02, 0.7, 0.3]].map((p) => new THREE.Vector3(...p));
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(haloPts), 80, 0.032, 12), M.carbon));
  const pillar = add(rod(new THREE.Vector3(0.9, 0.925, 0), new THREE.Vector3(1.08, 0.66, 0), 0.03, M.carbon));
  pillar.scale.set(0.7, 1, 1.4);

  // prise d'air, caméra, dérive
  const intake = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), M.black), -0.16, 0.9, 0);
  intake.scale.set(0.05, 0.09, 0.13);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.16), M.ciel), -0.28, 1.0, 0);
  const fin = new THREE.Shape();
  fin.moveTo(-0.35, 0.9); fin.lineTo(-0.4, 1.02); fin.lineTo(-1.75, 0.66); fin.lineTo(-1.75, 0.5); fin.lineTo(-0.9, 0.7);
  const finG = new THREE.ExtrudeGeometry(fin, { depth: 0.014, bevelEnabled: false }); finG.translate(0, 0, -0.007);
  add(new THREE.Mesh(finG, M.navy));
  const finEdge = new THREE.Shape(); finEdge.moveTo(-0.4, 1.02); finEdge.lineTo(-1.75, 0.66); finEdge.lineTo(-1.75, 0.645); finEdge.lineTo(-0.4, 1.0);
  const feG = new THREE.ExtrudeGeometry(finEdge, { depth: 0.018, bevelEnabled: false }); feG.translate(0, 0, -0.009);
  add(new THREE.Mesh(feG, M.ciel));

  // fond plat
  const fl = new THREE.Shape();
  [[1.35, 0.3], [1.05, 0.86], [-1.2, 0.96], [-1.7, 0.72], [-2.05, 0.5], [-2.05, -0.5], [-1.7, -0.72], [-1.2, -0.96], [1.05, -0.86], [1.35, -0.3]].forEach(([x, z], i) => (i ? fl.lineTo(x, z) : fl.moveTo(x, z)));
  const flG = new THREE.ExtrudeGeometry(fl, { depth: 0.03, bevelEnabled: false }); flG.rotateX(Math.PI / 2); flG.translate(0, 0.075, 0);
  add(new THREE.Mesh(flG, M.carbon));
  const edge = new THREE.MeshPhysicalMaterial({ color: COL.azur, metalness: 0.4, roughness: 0.3, clearcoat: 1 });
  for (const s of [1, -1]) add(new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.035, 0.02), edge), -0.1, 0.06, 0.93 * s).rotation.y = -0.045 * s;

  // aileron avant
  const fw = [[0.34, 0.02, 0, 0.1, M.navy], [0.2, 0.04, 0.2, 0.15, M.azur], [0.16, 0.08, 0.3, 0.2, M.ciel], [0.12, 0.13, 0.36, 0.245, M.sable]];
  fw.forEach(([c, dx, dy, y, m], i) => {
    const w = add(new THREE.Mesh(wing(c, 0.1, 1.9, 0.05), m), 3.1 - dx - i * 0.04, y, 0);
    w.rotation.z = 0.08 + i * 0.12;
  });
  for (const s of [1, -1]) {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.018), M.navy), 2.9, 0.15, 0.955 * s);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.022), M.ciel), 2.9, 0.245, 0.955 * s);
    const d = add(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.096), new THREE.MeshPhysicalMaterial({ map: logos.decathlon(), transparent: true, clearcoat: 1, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -4 })), 2.9, 0.15, 0.966 * s);
    if (s < 0) d.rotation.y = Math.PI;
  }
  for (const s of [1, -1]) add(rod(new THREE.Vector3(2.75, 0.22, 0.05 * s), new THREE.Vector3(2.85, 0.13, 0.05 * s), 0.012, M.carbon));

  // aileron arrière
  const rw = add(new THREE.Mesh(wing(0.3, 0.12, 1.02, 0.1), M.navy), -1.93, 0.86, 0); rw.rotation.z = 0.18;
  const flap = add(new THREE.Mesh(wing(0.2, 0.1, 1.02, 0.1), M.ciel), -2.12, 0.97, 0); flap.rotation.z = 0.5;
  const beam = add(new THREE.Mesh(wing(0.18, 0.12, 0.8, 0.08), M.carbon), -1.98, 0.44, 0); beam.rotation.z = 0.15;
  const epMat = new THREE.MeshPhysicalMaterial({ color: COL.encre, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.04 });
  for (const s of [1, -1]) {
    const ep = add(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.64, 0.02), epMat), -2.07, 0.74, 0.52 * s);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.035, 0.024), M.ciel), -2.07, 1.045, 0.52 * s);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.024), M.azur), -2.07, 0.43, 0.52 * s);
    const d = add(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.4), new THREE.MeshPhysicalMaterial({ map: logos.monster(), transparent: true, clearcoat: 1, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -4 })), -2.07, 0.72, 0.532 * s);
    if (s < 0) d.rotation.y = Math.PI;
  }
  add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.04), M.carbon), -1.95, 0.6, 0);
  const team = add(new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.07), new THREE.MeshPhysicalMaterial({ map: logos.team(), transparent: true, clearcoat: 1, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -4 })), -1.95, 0.915, 0);
  team.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);

  // feu arrière
  const light = add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.16), M.red), -2.15, 0.33, 0);

  // rétroviseurs
  for (const s of [1, -1]) {
    add(rod(new THREE.Vector3(0.75, 0.6, 0.42 * s), new THREE.Vector3(0.8, 0.74, 0.52 * s), 0.012, M.carbon));
    const m = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.1, 4, 12), M.navy), 0.8, 0.76, 0.54 * s);
    m.rotation.x = Math.PI / 2;
  }

  // roues
  const wheels = [];
  const sidewall = logos.sidewall(), coverTex = logos.cover();
  function wheelMesh(width) {
    const g = new THREE.Group(), R = 0.36, r0 = 0.23, hw = width / 2;
    const prof = [[r0, -hw], [0.325, -hw], [0.35, -hw + 0.012], [R, -hw + 0.045], [R, hw - 0.045], [0.35, hw - 0.012], [0.325, hw], [r0, hw]].map(([a, b]) => new THREE.Vector2(a, b));
    const t = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), M.tyre); t.rotation.x = Math.PI / 2; g.add(t);
    for (const s of [1, -1]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.235, 0.35, 96, 1), new THREE.MeshStandardMaterial({ map: sidewall, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
      ring.position.z = (hw + 0.001) * s; if (s < 0) ring.rotation.y = Math.PI;
      // UV planaires pour le texte circulaire
      const p = ring.geometry.attributes.position, uv = ring.geometry.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.7 + 0.5, p.getY(i) / 0.7 + 0.5);
      g.add(ring);
      const cov = new THREE.Mesh(new THREE.CircleGeometry(0.232, 64), new THREE.MeshPhysicalMaterial({ map: coverTex, metalness: 0.5, roughness: 0.3, clearcoat: 1 }));
      cov.position.z = (hw - 0.02) * s; if (s < 0) cov.rotation.y = Math.PI; g.add(cov);
    }
    return g;
  }
  for (const [x, z, w] of [[1.8, 0.8, 0.3], [1.8, -0.8, 0.3], [-1.8, 0.77, 0.4], [-1.8, -0.77, 0.4]]) {
    const wm = wheelMesh(w); wm.position.set(x, 0.36, z); car.add(wm); wheels.push(wm);
  }

  // suspensions
  for (const s of [1, -1]) {
    const hubF = new THREE.Vector3(1.8, 0.36, 0.64 * s), hubR = new THREE.Vector3(-1.8, 0.36, 0.56 * s);
    [[2.05, 0.46, 0.14], [1.55, 0.44, 0.2], [2.05, 0.22, 0.12], [1.5, 0.2, 0.2]].forEach(([x, y, z], i) =>
      add(rod(new THREE.Vector3(x, y, z * s), hubF.clone().setY(i < 2 ? 0.46 : 0.26), 0.014, M.carbon)));
    [[-1.4, 0.46, 0.14], [-2.0, 0.44, 0.1], [-1.4, 0.2, 0.16], [-2.0, 0.22, 0.1]].forEach(([x, y, z], i) =>
      add(rod(new THREE.Vector3(x, y, z * s), hubR.clone().setY(i < 2 ? 0.48 : 0.26), 0.016, M.carbon)));
  }

  car.updateMatrixWorld(true);

  // décalcomanies projetées sur la carrosserie
  function decal(target, tex, pos, rotY, w, h, depth = 0.25) {
    const m = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, metalness: 0.3, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
    const g = new DecalGeometry(target, new THREE.Vector3(...pos), new THREE.Euler(0, rotY, 0), new THREE.Vector3(w, h, depth));
    car.add(new THREE.Mesh(g, m));
  }
  const T = Object.fromEntries(Object.keys(logos).map((k) => [k, null]));
  const tex = (k) => (T[k] ??= logos[k]());
  for (const s of [1, -1]) {
    const ry = s > 0 ? 0 : Math.PI;
    decal(pods[s > 0 ? 0 : 1], tex('phoxia'), [0.1, 0.36, 0.9 * s], ry, 1.05, 0.225, 0.3);
    decal(body, tex('claude'), [2.25, 0.29, 0.14 * s], ry, 0.42, 0.11, 0.2);
    decal(body, tex('apple'), [1.2, 0.46, 0.28 * s], ry, 0.3, 0.085, 0.2);
    decal(body, tex('uniqlo'), [1.35, 0.3, 0.25 * s], ry, 0.24, 0.07, 0.2);
    decal(body, tex('aston'), [-0.55, 0.74, 0.28 * s], ry, 0.5, 0.16, 0.24);
    decal(body, tex('yamaha'), [-1.05, 0.56, 0.22 * s], ry, 0.34, 0.085, 0.2);
    decal(body, tex('ducati'), [-1.45, 0.43, 0.17 * s], ry, 0.26, 0.075, 0.16);
    const n = add(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.165), new THREE.MeshPhysicalMaterial({ map: tex('num'), transparent: true, polygonOffset: true, polygonOffsetFactor: -4, clearcoat: 1, roughness: 0.3 })), -1.0, 0.8, 0.0085 * s);
    if (s < 0) n.rotation.y = Math.PI;
  }

  car.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return { car, light, wheels };
}
