// Présentation « Phoxia Aston Martin F1 Team » : studio, lumières, caméra, rendu déterministe image par image.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { materials, buildCar, COL } from './car.js';

const W = 1920, H = 1080;
await Promise.all(['600 100px "Instrument Sans"', 'italic 500 100px "EB Garamond"', '800 100px "Barlow Condensed"', 'italic 800 100px "Barlow Condensed"', '600 100px "Barlow Condensed"']
  .map((f) => document.fonts.load(f)));

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').prepend(renderer.domElement);
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020306);
scene.fog = new THREE.FogExp2(0x020306, 0.03);
const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 200);

/* ---------------------------------------------------------------- monoplace */
const M = materials();
const { car, light: rainLight } = buildCar(M);
car.position.y = 0.062;
scene.add(car);

/* ---------------------------------------------------------------- studio */
const hdr = (c, k) => new THREE.Color(c).multiplyScalar(k);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x030305, roughness: 0.7, metalness: 0.2 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

const plate = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.75, 0.06, 128), new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.3, metalness: 0.6 }));
plate.position.y = 0.03; scene.add(plate);
const mirror = new Reflector(new THREE.CircleGeometry(3.66, 128), { textureWidth: 768, textureHeight: 768, color: 0x5a5f69, clipBias: 0.003 });
mirror.rotation.x = -Math.PI / 2; mirror.position.y = 0.0605; scene.add(mirror);
const dim = new THREE.Mesh(new THREE.CircleGeometry(3.66, 128), new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.35, metalness: 0.4, transparent: true, opacity: 0.86 }));
dim.rotation.x = -Math.PI / 2; dim.position.y = 0.061; scene.add(dim);
const rimMat = new THREE.MeshBasicMaterial({ color: hdr(COL.ciel, 0) });
const plateRim = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.012, 8, 256), rimMat);
plateRim.rotation.x = Math.PI / 2; plateRim.position.y = 0.062; scene.add(plateRim);

// ombre de contact
const sc = document.createElement('canvas'); sc.width = 512; sc.height = 256;
{ const x = sc.getContext('2d'); const g = x.createRadialGradient(256, 128, 10, 256, 128, 250);
  g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(.55, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.save(); x.scale(1, 1); x.fillRect(0, 0, 512, 256); x.restore(); }
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.35, 0.0625, 0); scene.add(shadow);

// anneau lumineux suspendu + plafonnier
const ringMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.045, 12, 256), ringMat);
ring.rotation.x = Math.PI / 2; ring.position.set(0.3, 4.8, 0); scene.add(ring);
const panelMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const panel = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.2), panelMat);
panel.rotation.x = Math.PI / 2; panel.position.set(0.3, 4.9, 0); scene.add(panel);

// barres LED verticales en arc de cercle
const bars = [];
const NB = 36;
for (let i = 0; i < NB; i++) {
  const a = (i / NB) * Math.PI * 2;
  const m = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.6, 0.07), m);
  b.position.set(0.3 + Math.cos(a) * 10, 2.1, Math.sin(a) * 10);
  scene.add(b); bars.push({ m, a, tint: i % 3 === 0 ? COL.ciel : 0xdfe8f5 });
}

// faisceau de brume
const beamMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { k: { value: 0 } },
  vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.); vn = normalize(normalMatrix*normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'uniform float k; varying float vy; varying vec3 vn; varying vec3 vv; void main(){ float f = pow(abs(dot(vn, vv)), 1.6); gl_FragColor = vec4(vec3(0.55,0.65,0.8) * k * f * (0.15 + 0.85*vy) * 0.12, 1.); }',
});
const beam = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 4.2, 4.8, 64, 1, true), beamMat);
beam.position.set(0.3, 2.4, 0); scene.add(beam);

