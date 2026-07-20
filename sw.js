const CACHE_NAME = 'pawsitive-gluc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icono-app.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

/* ==========================================================================
   MÓDULO DE NOTIFICACIONES EXTERNAS (UNIVERSAL ANDROID/iOS)
   ========================================================================== */
const alarmasActivas = {};

self.addEventListener('message', (event) => {
  const datos = event.data;
  const idAlarma = 'insulina_alarma';
  
  // 1. Programar nueva alarma
  if (datos && datos.accion === 'programarAlarmaInsulina') {
    const tiempoEspera = datos.tiempo - Date.now();

    if (alarmasActivas[idAlarma]) clearTimeout(alarmasActivas[idAlarma]);
    
    if (tiempoEspera > 0) {
      alarmasActivas[idAlarma] = setTimeout(() => {
        const opciones = {
          body: datos.texto,
          icon: '/icono-app.png', 
          badge: '/icono-app.png',
          vibrate: [200, 100, 200], // Patrón corregido
          tag: idAlarma,
          renotify: true,
          data: { url: '/' }
        };
        self.registration.showNotification(datos.titulo, opciones);
        delete alarmasActivas[idAlarma];
      }, tiempoEspera);
    }
  }

  // 2. Cancelar alarma si el usuario desactiva el control
  if (datos && datos.accion === 'cancelarAlarmaInsulina') {
    if (alarmasActivas[idAlarma]) {
      clearTimeout(alarmasActivas[idAlarma]);
      delete alarmasActivas[idAlarma];
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if ((client.url === '/' || client.url.includes('index.html')) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
