/**
 * プレイ履歴ストア
 * LocalStorageを使用してゲーム履歴を永続化
 */

const STORAGE_KEY = 'puzzle-history';
const MAX_HISTORY_SIZE = 100;

export interface GameRecord {
  id: string;
  gridSize: number;
  moves: number;
  time: number;
  completed: boolean;
  timestamp: number;
  efficiency: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface GameStatistics {
  totalGames: number;
  completedGames: number;
  averageTime: number;
  averageMoves: number;
  averageEfficiency: number;
  bestTime: number;
  bestMoves: number;
  rankDistribution: Record<string, number>;
}

/**
 * LocalStorageが利用可能かチェック
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * ゲーム履歴を保存
 */
export function saveGameHistory(record: GameRecord): void {
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage is not available');
    return;
  }

  try {
    const history = getGameHistory();
    history.unshift(record); // 最新のレコードを先頭に追加

    // 最大件数を超えた場合は古いものを削除
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save game history:', error);
  }
}

/**
 * ゲーム履歴を取得
 * 新しい順にソートされた配列を返す
 */
export function getGameHistory(): GameRecord[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const history: GameRecord[] = JSON.parse(data);

    // 新しい順にソート
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load game history:', error);
    return [];
  }
}

/**
 * 履歴をクリア
 */
export function clearHistory(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game history:', error);
  }
}

/**
 * 統計情報を計算
 */
export function getStatistics(): GameStatistics {
  const history = getGameHistory();
  const completedGames = history.filter((record) => record.completed);

  if (completedGames.length === 0) {
    return {
      totalGames: history.length,
      completedGames: 0,
      averageTime: 0,
      averageMoves: 0,
      averageEfficiency: 0,
      bestTime: 0,
      bestMoves: 0,
      rankDistribution: {},
    };
  }

  const totalTime = completedGames.reduce((sum, record) => sum + record.time, 0);
  const totalMoves = completedGames.reduce((sum, record) => sum + record.moves, 0);
  const totalEfficiency = completedGames.reduce((sum, record) => sum + record.efficiency, 0);

  const bestTime = Math.min(...completedGames.map((record) => record.time));
  const bestMoves = Math.min(...completedGames.map((record) => record.moves));

  const rankDistribution = completedGames.reduce((dist, record) => {
    dist[record.rank] = (dist[record.rank] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  return {
    totalGames: history.length,
    completedGames: completedGames.length,
    averageTime: totalTime / completedGames.length,
    averageMoves: totalMoves / completedGames.length,
    averageEfficiency: totalEfficiency / completedGames.length,
    bestTime,
    bestMoves,
    rankDistribution,
  };
}

/**
 * 特定の期間の履歴を取得
 */
export function getHistoryByPeriod(days: number): GameRecord[] {
  const history = getGameHistory();
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return history.filter((record) => record.timestamp >= cutoffTime);
}

/**
 * グリッドサイズ別の統計を取得
 */
export function getStatisticsByGridSize(gridSize: number): GameStatistics {
  const history = getGameHistory();
  const filteredHistory = history.filter((record) => record.gridSize === gridSize);

  const completedGames = filteredHistory.filter((record) => record.completed);

  if (completedGames.length === 0) {
    return {
      totalGames: filteredHistory.length,
      completedGames: 0,
      averageTime: 0,
      averageMoves: 0,
      averageEfficiency: 0,
      bestTime: 0,
      bestMoves: 0,
      rankDistribution: {},
    };
  }

  const totalTime = completedGames.reduce((sum, record) => sum + record.time, 0);
  const totalMoves = completedGames.reduce((sum, record) => sum + record.moves, 0);
  const totalEfficiency = completedGames.reduce((sum, record) => sum + record.efficiency, 0);

  const bestTime = Math.min(...completedGames.map((record) => record.time));
  const bestMoves = Math.min(...completedGames.map((record) => record.moves));

  const rankDistribution = completedGames.reduce((dist, record) => {
    dist[record.rank] = (dist[record.rank] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  return {
    totalGames: filteredHistory.length,
    completedGames: completedGames.length,
    averageTime: totalTime / completedGames.length,
    averageMoves: totalMoves / completedGames.length,
    averageEfficiency: totalEfficiency / completedGames.length,
    bestTime,
    bestMoves,
    rankDistribution,
  };
}
