/* Minubu : service worker (carte consultable hors connexion) */
var VERSION = 'minubu-v1';
var FICHIERS = [
  './', 'index.html', 'carte.html', 'atelier.html', 'cadeaux.html', 'fidelite.html', 'evenements.html', 'commande.html', 'suivi.html', 'mentions.html',
  'assets/css/minubu.css', 'assets/js/config.js', 'assets/js/menu-data.js', 'assets/js/art.js', 'assets/js/app.js',
  'assets/js/accueil.js', 'assets/js/carte.js', 'assets/js/atelier.js', 'assets/js/cadeaux.js', 'assets/js/fidelite.js',
  'assets/js/evenements.js', 'assets/js/commande.js', 'assets/js/suivi.js', 'assets/img/icone.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Réseau d'abord (contenu toujours frais), cache en secours. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copie = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copie); });
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
