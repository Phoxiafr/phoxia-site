/* Phoxia : interactions du site.
   Rideau de transition, défilement fluide (Lenis s'il est chargé), curseur viseur,
   fiches d'aperçu au survol, radar, réseau de points, protocole horizontal,
   missions empilées, tiroir de détail, formulaire. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var LOGO_ANIME = '<svg class="logo-anime" viewBox="0 0 139.03 102.15" aria-hidden="true"><path class="logo-anime__b1" d="M0 102.15h34.05L53.91 68.1H19.86z"/><path class="logo-anime__b2" d="M42.56 68.1h34.05l19.86-34.05H62.42z"/><path class="logo-anime__b3" d="M85.12 34.05h34.05L139.03 0h-34.05z"/></svg>';
  var borne = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Rideau de transition entre les pages ---------- */
  var rideau = document.createElement('div');
  rideau.className = 'rideau'; rideau.setAttribute('aria-hidden', 'true');
  rideau.innerHTML = '<span></span><span></span><span></span><div class="rideau__chargeur">' + LOGO_ANIME + '</div>';
  document.body.appendChild(rideau);
  try {
    if (!reduit && sessionStorage.getItem('phoxia-rideau') === '1') {
      sessionStorage.removeItem('phoxia-rideau');
      rideau.setAttribute('data-etat', 'sortie');
      setTimeout(function () { rideau.removeAttribute('data-etat'); }, 950);
    }
  } catch (e) {}
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || reduit || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    try { sessionStorage.setItem('phoxia-rideau', '1'); } catch (er) {}
    rideau.setAttribute('data-etat', 'entree');
    setTimeout(function () { location.href = url.href; }, 450);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) rideau.removeAttribute('data-etat'); });

  /* ---------- Défilement fluide ---------- */
  var lenis = null;
  if (!reduit && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    (function boucle(t) { lenis.raf(t); requestAnimationFrame(boucle); })(0);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    var cible = document.querySelector(url.hash);
    if (!cible) return;
    e.preventDefault(); fermerMenu();
    if (lenis) lenis.scrollTo(cible, { offset: -70 }); else cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth' });
    history.replaceState(null, '', url.hash);
  });

  /* ---------- En-tête, progression ---------- */
  var entete = document.querySelector('[data-entete]');
  var barre = document.querySelector('[data-progression]');
  var dernierY = 0;
  var surDefile = function () {
    var y = window.scrollY;
    if (entete) entete.setAttribute('data-etat', y < 40 ? 'haut' : (y > dernierY && y > 500 && !document.body.classList.contains('menu-ouvert') ? 'cache' : 'defile'));
    if (barre) { var m = doc.scrollHeight - innerHeight; barre.style.transform = 'scaleX(' + (m > 0 ? y / m : 0) + ')'; }
    dernierY = y;
  };
  addEventListener('scroll', surDefile, { passive: true }); surDefile();

  /* ---------- Menu mobile ---------- */
  var bascule = document.querySelector('[data-bascule-menu]');
  var menu = document.querySelector('[data-menu-mobile]');
  function fermerMenu() {
    if (!menu || menu.getAttribute('data-ouvert') !== 'true') return;
    menu.setAttribute('data-ouvert', 'false'); bascule.setAttribute('aria-expanded', 'false'); bascule.textContent = 'Menu';
    document.body.classList.remove('menu-ouvert'); if (lenis) lenis.start();
  }
  if (bascule && menu) {
    bascule.addEventListener('click', function () {
      if (menu.getAttribute('data-ouvert') === 'true') return fermerMenu();
      menu.setAttribute('data-ouvert', 'true'); bascule.setAttribute('aria-expanded', 'true'); bascule.textContent = 'Fermer';
      document.body.classList.add('menu-ouvert'); if (lenis) lenis.stop();
    });
  }

  /* ---------- Titres mot à mot ---------- */
  document.querySelectorAll('[data-titre-anime]').forEach(function (titre) {
    var i = 0;
    (function decouper(noeud) {
      Array.prototype.slice.call(noeud.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (m) {
            if (!m) return;
            if (/^\s+$/.test(m)) { f.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'mot';
            var s = document.createElement('span'); s.textContent = m; s.style.setProperty('--i', i++);
            o.appendChild(s); f.appendChild(o);
          });
          noeud.replaceChild(f, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') decouper(n);
      });
    })(titre);
  });

  /* ---------- Texte brouillé (repères) ---------- */
  var SIGNES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/+-';
  var brouiller = function (el) {
    if (reduit || el._brouille || el.children.length) return;
    var final = el.getAttribute('data-texte') || el.textContent;
    el.setAttribute('data-texte', final); el._brouille = true;
    var n = 0, total = 16;
    var pas = function () {
      n++;
      el.textContent = final.split('').map(function (c, i) {
        if (c === ' ' || i < (n / total) * final.length) return c;
        return SIGNES[Math.floor(Math.random() * SIGNES.length)];
      }).join('');
      if (n < total) requestAnimationFrame(pas); else { el.textContent = final; el._brouille = false; }
    };
    pas();
  };
  document.querySelectorAll('.nav__lien, [data-brouille]').forEach(function (el) {
    var cible = el.querySelector('[data-brouille-texte]') || el;
    el.addEventListener('mouseenter', function () { brouiller(cible); });
  });

  /* ---------- Apparitions ---------- */
  var obs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add(el.hasAttribute('data-titre-anime') ? 'titre-pret' : 'visible');
      if (el.classList.contains('repere')) brouiller(el);
      obs.unobserve(el);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' }) : null;
  document.querySelectorAll('[data-reveler], [data-titre-anime], .repere, .capitaine').forEach(function (el) {
    if (obs) obs.observe(el); else el.classList.add('visible', 'titre-pret');
  });

  /* ---------- Compteurs ---------- */
  var obsC = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, v = parseFloat(el.getAttribute('data-compteur')), suf = el.getAttribute('data-suffixe') || '';
      var t0 = performance.now(), d = reduit ? 1 : 1700;
      (function pas(t) { var p = Math.min(1, (t - t0) / d), k = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(v * k).toLocaleString('fr-FR') + suf; if (p < 1) requestAnimationFrame(pas); })(t0);
      obsC.unobserve(el);
    });
  }, { threshold: .6 }) : null;
  document.querySelectorAll('[data-compteur]').forEach(function (el) { if (obsC) obsC.observe(el); });

  /* ---------- Tiroir de détail ---------- */
  var tiroir = document.querySelector('[data-tiroir]');
  var dernierFocus = null;
  var ouvrirTiroir = function (id) {
    var tpl = document.getElementById(id); if (!tiroir || !tpl) return;
    var zone = tiroir.querySelector('[data-tiroir-contenu]'); zone.innerHTML = ''; zone.appendChild(tpl.content.cloneNode(true));
    dernierFocus = document.activeElement;
    tiroir.setAttribute('data-ouvert', 'true'); tiroir.setAttribute('aria-hidden', 'false');
    tiroir.querySelector('.tiroir__panneau').scrollTop = 0;
    if (lenis) lenis.stop(); document.body.style.overflow = 'hidden';
    setTimeout(function () { tiroir.querySelector('.tiroir__fermer').focus(); }, 80);
  };
  var fermerTiroir = function () {
    if (!tiroir || tiroir.getAttribute('data-ouvert') !== 'true') return;
    tiroir.setAttribute('data-ouvert', 'false'); tiroir.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start(); document.body.style.overflow = '';
    if (dernierFocus) dernierFocus.focus({ preventScroll: true });
  };
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-ouvrir]');
    if (o) { e.preventDefault(); masquerFiche(); ouvrirTiroir(o.getAttribute('data-ouvrir')); return; }
    if (e.target.closest('[data-fermer]')) fermerTiroir();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermerTiroir(); fermerMenu(); } });
  if (location.hash) {
    var d = document.querySelector('[data-ouvrir="detail-' + location.hash.slice(1) + '"]');
    if (d) setTimeout(function () { ouvrirTiroir('detail-' + location.hash.slice(1)); }, 700);
  }

  /* ---------- Onglets des formations ---------- */
  document.querySelectorAll('[data-onglets]').forEach(function (bloc) {
    var boutons = bloc.querySelectorAll('[data-filtre]');
    var lignes = document.querySelectorAll(bloc.getAttribute('data-onglets'));
    boutons.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filtre');
        boutons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        lignes.forEach(function (l, i) {
          var ok = f === 'tout' || l.getAttribute('data-niveau') === f;
          l.hidden = !ok;
          if (ok && !reduit) { l.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: i * 30, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }); }
        });
        if (lenis) lenis.resize();
      });
    });
  });

  /* ---------- Traversée : défilement horizontal + route ---------- */
  var traversee = document.querySelector('[data-traversee]');
  var majTraversee = null;
  if (traversee) {
    var piste = traversee.querySelector('.traversee__piste');
    var route = traversee.querySelector('.traversee__route');
    var chemin = null, sillage = null, bateau = null, longueur = 0;
    var actif = function () { return !reduit && innerWidth > 860; };
    var construire = function () {
      if (!actif()) return;
      var escales = piste.querySelectorAll('.escale');
      var L = piste.scrollWidth, H = piste.offsetHeight, r0 = piste.getBoundingClientRect();
      var pts = Array.prototype.map.call(escales, function (e) { var r = e.getBoundingClientRect(); return [r.left - r0.left + 40, r.top - r0.top]; });
      var d = 'M 0 ' + (H / 2);
      var px = 0, py = H / 2;
      pts.forEach(function (p) { var mx = (px + p[0]) / 2; d += ' C ' + mx + ' ' + py + ', ' + mx + ' ' + p[1] + ', ' + p[0] + ' ' + p[1]; px = p[0]; py = p[1]; });
      d += ' C ' + (px + 150) + ' ' + py + ', ' + (L - 150) + ' ' + (H / 2) + ', ' + L + ' ' + (H / 2);
      route.setAttribute('width', L); route.setAttribute('height', H); route.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
      route.innerHTML = '<path d="' + d + '" stroke="rgba(233,238,245,.1)" stroke-width="1" fill="none"/>' +
        '<path class="sillage" d="' + d + '" stroke="#5ba3dd" stroke-width="2" fill="none" style="filter:drop-shadow(0 0 6px #5ba3dd)"/>' +
        '<g class="bateau-svg"><circle r="22" fill="rgba(91,163,221,.12)"/><circle r="11" fill="rgba(140,200,242,.35)"/><circle r="5" fill="#e9eef5"/></g>';
      chemin = route.querySelector('path'); sillage = route.querySelector('.sillage'); bateau = route.querySelector('.bateau-svg');
      longueur = sillage.getTotalLength();
      sillage.style.strokeDasharray = longueur; sillage.style.strokeDashoffset = longueur;
    };
    majTraversee = function () {
      if (!actif()) { piste.style.transform = ''; return; }
      var r = traversee.getBoundingClientRect();
      var p = borne(-r.top / (traversee.offsetHeight - innerHeight), 0, 1);
      var dep = piste.scrollWidth - innerWidth + 80;
      piste.style.transform = 'translate3d(' + (-p * dep) + 'px,0,0)';
      if (sillage) {
        sillage.style.strokeDashoffset = longueur * (1 - p);
        var pt = sillage.getPointAtLength(longueur * p);
                bateau.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      }
    };
    var init = function () { piste.style.transform = ''; construire(); majTraversee(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else init();
    addEventListener('resize', init);
    addEventListener('scroll', majTraversee, { passive: true });
  }


  /* ---------- Réseau de points lumineux qui réagit au curseur ---------- */
  document.querySelectorAll('[data-carte]').forEach(function (toile) {
    if (reduit) return;
    var ctx = toile.getContext('2d'), L = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), pts = [], visible = true;
    var souris = { x: -9999, y: -9999 };
    var taille = function () {
      L = toile.offsetWidth; H = toile.offsetHeight; toile.width = L * dpr; toile.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(110, Math.round(L * H / 13000)); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * L, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.4 + .6 });
    };
    taille(); addEventListener('resize', taille);
    var zone = toile.parentElement;
    zone.addEventListener('pointermove', function (e) { var r = toile.getBoundingClientRect(); souris.x = e.clientX - r.left; souris.y = e.clientY - r.top; });
    zone.addEventListener('pointerleave', function () { souris.x = souris.y = -9999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(toile);
    (function dessiner() {
      requestAnimationFrame(dessiner);
      if (!visible) return;
      ctx.clearRect(0, 0, L, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], dx = souris.x - a.x, dy = souris.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200) { a.x += dx * .006; a.y += dy * .006; }
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > L) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j], ex = a.x - b.x, ey = a.y - b.y, e2 = ex * ex + ey * ey;
          if (e2 < 16000) { ctx.strokeStyle = 'rgba(91,163,221,' + ((1 - e2 / 16000) * .2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        var proche = d < 200;
        if (proche) { ctx.strokeStyle = 'rgba(140,200,242,' + ((1 - d / 200) * .55) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(souris.x, souris.y); ctx.stroke(); }
        ctx.fillStyle = proche ? 'rgba(200,230,255,.95)' : 'rgba(140,200,242,.5)';
        ctx.shadowColor = '#5ba3dd'; ctx.shadowBlur = proche ? 10 : 0;
        ctx.beginPath(); ctx.arc(a.x, a.y, proche ? a.r + 1 : a.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    })();
  });

  /* ---------- Radar : le faisceau suit le curseur ---------- */
  var boussole = document.querySelector('[data-boussole]');
  var aiguille = boussole && boussole.querySelector('.boussole__aiguille');
  var cap = boussole && boussole.querySelector('[data-cap]');
  var angle = 0, angleCible = 0;
    if (boussole && !reduit) {
    addEventListener('pointermove', function (e) {
      var r = boussole.getBoundingClientRect();
      var a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
      var diff = ((a - angleCible) % 360 + 540) % 360 - 180; angleCible += diff;
    }, { passive: true });
    addEventListener('scroll', function () { if (!fin) angleCible = scrollY * .25; }, { passive: true });
    (function tourner() {
      angle = lerp(angle, angleCible, .07);
      aiguille.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' 200 200)');
      if (cap) { var deg = ((Math.round(angle) % 360) + 360) % 360; cap.textContent = 'SCAN ' + String(deg).padStart(3, '0') + '° · SIGNAL OK'; }
      requestAnimationFrame(tourner);
    })();
  }

  /* ---------- Curseur viseur, fiches, aimants (pointeur fin uniquement) ---------- */
  var fiche = null, ficheVisible = false, minuterie = null;
  function masquerFiche() { clearTimeout(minuterie); if (fiche) fiche.setAttribute('data-visible', 'false'); ficheVisible = false; }

  if (fin && !reduit) {
    doc.classList.add('viseur-actif');
    var viseur = document.createElement('div'); viseur.className = 'viseur'; viseur.innerHTML = '<i></i><i></i><i></i><i></i>';
    var point = document.createElement('div'); point.className = 'viseur-point';
    var etiquette = document.createElement('div'); etiquette.className = 'viseur-etiquette';
    fiche = document.createElement('div'); fiche.className = 'fiche';
    [viseur, point, etiquette, fiche].forEach(function (el) { el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); });

    var mx = innerWidth / 2, my = innerHeight / 2;
    var v = { x: mx, y: my, w: 34, h: 34 }, cible = null, fx = mx, fy = my;
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; point.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; }, { passive: true });
    document.addEventListener('pointerleave', function () { viseur.style.opacity = point.style.opacity = 0; masquerFiche(); });
    document.addEventListener('pointerenter', function () { viseur.style.opacity = point.style.opacity = ''; });

    var cadrable = function (el) { var r = el.getBoundingClientRect(); return r.width < 420 && r.height < 120; };
    document.addEventListener('pointerover', function (e) {
      var lien = e.target.closest('a, button, label, select, [data-curseur]');
      cible = lien && cadrable(lien) ? lien : null;
      viseur.setAttribute('data-cible', lien ? 'oui' : 'non');
      var lab = e.target.closest('[data-curseur]');
      if (lab) { etiquette.textContent = lab.getAttribute('data-curseur'); etiquette.setAttribute('data-visible', 'true'); }
      else etiquette.setAttribute('data-visible', 'false');
      var src = e.target.closest('[data-apercu]');
      if (src && !src.contains(e.relatedTarget)) {
        var tpl = document.getElementById('apercu-' + src.getAttribute('data-apercu'));
        if (tpl) {
          clearTimeout(minuterie);
          minuterie = setTimeout(function () { fiche.innerHTML = ''; fiche.appendChild(tpl.content.cloneNode(true)); fiche.setAttribute('data-visible', 'true'); ficheVisible = true; }, 80);
        }
      }
    });
    document.addEventListener('pointerout', function (e) {
      var src = e.target.closest('[data-apercu]');
      if (src && !src.contains(e.relatedTarget)) masquerFiche();
      var lien = e.target.closest('a, button, label, select, [data-curseur]');
      if (lien && !lien.contains(e.relatedTarget)) { cible = null; viseur.setAttribute('data-cible', 'non'); etiquette.setAttribute('data-visible', 'false'); }
    });
    addEventListener('scroll', function () { cible = null; }, { passive: true });
    addEventListener('pointerdown', function () { v.w *= .8; v.h *= .8; });

    (function anim() {
      var tx, ty, tw, th;
      if (cible) { var r = cible.getBoundingClientRect(); tx = r.left - 6; ty = r.top - 6; tw = r.width + 12; th = r.height + 12; }
      else { tw = th = 34; tx = mx - 17; ty = my - 17; }
      v.x = lerp(v.x, tx, .22); v.y = lerp(v.y, ty, .22); v.w = lerp(v.w, tw, .2); v.h = lerp(v.h, th, .2);
      viseur.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px)'; viseur.style.width = v.w + 'px'; viseur.style.height = v.h + 'px';
      etiquette.style.transform = 'translate(' + (mx + 18) + 'px,' + (my + 18) + 'px)';
      var w = fiche.offsetWidth, h = fiche.offsetHeight, gx = mx + 34, gy = my - h / 2;
      if (gx + w > innerWidth - 14) gx = mx - w - 34;
      gy = borne(gy, 14, innerHeight - h - 14);
      fx = lerp(fx, gx, .13); fy = lerp(fy, gy, .13);
      fiche.style.left = fx + 'px'; fiche.style.top = fy + 'px';
      requestAnimationFrame(anim);
    })();

    document.querySelectorAll('[data-aimant]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--x', ((e.clientX - r.left - r.width / 2) * .25) + 'px');
        el.style.setProperty('--y', ((e.clientY - r.top - r.height / 2) * .35) + 'px');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--x', '0px'); el.style.setProperty('--y', '0px'); });
    });
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.querySelector('[data-formulaire-contact]');
  if (form) {
    var zoneMsg = form.querySelector('[data-message-formulaire]');
    var envoi = form.querySelector('[type="submit"]');
    var dire = function (t, k) { zoneMsg.textContent = t; zoneMsg.setAttribute('data-type', k); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var piege = form.querySelector('[name="_gotcha"]'); if (piege && piege.value) return;
      var action = form.getAttribute('action') || '';
      if (action.indexOf('formspree.io/f/') === -1) {
        var lignes = []; new FormData(form).forEach(function (val, cle) { if (cle.charAt(0) !== '_' && val) lignes.push(cle + ' : ' + val); });
        location.href = 'mailto:mathieu@phoxia.fr?subject=' + encodeURIComponent('Demande depuis phoxia.fr') + '&body=' + encodeURIComponent(lignes.join('\n'));
        return;
      }
      envoi.disabled = true; envoi.classList.add('en-chargement'); dire('Envoi en cours…', 'info');
      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); dire('Message bien reçu. Réponse sous 48 heures ouvrées.', 'succes'); })
        .catch(function () { dire("L'envoi n'a pas abouti. Écrivez directement à mathieu@phoxia.fr.", 'erreur'); })
        .then(function () { envoi.disabled = false; envoi.classList.remove('en-chargement'); });
    });
  }

  /* ---------- Illustrations : dévoilement et parallaxe ---------- */
  var illus = document.querySelectorAll('[data-parallaxe]');
  if (illus.length) {
    var obsI = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dans-vue'); obsI.unobserve(e.target); } });
    }, { threshold: .2 }) : null;
    illus.forEach(function (el) { if (obsI) obsI.observe(el); else el.classList.add('dans-vue'); });
    var majP = function () {
      if (reduit) return;
      illus.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.setProperty('--p', (-10 + k * -12).toFixed(2) + '%');
      });
    };
    addEventListener('scroll', majP, { passive: true }); majP();
  }

  /* ---------- Loader Phoxia sur les images en cours de chargement ---------- */
  document.querySelectorAll('.illustration img, .profil__photo img, .orbite__photo img, .projet__scene img').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    var cadre = img.parentElement;
    var l = document.createElement('span'); l.className = 'chargeur-image'; l.innerHTML = LOGO_ANIME;
    cadre.classList.add('charge-image'); cadre.appendChild(l);
    var fini = function () { cadre.classList.add('image-prete'); setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l); }, 600); };
    img.addEventListener('load', fini); img.addEventListener('error', fini);
  });
  var envoiBtn = document.querySelector('[data-formulaire-contact] [type="submit"]');
  if (envoiBtn) { var lb = document.createElement('span'); lb.className = 'bouton-chargeur'; lb.innerHTML = LOGO_ANIME; envoiBtn.appendChild(lb); }

  document.querySelectorAll('[data-annee]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
