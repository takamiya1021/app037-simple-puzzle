/**
 * Service Worker 登録・管理ロジック
 */

/**
 * Service Workerを登録する
 * 本番環境でのみ動作し、Service Worker APIが利用可能な場合のみ登録する
 */
export async function registerServiceWorker(): Promise<void> {
  // Service Worker APIが利用可能かチェック
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker is not supported in this browser.');
    return;
  }

  // 開発環境では登録しない
  if (process.env.NODE_ENV !== 'production') {
    console.log('Service Worker registration skipped in development mode.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Service Workerの更新をチェック
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker available. Please refresh the page.');
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * すべてのService Workerを登録解除する
 * デバッグやテスト時に使用
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    console.log('All Service Workers unregistered.');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
}

/**
 * Service Workerの状態を取得する
 */
export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  controller: boolean;
}> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      supported: false,
      registered: false,
      controller: false,
    };
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  return {
    supported: true,
    registered: registrations.length > 0,
    controller: !!navigator.serviceWorker.controller,
  };
}
