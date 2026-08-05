self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', () => {
  // 暂不做离线缓存，只是让浏览器认可这是一个合格的 PWA
});