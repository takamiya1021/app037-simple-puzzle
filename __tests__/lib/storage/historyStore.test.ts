/**
 * プレイ履歴ストアのテスト
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('HistoryStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveGameHistory関数が存在すること', async () => {
    const { saveGameHistory } = await import('@/lib/storage/historyStore');
    expect(saveGameHistory).toBeDefined();
    expect(typeof saveGameHistory).toBe('function');
  });

  it('getGameHistory関数が存在すること', async () => {
    const { getGameHistory } = await import('@/lib/storage/historyStore');
    expect(getGameHistory).toBeDefined();
    expect(typeof getGameHistory).toBe('function');
  });

  it('ゲーム履歴を保存できること', async () => {
    const { saveGameHistory } = await import('@/lib/storage/historyStore');

    const gameRecord = {
      id: 'test-001',
      gridSize: 3,
      moves: 25,
      time: 120,
      completed: true,
      timestamp: Date.now(),
      efficiency: 85.5,
      rank: 'A' as const,
    };

    saveGameHistory(gameRecord);

    const saved = localStorage.getItem('puzzle-history');
    expect(saved).toBeDefined();
    expect(saved).not.toBeNull();
  });

  it('保存した履歴を取得できること', async () => {
    const { saveGameHistory, getGameHistory } = await import('@/lib/storage/historyStore');

    const gameRecord = {
      id: 'test-002',
      gridSize: 3,
      moves: 30,
      time: 150,
      completed: true,
      timestamp: Date.now(),
      efficiency: 80.0,
      rank: 'B' as const,
    };

    saveGameHistory(gameRecord);
    const history = getGameHistory();

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toMatchObject({
      id: 'test-002',
      gridSize: 3,
      moves: 30,
    });
  });

  it('複数の履歴を保存できること', async () => {
    const { saveGameHistory, getGameHistory } = await import('@/lib/storage/historyStore');

    const records = [
      {
        id: 'test-003',
        gridSize: 3,
        moves: 20,
        time: 100,
        completed: true,
        timestamp: Date.now(),
        efficiency: 90.0,
        rank: 'S' as const,
      },
      {
        id: 'test-004',
        gridSize: 4,
        moves: 50,
        time: 300,
        completed: true,
        timestamp: Date.now() + 1000,
        efficiency: 75.0,
        rank: 'B' as const,
      },
    ];

    records.forEach((record) => saveGameHistory(record));

    const history = getGameHistory();
    expect(history.length).toBe(2);
  });

  it('履歴が新しい順にソートされていること', async () => {
    const { saveGameHistory, getGameHistory } = await import('@/lib/storage/historyStore');

    const now = Date.now();
    const records = [
      {
        id: 'old',
        gridSize: 3,
        moves: 20,
        time: 100,
        completed: true,
        timestamp: now - 10000,
        efficiency: 90.0,
        rank: 'S' as const,
      },
      {
        id: 'new',
        gridSize: 3,
        moves: 25,
        time: 120,
        completed: true,
        timestamp: now,
        efficiency: 85.0,
        rank: 'A' as const,
      },
    ];

    records.forEach((record) => saveGameHistory(record));

    const history = getGameHistory();
    expect(history[0].id).toBe('new');
    expect(history[1].id).toBe('old');
  });

  it('履歴の最大件数を制限できること', async () => {
    const { saveGameHistory, getGameHistory } = await import('@/lib/storage/historyStore');

    // 101件のレコードを追加
    for (let i = 0; i < 101; i++) {
      saveGameHistory({
        id: `test-${i}`,
        gridSize: 3,
        moves: 20 + i,
        time: 100,
        completed: true,
        timestamp: Date.now() + i,
        efficiency: 90.0,
        rank: 'S',
      });
    }

    const history = getGameHistory();
    // デフォルトで100件に制限される
    expect(history.length).toBeLessThanOrEqual(100);
  });

  it('clearHistory関数が存在し、履歴をクリアできること', async () => {
    const { saveGameHistory, getGameHistory, clearHistory } = await import(
      '@/lib/storage/historyStore'
    );

    saveGameHistory({
      id: 'test-clear',
      gridSize: 3,
      moves: 20,
      time: 100,
      completed: true,
      timestamp: Date.now(),
      efficiency: 90.0,
      rank: 'S',
    });

    expect(getGameHistory().length).toBeGreaterThan(0);

    clearHistory();

    expect(getGameHistory().length).toBe(0);
  });

  it('getStatistics関数が存在すること', async () => {
    const { getStatistics } = await import('@/lib/storage/historyStore');
    expect(getStatistics).toBeDefined();
    expect(typeof getStatistics).toBe('function');
  });

  it('統計情報を計算できること', async () => {
    const { saveGameHistory, getStatistics } = await import('@/lib/storage/historyStore');

    const records = [
      {
        id: 'stat-1',
        gridSize: 3,
        moves: 20,
        time: 100,
        completed: true,
        timestamp: Date.now(),
        efficiency: 90.0,
        rank: 'S' as const,
      },
      {
        id: 'stat-2',
        gridSize: 3,
        moves: 30,
        time: 150,
        completed: true,
        timestamp: Date.now() + 1000,
        efficiency: 80.0,
        rank: 'A' as const,
      },
    ];

    records.forEach((record) => saveGameHistory(record));

    const stats = getStatistics();

    expect(stats).toHaveProperty('totalGames');
    expect(stats).toHaveProperty('completedGames');
    expect(stats).toHaveProperty('averageTime');
    expect(stats).toHaveProperty('averageMoves');
    expect(stats).toHaveProperty('averageEfficiency');
    expect(stats).toHaveProperty('bestTime');
    expect(stats).toHaveProperty('bestMoves');
    expect(stats.totalGames).toBe(2);
    expect(stats.completedGames).toBe(2);
  });

  it('完了していないゲームは統計に含めないこと', async () => {
    const { saveGameHistory, getStatistics } = await import('@/lib/storage/historyStore');

    saveGameHistory({
      id: 'incomplete',
      gridSize: 3,
      moves: 10,
      time: 50,
      completed: false,
      timestamp: Date.now(),
      efficiency: 50.0,
      rank: 'D',
    });

    const stats = getStatistics();
    expect(stats.completedGames).toBe(0);
  });

  it('LocalStorageが利用できない環境でもエラーを出さないこと', async () => {
    // LocalStorageを一時的に無効化
    const originalLocalStorage = global.localStorage;
    delete (global as any).localStorage;

    const { saveGameHistory, getGameHistory } = await import('@/lib/storage/historyStore');

    expect(() => saveGameHistory({
      id: 'no-storage',
      gridSize: 3,
      moves: 20,
      time: 100,
      completed: true,
      timestamp: Date.now(),
      efficiency: 90.0,
      rank: 'S',
    })).not.toThrow();

    const history = getGameHistory();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);

    // LocalStorageを復元
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });
});
