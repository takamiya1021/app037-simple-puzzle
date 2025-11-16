/**
 * プレイスタイル分析ロジック
 * ゲームプレイのデータを分析し、統計情報を提供
 */

import { Move, PuzzleGame } from '@/lib/puzzle/types';

/**
 * 移動パターンの統計
 */
export interface MovePatterns {
  up: number;
  down: number;
  left: number;
  right: number;
  total: number;
  mostFrequent?: 'up' | 'down' | 'left' | 'right';
}

/**
 * プレイ時間の情報
 */
export interface PlayTime {
  minutes: number;
  seconds: number;
  formatted: string;
}

/**
 * プレイスタイル分析結果
 */
export interface PlayStyleAnalysis {
  efficiency: number; // 効率性スコア（0-100+）
  movePatterns: MovePatterns;
  playTime: PlayTime;
  hintsUsed: number;
  completionRate: number; // 完了率（0 or 100）
  rank: 'S' | 'A' | 'B' | 'C' | 'D'; // 評価ランク
}

/**
 * 効率性スコアを計算
 * @param optimalMoves 最適手数
 * @param actualMoves 実際の手数
 * @returns 効率性スコア（0-100+）
 */
export function calculateEfficiency(
  optimalMoves: number,
  actualMoves: number
): number {
  if (actualMoves === 0) return 0;
  return (optimalMoves / actualMoves) * 100;
}

/**
 * 移動パターンを分析
 * @param moves 移動履歴
 * @returns 移動パターンの統計
 */
export function analyzeMovePatterns(moves: Move[]): MovePatterns {
  const patterns: MovePatterns = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    total: moves.length,
  };

  moves.forEach((move) => {
    const rowDiff = move.to.row - move.from.row;
    const colDiff = move.to.col - move.from.col;

    if (rowDiff < 0) patterns.up++;
    else if (rowDiff > 0) patterns.down++;
    else if (colDiff < 0) patterns.left++;
    else if (colDiff > 0) patterns.right++;
  });

  // 最も頻繁な移動方向を特定
  if (patterns.total > 0) {
    const max = Math.max(patterns.up, patterns.down, patterns.left, patterns.right);
    if (patterns.up === max) patterns.mostFrequent = 'up';
    else if (patterns.down === max) patterns.mostFrequent = 'down';
    else if (patterns.left === max) patterns.mostFrequent = 'left';
    else if (patterns.right === max) patterns.mostFrequent = 'right';
  }

  return patterns;
}

/**
 * プレイ時間を計算
 * @param duration プレイ時間（秒）
 * @returns プレイ時間の情報
 */
export function calculatePlayTime(duration: number): PlayTime {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return {
    minutes,
    seconds,
    formatted: `${minutes}分${seconds}秒`,
  };
}

/**
 * 効率性スコアに基づいてランクを決定
 * @param efficiency 効率性スコア
 * @returns ランク
 */
function determineRank(efficiency: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (efficiency >= 90) return 'S';
  if (efficiency >= 75) return 'A';
  if (efficiency >= 60) return 'B';
  if (efficiency >= 45) return 'C';
  return 'D';
}

/**
 * プレイスタイルを総合的に分析
 * @param game ゲームデータ
 * @param optimalMoves 最適手数
 * @returns プレイスタイル分析結果
 */
export function analyzePlayStyle(
  game: PuzzleGame,
  optimalMoves: number
): PlayStyleAnalysis {
  const efficiency = calculateEfficiency(optimalMoves, game.moveCount);
  const movePatterns = analyzeMovePatterns(game.moves);
  const playTime = calculatePlayTime(game.duration);
  const completionRate = game.completed ? 100 : 0;
  const rank = determineRank(efficiency);

  return {
    efficiency,
    movePatterns,
    playTime,
    hintsUsed: game.hintsUsed,
    completionRate,
    rank,
  };
}
