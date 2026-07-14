const CACHE_NAME = 'diabetes-perros-v2';
const ASSETS = [
  './', 
  './index.html', 
  './style.css', 
  './script.js', 
  './manifest.json'
  './icono-app.png'
  // Si tienes imágenes o iconos, añádelos aquí también
];

// Instalar el Service Worker y guardar en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
