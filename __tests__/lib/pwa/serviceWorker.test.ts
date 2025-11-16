/**
 * Service Worker 登録ロジックのテスト
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Service Worker Registration', () => {
  beforeEach(() => {
    // Service Worker APIをモック
    delete (global as any).navigator;
    (global as any).navigator = {
      serviceWorker: {
        register: jest.fn(),
        ready: Promise.resolve(),
      },
    };

    // コンソールをモック
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });

  it('registerServiceWorker関数が存在すること', async () => {
    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    expect(registerServiceWorker).toBeDefined();
    expect(typeof registerServiceWorker).toBe('function');
  });

  it('本番環境でService Workerを登録すること', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await registerServiceWorker();

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });

    process.env.NODE_ENV = originalEnv;
  });

  it('Service Worker未対応ブラウザではエラーを出さないこと', async () => {
    delete (global as any).navigator.serviceWorker;

    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await expect(registerServiceWorker()).resolves.not.toThrow();
  });

  it('登録成功時にコンソールログを出力すること', async () => {
    const mockRegistration = { scope: '/' };
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(mockRegistration);

    process.env.NODE_ENV = 'production';

    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await registerServiceWorker();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Service Worker registered'),
      expect.any(String)
    );
  });

  it('登録失敗時にエラーログを出力すること', async () => {
    const mockError = new Error('Registration failed');
    (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(mockError);

    process.env.NODE_ENV = 'production';

    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await registerServiceWorker();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Service Worker registration failed'),
      mockError
    );
  });

  it('開発環境ではService Workerを登録しないこと', async () => {
    process.env.NODE_ENV = 'development';

    const { registerServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await registerServiceWorker();

    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });
});

describe('Service Worker Utilities', () => {
  it('unregisterServiceWorker関数が存在すること', async () => {
    const { unregisterServiceWorker } = await import('@/lib/pwa/serviceWorker');
    expect(unregisterServiceWorker).toBeDefined();
    expect(typeof unregisterServiceWorker).toBe('function');
  });

  it('すべてのService Workerを登録解除できること', async () => {
    const mockUnregister = jest.fn().mockResolvedValue(true);
    const mockRegistrations = [
      { unregister: mockUnregister },
      { unregister: mockUnregister },
    ];

    (global as any).navigator = {
      serviceWorker: {
        getRegistrations: jest.fn().mockResolvedValue(mockRegistrations),
      },
    };

    const { unregisterServiceWorker } = await import('@/lib/pwa/serviceWorker');
    await unregisterServiceWorker();

    expect(mockUnregister).toHaveBeenCalledTimes(2);
  });
});
