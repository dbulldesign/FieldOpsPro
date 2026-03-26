// FieldOps Pro — Service Worker
var CACHE_NAME = 'fieldops-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['/index.html', '/manifest.json']).then(function() {
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
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var networkFetch = fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, response.clone()); });
        }
        return response;
      }).catch(function() {
        if (e.request.mode === 'navigate') return caches.match('/index.html');
      });
      return cached || networkFetch;
    })
  );
});
