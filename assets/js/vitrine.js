/* Phoxia : page d'accueil.
   Écran de chargement, logo Phoxia en 3D (Three.js), texte géant défilant,
   mur de projets qui défile et réagit à la vitesse du défilement. */
(function () {
  'use strict';

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scene = document.querySelector('[data-scene]');
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- Vitesse de défilement partagée ---------- */
  var vitesse = 0, dernierY = window.scrollY;
  (function mesurer() {
    var y = window.scrollY;
    vitesse = lerp(vitesse, y - dernierY, 0.15);
    dernierY = y;
    requestAnimationFrame(mesurer);
  })();

  /* ---------- Écran de chargement ---------- */
  var chargeur = document.querySelector('[data-chargeur]');
  var lancer = function () { if (scene) scene.classList.add('lancee'); demarrerIntro(); };
  var dejaVu = false;
  try { dejaVu = sessionStorage.getItem('phoxia-vu') === '1'; sessionStorage.setItem('phoxia-vu', '1'); } catch (e) {}
  if (!chargeur || reduit || dejaVu) {
    if (chargeur) chargeur.hidden = true;
    setTimeout(lancer, 80);
  } else {
    var compte = chargeur.querySelector('[data-compte]'), trait = chargeur.querySelector('.chargeur__ligne i');
    var t0 = performance.now(), duree = 1700;
    (function avancer(t) {
      var p = Math.min(1, (t - t0) / duree), k = 1 - Math.pow(1 - p, 3);
      compte.textContent = String(Math.round(k * 100)).padStart(3, '0') + ' %';
      trait.style.transform = 'scaleX(' + k + ')';
      if (p < 1) return requestAnimationFrame(avancer);
      chargeur.classList.add('sortie');
      setTimeout(lancer, 250);
      setTimeout(function () { chargeur.hidden = true; }, 1100);
    })(t0);
  }

  /* ---------- Texte géant ---------- */
  var geant = document.querySelector('[data-geant]');
  if (geant) {
    var x = 0;
    (function boucle() {
      var moitie = geant.scrollWidth / 2;
      if (!reduit) x -= 0.6 + Math.abs(vitesse) * 0.35;
      if (x <= -moitie) x += moitie;
      var p = Math.min(1, window.scrollY / window.innerHeight);
      geant.style.transform = 'translate3d(' + x + 'px,' + (p * -60) + 'px,0)';
      requestAnimationFrame(boucle);
    })();
  }

  /* ---------- Mur de projets ---------- */
  var mur = document.querySelector('[data-mur]');
  if (mur) {
    var rangs = Array.prototype.map.call(mur.querySelectorAll('.mur__rang'), function (r) {
      return { el: r, piste: r.querySelector('.mur__piste'), sens: parseFloat(r.getAttribute('data-sens')), x: 0, frein: 1, vise: 1 };
    });
    rangs.forEach(function (r) {
      r.el.addEventListener('pointerenter', function () { r.vise = 0.12; });
      r.el.addEventListener('pointerleave', function () { r.vise = 1; });
      if (r.sens > 0) r.x = -r.piste.scrollWidth / 2;
    });
    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(mur);
    (function animer() {
      requestAnimationFrame(animer);
      if (!visible) return;
      var r0 = mur.getBoundingClientRect();
      var entree = Math.max(0, Math.min(1, 1 - (r0.top / window.innerHeight)));
      var incl = reduit ? 0 : 14 * (1 - entree) + Math.max(-6, Math.min(6, vitesse * 0.25));
      rangs.forEach(function (r) {
        r.frein = lerp(r.frein, r.vise, 0.08);
        var moitie = r.piste.scrollWidth / 2;
        if (!reduit) r.x += r.sens * (0.7 + Math.abs(vitesse) * 0.45) * r.frein;
        if (r.x <= -moitie) r.x += moitie;
        if (r.x > 0) r.x -= moitie;
        var penche = reduit ? 0 : Math.max(-8, Math.min(8, vitesse * 0.3)) * r.sens;
        r.piste.style.transform = 'translate3d(' + r.x + 'px,0,0) skewX(' + (-penche) + 'deg)';
        r.el.style.setProperty('--incl', incl.toFixed(2) + 'deg');
      });
    })();
  }

  /* ---------- Logo Phoxia en 3D ---------- */
  var toile = document.querySelector('[data-logo3d]');
  var intro = { t: -1 };
  function demarrerIntro() { intro.t = performance.now(); }

  var webgl = (function () { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } })();
  if (!toile || !window.THREE || !webgl || reduit) { if (scene) scene.classList.add('sans-3d'); return; }

  var THREE = window.THREE;
  var rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  rendu.outputEncoding = THREE.sRGBEncoding;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;
  var monde = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);
  camera.position.set(0, 0, 520);

  // Reflets de studio : une carte d'environnement dessinée à la main
  var c = document.createElement('canvas'); c.width = 512; c.height = 256;
  var g = c.getContext('2d');
  var fond = g.createLinearGradient(0, 0, 0, 256); fond.addColorStop(0, '#0d2340'); fond.addColorStop(.5, '#05070b'); fond.addColorStop(1, '#0a1626');
  g.fillStyle = fond; g.fillRect(0, 0, 512, 256);
  [[70, 40, 120, 30, '#ffffff'], [330, 60, 140, 24, '#cfe6ff'], [200, 190, 160, 20, '#5ba3dd'], [440, 150, 60, 50, '#8cc8f2']].forEach(function (l) {
    var gr = g.createRadialGradient(l[0] + l[2] / 2, l[1] + l[3] / 2, 2, l[0] + l[2] / 2, l[1] + l[3] / 2, l[2] / 1.4);
    gr.addColorStop(0, l[4]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(l[0] - 40, l[1] - 40, l[2] + 80, l[3] + 80);
  });
  var texEnv = new THREE.CanvasTexture(c); texEnv.mapping = THREE.EquirectangularReflectionMapping; texEnv.encoding = THREE.sRGBEncoding;
  var pmrem = new THREE.PMREMGenerator(rendu);
  monde.environment = pmrem.fromEquirectangular(texEnv).texture;

  monde.add(new THREE.AmbientLight(0xffffff, 0.12));
  var cle = new THREE.DirectionalLight(0xffffff, 1.1); cle.position.set(420, 320, 160); monde.add(cle);
  var bleu = new THREE.PointLight(0x5ba3dd, 2.2, 1400); bleu.position.set(-320, -80, 260); monde.add(bleu);
  var cyan = new THREE.PointLight(0x8cc8f2, 0.9, 1400); cyan.position.set(340, 160, -120); monde.add(cyan);

  // Les trois barres du symbole Phoxia (coordonnées exactes du logo)
  var BARRES = [
    { pts: [[0, 102.15], [34.05, 102.15], [53.91, 68.1], [19.86, 68.1]], couleur: 0x5ba3dd },
    { pts: [[42.56, 68.1], [76.61, 68.1], [96.47, 34.05], [62.42, 34.05]], couleur: 0x1c6ba8 },
    { pts: [[85.12, 34.05], [119.17, 34.05], [139.03, 0], [104.98, 0]], couleur: 0x183463 }
  ];
  var groupe = new THREE.Group(); monde.add(groupe);
  var pieces = BARRES.map(function (b, i) {
    var forme = new THREE.Shape();
    b.pts.forEach(function (p, k) { var px = p[0] - 69.5, py = -(p[1] - 51.07); if (k) forme.lineTo(px, py); else forme.moveTo(px, py); });
    var geo = new THREE.ExtrudeGeometry(forme, { depth: 16, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.2, bevelSegments: 5, curveSegments: 4 });
    geo.translate(0, 0, -8);
    geo.computeBoundingBox();
    var centre = new THREE.Vector3(); geo.boundingBox.getCenter(centre); geo.translate(-centre.x, -centre.y, 0);
    var mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(b.couleur).convertSRGBToLinear(), metalness: 0.15, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 0.7 });
    var m = new THREE.Mesh(geo, mat);
    var pivot = new THREE.Group(); pivot.position.copy(centre); pivot.add(m); groupe.add(pivot);
    return { pivot: pivot, base: centre.clone(), depart: new THREE.Vector3((i - 1) * 420, (1 - i) * 260, 300 - i * 120), rotDep: (i - 1) * 2.2 };
  });

  var souris = { x: 0, y: 0, tx: 0, ty: 0 }, ecart = 0;
  window.addEventListener('pointermove', function (e) { souris.tx = e.clientX / window.innerWidth * 2 - 1; souris.ty = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });

  var echelle = 1;
  var taille = function () {
    var w = toile.clientWidth, h = toile.clientHeight;
    rendu.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    var visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), visW = visH * camera.aspect;
    echelle = Math.min(visW * (w < 860 ? 0.62 : 0.34), visH * 0.5) / 139;
  };
  taille(); window.addEventListener('resize', taille);

  var actif = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { actif = e[0].isIntersecting; }).observe(toile);
  var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
  var horloge = new THREE.Clock();

  (function rendre() {
    requestAnimationFrame(rendre);
    if (!actif) return;
    var t = horloge.getElapsedTime();
    souris.x = lerp(souris.x, souris.tx, 0.06); souris.y = lerp(souris.y, souris.ty, 0.06);
    var d = Math.sqrt(souris.x * souris.x + souris.y * souris.y);
    ecart = lerp(ecart, d < 0.45 ? 1 - d / 0.45 : 0, 0.06);
    var p = Math.min(1.4, window.scrollY / window.innerHeight);

    pieces.forEach(function (pc, i) {
      var k = intro.t < 0 ? 0 : ease(Math.min(1, Math.max(0, (performance.now() - intro.t - i * 140) / 1600)));
      var cible = pc.base.clone();
      cible.z += (i - 1) * 46 * ecart + Math.sin(t * 1.4 + i) * 3;
      cible.x += (i - 1) * 14 * ecart;
      cible.y += (1 - i) * 10 * ecart;
      pc.pivot.position.set(lerp(pc.depart.x, cible.x, k), lerp(pc.depart.y, cible.y, k), lerp(pc.depart.z, cible.z, k));
      pc.pivot.rotation.set((1 - k) * pc.rotDep, (1 - k) * pc.rotDep * 1.3 + ecart * (i - 1) * 0.25, 0);
    });

    groupe.scale.setScalar(echelle * (1 - p * 0.25));
    groupe.position.y = 18 + Math.sin(t * 0.9) * 6 + p * 140;
    groupe.rotation.y = souris.x * 0.55 + Math.sin(t * 0.35) * 0.18 + p * 1.6;
    groupe.rotation.x = souris.y * 0.32 - 0.08 + p * 0.4;
    groupe.rotation.z = -souris.x * 0.06;
    toile.style.opacity = String(Math.max(0, 1 - p * 0.9));
    rendu.render(monde, camera);
  })();
})();