/* ---------------------------------------------------------------- lumières */
const key = new THREE.RectAreaLight(0xffffff, 0, 6, 2.2); key.position.set(0.3, 4.85, 0); key.lookAt(0.3, 0, 0); scene.add(key);
const rimL = new THREE.RectAreaLight(0xcfe0ff, 0, 7, 0.35); rimL.position.set(0.3, 1.3, 5); rimL.lookAt(0.3, 0.4, 0); scene.add(rimL);
const rimR = new THREE.RectAreaLight(0xcfe0ff, 0, 7, 0.35); rimR.position.set(0.3, 1.3, -5); rimR.lookAt(0.3, 0.4, 0); scene.add(rimR);
const front = new THREE.RectAreaLight(0xffffff, 0, 3, 1.2); front.position.set(7.5, 1.6, 0); front.lookAt(0, 0.5, 0); scene.add(front);
const back = new THREE.RectAreaLight(0xffffff, 0, 3, 1.2); back.position.set(-7, 1.6, 0); back.lookAt(0, 0.5, 0); scene.add(back);
const sweep = new THREE.RectAreaLight(0xe6efff, 0, 4, 0.12); scene.add(sweep);
const hemi = new THREE.HemisphereLight(0x8899bb, 0x000000, 0); scene.add(hemi);
const redGlow = new THREE.PointLight(0xff2020, 0, 3, 2); redGlow.position.set(-2.3, 0.4, 0); scene.add(redGlow);

/* ---------------------------------------------------------------- environnement (reflets) */
function makeEnv() {
  const es = new THREE.Scene(); es.background = new THREE.Color(0x010102);
  const em = (w, h, k, c = 0xffffff) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: hdr(c, k), side: THREE.DoubleSide }));
  const p = em(6, 2.2, 6); p.rotation.x = Math.PI / 2; p.position.set(0.3, 4.9, 0); es.add(p);
  for (const s of [1, -1]) { const r = em(7, 0.35, 5, 0xcfe0ff); r.position.set(0.3, 1.3, 5 * s); r.lookAt(0.3, 1.3, 0); es.add(r); }
  for (const x of [7.5, -7]) { const f = em(3, 1.2, 2.5); f.position.set(x, 1.6, 0); f.lookAt(0, 1.6, 0); es.add(f); }
  for (let i = 0; i < NB; i++) { const a = (i / NB) * Math.PI * 2; const b = em(0.12, 3.6, 3, i % 3 === 0 ? COL.ciel : 0xdfe8f5); b.position.set(0.3 + Math.cos(a) * 10, 2.1, Math.sin(a) * 10); b.lookAt(0.3, 2.1, 0); es.add(b); }
  const t = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.06, 8, 128), new THREE.MeshBasicMaterial({ color: hdr(0xffffff, 4) })); t.rotation.x = Math.PI / 2; t.position.set(0.3, 4.8, 0); es.add(t);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(es, 0.02);
  return rt.texture;
}
scene.environment = makeEnv();
scene.environmentIntensity = 0;

