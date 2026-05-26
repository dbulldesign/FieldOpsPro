// FieldOps Pro — Service Worker
var CACHE_NAME = 'fieldops-v15';

var PRECACHE_URLS = [
  self.registration.scope,
  self.registration.scope + 'index.html',
  self.registration.scope + 'manifest.json',
  self.registration.scope + 'etc-docs.js',
  self.registration.scope + 'lutron-docs.js',
  self.registration.scope + 'arch-fixtures-docs.js',
  self.registration.scope + 'qtl-docs.js',
  self.registration.scope + 'tools-new.js'
];

var FIREBASE_URLS = [
  'https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore-compat.js'
];

self.addEventListener('install', function(e) {
  // No skipWaiting — let the SW wait until all tabs are closed before
  // activating. This prevents mid-session re-navigation on iOS PWA which
  // causes the Safari toolbar to reappear.
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).then(function() {
        // Cache Firebase SDK and fonts — failures are non-fatal
        var extras = FIREBASE_URLS.concat([
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap'
        ]);
        return Promise.all(extras.map(function(url) {
          return cache.add(url).catch(function() {});
        }));
      });
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); })
      );
    })
  );
});

// Requests that should ALWAYS go to the network (real-time data)
var NETWORK_ONLY = [
  'firebaseio.com','googleapis.com/identitytoolkit','firestore.googleapis.com',
  'wttr.in','open-meteo.com','ipapi.co','nominatim.openstreetmap.org',
  'unpkg.com/leaflet','tile.openstreetmap.org'
];

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  for (var i = 0; i < NETWORK_ONLY.length; i++) {
    if (url.indexOf(NETWORK_ONLY[i]) >= 0) return;
  }

  // HTML navigation: network-first so updates always reach the user
  if (e.request.mode === 'navigate' || url.endsWith('.html') || url === self.registration.scope) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, response.clone()); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(cached){
          return cached
            || caches.match(self.registration.scope)
            || caches.match(self.registration.scope + 'index.html');
        });
      })
    );
    return;
  }

  // Everything else: cache-first, update in background
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var networkFetch = fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, response.clone()); });
        }
        return response;
      }).catch(function() { return cached; });
      return cached || networkFetch;
    })
  );
});
