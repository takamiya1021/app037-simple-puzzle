/**
 * プレイスタイル分析ロジックのテスト
 */

import {
  calculateEfficiency,
  analyzeMovePatterns,
  calculatePlayTime,
  analyzePlayStyle,
  PlayStyleAnalysis,
} from '@/lib/ai/analyzePlay';
import { Move, PuzzleGame } from '@/lib/puzzle/types';

describe('Play Style Analyzer', () => {
  describe('calculateEfficiency', () => {
    it('効率性スコアを正しく計算すること', () => {
      const efficiency = calculateEfficiency(52, 85);
      expect(efficiency).toBeCloseTo(61.18, 1);
    });

    it('最適手数と同じ場合100%を返すこと', () => {
      const efficiency = calculateEfficiency(50, 50);
      expect(efficiency).toBe(100);
    });

    it('実際の手数が最適より少ない場合100%以上を返すこと', () => {
      // これは起こりえないが、念のため
      const efficiency = calculateEfficiency(50, 40);
      expect(efficiency).toBeGreaterThan(100);
    });

    it('効率が低い場合も正しく計算すること', () => {
      const efficiency = calculateEfficiency(30, 100);
      expect(efficiency).toBeCloseTo(30, 0);
    });
  });

  describe('analyzeMovePatterns', () => {
    it('移動パターンを正しく分析すること', () => {
      const moves: Move[] = [
        {
          tileNumber: 5,
          from: { row: 1, col: 1 },
          to: { row: 0, col: 1 },
          timestamp: Date.now(),
        },
        {
          tileNumber: 2,
          from: { row: 0, col: 2 },
          to: { row: 0, col: 1 },
          timestamp: Date.now(),
        },
        {
          tileNumber: 3,
          from: { row: 0, col: 1 },
          to: { row: 0, col: 2 },
          timestamp: Date.now(),
        },
        {
          tileNumber: 6,
          from: { row: 1, col: 2 },
          to: { row: 0, col: 2 },
          timestamp: Date.now(),
        },
      ];

      const patterns = analyzeMovePatterns(moves);

      expect(patterns.up).toBe(2);
      expect(patterns.down).toBe(0);
      expect(patterns.left).toBe(1);
      expect(patterns.right).toBe(1);
      expect(patterns.total).toBe(4);
    });

    it('空の移動履歴でも動作すること', () => {
      const patterns = analyzeMovePatterns([]);

      expect(patterns.up).toBe(0);
      expect(patterns.down).toBe(0);
      expect(patterns.left).toBe(0);
      expect(patterns.right).toBe(0);
      expect(patterns.total).toBe(0);
    });

    it('最も多い移動方向を特定すること', () => {
      const moves: Move[] = [
        { tileNumber: 1, from: { row: 1, col: 0 }, to: { row: 0, col: 0 }, timestamp: Date.now() },
        { tileNumber: 2, from: { row: 2, col: 0 }, to: { row: 1, col: 0 }, timestamp: Date.now() },
        { tileNumber: 3, from: { row: 2, col: 1 }, to: { row: 2, col: 0 }, timestamp: Date.now() },
      ];

      const patterns = analyzeMovePatterns(moves);

      expect(patterns.mostFrequent).toBe('up');
    });
  });

  describe('calculatePlayTime', () => {
    it('プレイ時間を分秒形式で返すこと', () => {
      const result = calculatePlayTime(125);
      expect(result.minutes).toBe(2);
      expect(result.seconds).toBe(5);
      expect(result.formatted).toBe('2分5秒');
    });

    it('1分未満の場合も正しく表示すること', () => {
      const result = calculatePlayTime(45);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(45);
      expect(result.formatted).toBe('0分45秒');
    });

    it('ちょうど1分の場合も正しく表示すること', () => {
      const result = calculatePlayTime(60);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(0);
      expect(result.formatted).toBe('1分0秒');
    });
  });

  describe('analyzePlayStyle', () => {
    const mockGame: PuzzleGame = {
      id: 'test-game-1',
      timestamp: Date.now(),
      mode: 'freePlay',
      difficulty: 'intermediate',
      size: 3,
      displayMode: 'number',
      initialState: [1, 2, 3, 4, 5, 6, 7, 0, 8],
      moves: [
        { tileNumber: 8, from: { row: 2, col: 2 }, to: { row: 2, col: 1 }, timestamp: Date.now() },
        { tileNumber: 6, from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, timestamp: Date.now() },
        { tileNumber: 3, from: { row: 1, col: 1 }, to: { row: 0, col: 1 }, timestamp: Date.now() },
      ],
      duration: 125,
      moveCount: 3,
      hintsUsed: 0,
      completed: true,
      aiAdvice: '',
    };

    it('総合的なプレイスタイル分析を返すこと', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis).toHaveProperty('efficiency');
      expect(analysis).toHaveProperty('movePatterns');
      expect(analysis).toHaveProperty('playTime');
      expect(analysis).toHaveProperty('hintsUsed');
      expect(analysis).toHaveProperty('completionRate');
    });

    it('効率性が正しく計算されること', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis.efficiency).toBeCloseTo(33.33, 1);
    });

    it('移動パターンが正しく分析されること', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis.movePatterns.total).toBe(3);
      expect(analysis.movePatterns.left).toBe(1);
      expect(analysis.movePatterns.up).toBe(2);
    });

    it('プレイ時間が正しく計算されること', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis.playTime.minutes).toBe(2);
      expect(analysis.playTime.seconds).toBe(5);
    });

    it('ヒント使用数が正しく記録されること', () => {
      const gameWithHints = { ...mockGame, hintsUsed: 2 };
      const analysis = analyzePlayStyle(gameWithHints, 1);

      expect(analysis.hintsUsed).toBe(2);
    });

    it('完了率が正しく計算されること', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis.completionRate).toBe(100);
    });

    it('未完了のゲームでも分析できること', () => {
      const incompleteGame = { ...mockGame, completed: false };
      const analysis = analyzePlayStyle(incompleteGame, 1);

      expect(analysis.completionRate).toBe(0);
    });

    it('評価ランクが返されること', () => {
      const analysis = analyzePlayStyle(mockGame, 1);

      expect(analysis.rank).toBeDefined();
      expect(['S', 'A', 'B', 'C', 'D']).toContain(analysis.rank);
    });

    it('高効率プレイでSランクが返されること', () => {
      const efficientGame = { ...mockGame, moveCount: 1 };
      const analysis = analyzePlayStyle(efficientGame, 1);

      expect(analysis.rank).toBe('S');
    });

    it('低効率プレイで低ランクが返されること', () => {
      const inefficientGame = { ...mockGame, moveCount: 100 };
      const analysis = analyzePlayStyle(inefficientGame, 1);

      expect(analysis.rank).not.toBe('S');
      expect(analysis.rank).not.toBe('A');
    });
  });
});
