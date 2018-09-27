/*
 * This service worker is used to cache the app's HTML, CSS, JS and image files, but NOT the restaurant details
 * Restaurant details (other than the images) will be loaded from a server and stored in an idb database
 * (see dbhelper.js for more info)
 */

var cacheName = 'restaurant-app';
var filesToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/bundle_js/main_bundle.js',
  '/bundle_js/maps/main_bundle.js.map',
  '/bundle_js/maps/restaurant_bundle.js.map',
  '/bundle_js/restaurant_bundle.js',
  '/css/styles.min.css',
  '/img/undefined.jpg',
  '/icons/launch-192.png',
  '/icons/launch-512.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching restaurant info');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);

  // Don't try to fetch restaurant details that should be coming from the server (or idb)
  if (e.request.url.startsWith('http://localhost:1337')) {
    console.log('[ServiceWorker] Fetch call to data server');
  }

  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});