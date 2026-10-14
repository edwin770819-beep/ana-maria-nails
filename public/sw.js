// Service worker mínimo: permite instalar la app y muestra una página amable sin conexión.
const CACHE = "ana-maria-v1";
const OFFLINE = "/sin-conexion";

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE])));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.mode === "navigate") {
    evento.respondWith(fetch(evento.request).catch(() => caches.match(OFFLINE)));
  }
});

// Notificaciones push (se usarán para recordatorios de citas)
self.addEventListener("push", (evento) => {
  if (!evento.data) return;
  const datos = evento.data.json();
  evento.waitUntil(
    self.registration.showNotification(datos.titulo || "Ana María Nail Atelier", {
      body: datos.cuerpo,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: datos.url || "/mis-citas" },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  evento.waitUntil(self.clients.openWindow(evento.notification.data.url));
});