/* ---------------------------------------------------------------- post-production */
const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.45, 0.55, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, seed: { value: 0 }, fade: { value: 1 }, box: { value: 0.128 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float seed, fade, box; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + seed) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      vec2 q = vUv - .5; c *= 1. - dot(q*vec2(1.1,1.4), q*vec2(1.1,1.4)) * .9;
      c = mix(c, c * vec3(.96, 1., 1.06), .5);
      c += (h(vUv * 1000.) - .5) * .035;
      c *= fade;
      if (vUv.y < box || vUv.y > 1. - box) c = vec3(0.);
      gl_FragColor = vec4(c, 1.);
    }`,
});
composer.addPass(grade);

/* ---------------------------------------------------------------- outils d'animation */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eio = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const es = (x) => x * x * (3 - 2 * x);
const mix = (a, b, k) => a + (b - a) * k;
const V = (...a) => new THREE.Vector3(...a);
const vmix = (a, b, k) => a.clone().lerp(b, k);
const deg = Math.PI / 180;
const orbit = (tgt, a, r, h) => V(tgt.x + Math.cos(a * deg) * r, h, tgt.z + Math.sin(a * deg) * r);

function lights(s) {
  const d = { key: 0, rims: 0, fronts: 0, bars: 0, barSeq: null, ring: 0, env: 0, beam: 0, red: 0, hemi: 0, sweep: null, exposure: 1, plate: 0, ...s };
  key.intensity = 9 * d.key; panelMat.color.copy(hdr(0xffffff, 3 * d.key));
  rimL.intensity = rimR.intensity = 7 * d.rims;
  front.intensity = 4 * d.fronts; back.intensity = 3 * d.fronts;
  ringMat.color.copy(hdr(0xffffff, 5 * d.ring));
  scene.environmentIntensity = d.env;
  beamMat.uniforms.k.value = d.beam;
  hemi.intensity = 0.25 * d.hemi;
  rimMat.color.copy(hdr(COL.ciel, 4 * d.plate));
  bars.forEach((b, i) => {
    const k = d.barSeq ? d.barSeq(b.a, i) : d.bars;
    b.m.color.copy(hdr(b.tint, 3.2 * k));
  });
  M.red.emissiveIntensity = 6 * d.red; redGlow.intensity = 1.5 * d.red;
  if (d.sweep) { sweep.intensity = d.sweep.k; sweep.position.copy(d.sweep.p); sweep.lookAt(d.sweep.at); sweep.width = d.sweep.w ?? 4; sweep.height = d.sweep.h ?? 0.12; }
  else sweep.intensity = 0;
  renderer.toneMappingExposure = d.exposure;
  beam.visible = !d.noBeam;
}
function shoot(pos, tgt, fov, up = V(0, 1, 0)) {
  camera.up.copy(up); camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(tgt);
}
const blink = (t) => (Math.sin(t * Math.PI * 2 * 2.2) > 0.1 ? 1 : 0.08);
const FULL = { key: 0.8, rims: 1, fronts: 0.8, ring: 1, env: 0.6, beam: 1, bars: 1, hemi: 1, plate: 1, red: 0.6 };

/* ---------------------------------------------------------------- plans */
const C0 = V(0.3, 0.45, 0);
const shots = [
  // 1. silhouette dans le noir
  [0, 3.2, (u, t) => {
    shoot(vmix(V(7.2, 0.7, 4.6), V(6.4, 0.66, 4.0), eio(u)), V(0.2, 0.45, 0), 30);
    lights({ barSeq: (a) => (Math.cos(a - 3.8) > 0.55 ? 0.5 * es(lin(t, 0.4, 2.4)) : 0), env: 0.04 * lin(t, 0.4, 2.4), exposure: 1.2 });
  }],
  // 2. roue avant et aileron, balayage
  [3.2, 5.8, (u) => {
    shoot(vmix(V(3.6, 0.33, 2.05), V(3.25, 0.36, 2.1), u), V(2.35, 0.3, 0.8), 30);
    lights({ env: 0.03, sweep: { k: 40, p: V(mix(5, 0.5, u), 1.1, 2.6), at: V(mix(4.2, 0.2, u), 0.2, 0), w: 2.5 } });
  }],
  // 3. halo et casque
  [5.8, 8.4, (u) => {
    shoot(orbit(V(0.45, 0.82, 0), mix(52, 68, eio(u)), 1.55, 1.42), V(0.45, 0.82, 0), 34);
    lights({ env: 0.03, sweep: { k: 45, p: V(mix(2.2, -1.2, u), 2.2, 1.4), at: V(mix(1.6, -0.6, u), 0.6, 0), w: 3 } });
  }],
  // 4. ponton Phoxia
  [8.4, 11.0, (u) => {
    shoot(V(mix(1.3, -0.2, eio(u)), 0.52, 2.55), V(mix(0.35, -0.1, eio(u)), 0.38, 0.6), 30);
    lights({ env: 0.03, sweep: { k: 50, p: V(mix(-1.8, 2.4, u), 0.9, 2.8), at: V(mix(-1.5, 2.0, u), 0.35, 0), w: 3.2, h: 0.1 } });
  }],
  // 5. aileron arrière, feu de pluie
  [11.0, 13.4, (u, t) => {
    shoot(vmix(V(-3.9, 0.9, 1.9), V(-3.55, 0.82, 1.55), eio(u)), V(-2.05, 0.72, 0.3), 32);
    lights({ env: 0.03, red: blink(t), sweep: { k: 35, p: V(-2.4, mix(2.2, 0.3, u), 2.4), at: V(-2.0, 0.6, 0), w: 3 } });
  }],
  // 6. titre sur noir
  [13.4, 15.8, () => { shoot(V(8, 0.8, 0), C0, 30); lights({ exposure: 0 }); }],
  // 7. révélation : barres LED puis plafonnier
  [15.8, 22.0, (u, t) => {
    shoot(vmix(V(8.8, 0.78, 0.0), V(7.3, 0.72, 0.0), eio(u)), V(0.2, 0.45, 0), 30);
    const on = lin(t, 17.9, 18.15);
    const seq = (a) => { const off = Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))); return es(lin(t, 16.0 + off * 0.45, 16.25 + off * 0.45)); };
    const flash = Math.exp(-Math.max(0, t - 17.95) * 5) * on;
    lights({ barSeq: seq, env: mix(0.06, 0.6, on), key: on * (0.8 + flash), rims: on, fronts: 0.8 * on, ring: on * (1 + 2 * flash), beam: on, hemi: on, plate: lin(t, 18.1, 18.8), red: on * 0.6, exposure: 1 + flash * 0.6 });
  }],
  // 8. orbite
  [22.0, 28.0, (u) => { shoot(orbit(C0, mix(35, 150, eio(u)), 6.6, mix(1.3, 1.7, u)), C0, 34); lights(FULL); }],
  // 9. vue du dessus
  [28.0, 32.0, (u) => {
    const a = mix(0, 35, eio(u)) * deg;
    shoot(V(0.3, mix(11, 9.6, eio(u)), 0.001), V(0.3, 0, 0), 38, V(Math.cos(a), 0, Math.sin(a)));
    lights({ ...FULL, noBeam: true });
  }],
  // 10. travelling latéral au ras du sol
  [32.0, 36.0, (u) => { const x = mix(-3.4, 3.6, eio(u)); shoot(V(x, 0.3, 3.1), V(x - 0.4, 0.42, 0), 36); lights(FULL); }],
  // 11. trois-quarts avant héroïque
  [36.0, 40.0, (u) => { shoot(orbit(V(0.6, 0.45, 0), mix(28, 14, eio(u)), mix(5.4, 4.9, u), 0.42), V(0.6, 0.5, 0), 28); lights(FULL); }],
  // 12. trois-quarts arrière, feu de pluie
  [40.0, 44.0, (u, t) => { shoot(orbit(V(-0.4, 0.5, 0), mix(198, 214, eio(u)), 5.2, 0.55), V(-0.4, 0.55, 0), 30); lights({ ...FULL, red: blink(t) }); }],
  // 13. plan final qui s'élève
  [44.0, 48.4, (u) => { shoot(orbit(C0, mix(40, 58, eio(u)), mix(7.8, 9.6, eio(u)), mix(1.1, 3.3, eio(u))), C0, 32); lights(FULL); }],
  // 14. carte de fin
  [48.4, 52.0, () => { shoot(orbit(C0, 58, 9.6, 3.3), C0, 32); lights({ ...FULL, exposure: 0 }); }],
];
export const DURATION = 52;

/* ---------------------------------------------------------------- textes */
const $ = (id) => document.getElementById(id);
function show(id, o, dy = 0) { const e = $(id); e.style.opacity = o; e.style.transform = `translateY(${dy}px)`; }
function overlay(t) {
  const tt = lin(t, 13.6, 14.3) * (1 - lin(t, 15.3, 15.75));
  show('title', tt, 18 * (1 - es(lin(t, 13.6, 14.4))));
  $('title-name').style.letterSpacing = mix(0.5, 0.32, es(lin(t, 13.6, 15.6))) + 'em';
  const f = lin(t, 45.0, 45.8) * (1 - lin(t, 48.0, 48.4));
  show('final', f, 14 * (1 - es(lin(t, 45.0, 46.0))));
  const e = lin(t, 48.6, 49.2);
  $('end').style.opacity = e;
  document.querySelectorAll('#end .p').forEach((p, i) => { const k = es(lin(t, 49.2 + i * 0.09, 49.7 + i * 0.09)); p.style.opacity = k; p.style.transform = `translateY(${16 * (1 - k)}px)`; });
  $('fadeout').style.opacity = lin(t, 51.3, 52);
}

window.renderAt = (t, frame) => {
  for (const [a, b, f] of shots) if (t >= a && t < b) { f((t - a) / (b - a), t); break; }
  // fondus au noir entre certains plans
  const cuts = [3.2, 5.8, 8.4, 11.0, 13.4];
  let fade = 1;
  for (const c of cuts) fade = Math.min(fade, clamp(Math.abs(t - c) / 0.18));
  fade = Math.min(fade, lin(t, 0.0, 0.6), 1 - lin(t, 47.9, 48.4) * 0);
  grade.uniforms.fade.value = fade;
  grade.uniforms.seed.value = (frame % 97) * 1.37;
  overlay(t);
  composer.render();
};
window.READY = true;
