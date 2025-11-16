/**
 * Service Worker
 * オフライン対応とキャッシング戦略を実装
 */

const CACHE_NAME = 'slide-puzzle-v1';
const RUNTIME_CACHE = 'slide-puzzle-runtime';

// キャッシュするリソース
const PRECACHE_URLS = [
  '/',
  '/offline.html',
];

// インストール時: 静的リソースをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching static resources');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時: キャッシュファーストの戦略
self.addEventListener('fetch', (event) => {
  // GET リクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  // Chrome拡張のリクエストを無視
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // 正常なレスポンスのみキャッシュ
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed, returning offline page:', error);
            // オフライン時はオフラインページを返す
            return caches.match('/offline.html');
          });
      });
    })
  );
});

// メッセージハンドラ: キャッシュクリアなど
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }
});
