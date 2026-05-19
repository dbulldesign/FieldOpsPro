// FieldOps Pro — Service Worker
var CACHE_NAME = 'fieldops-v10';

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache both the clean root URL and the explicit index.html URL
      return cache.addAll([
        self.registration.scope,
        self.registration.scope + 'index.html',
        self.registration.scope + 'manifest.json'
      ]).then(function() {
        return cache.add('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap').catch(function(){});
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
    }).then(function(){ return self.clients.claim(); })
  );
});

// Requests that should ALWAYS go to the network
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
          // Fall back to any cached version of the app shell
          return cached
            || caches.match(self.registration.scope)
            || caches.match(self.registration.scope + 'index.html');
        });
      })
    );
    return;
  }

  // Everything else: cache-first (fonts, images, scripts)
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
