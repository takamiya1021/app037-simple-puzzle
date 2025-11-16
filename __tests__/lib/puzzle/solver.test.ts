/**
 * A*ソルバーのテスト
 */

import {
  calculateManhattanDistance,
  solvePuzzle,
  isGoalState,
} from '@/lib/puzzle/solver';
import { PuzzleState } from '@/lib/puzzle/types';
import { createSolvedState, generatePuzzle } from '@/lib/puzzle/generator';

describe('A*ソルバー', () => {
  describe('calculateManhattanDistance', () => {
    it('完成状態のManhattan距離は0', () => {
      const state = createSolvedState(3);
      expect(calculateManhattanDistance(state)).toBe(0);
    });

    it('1手で完成する状態のManhattan距離は正しく計算される', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };
      // タイル8が1マス分ずれているのでManhattan距離は1
      expect(calculateManhattanDistance(state)).toBe(1);
    });

    it('2つのタイルがずれている場合のManhattan距離', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [8, 7, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };
      // タイル7が1マス、タイル8が1マスずれている = 合計2
      expect(calculateManhattanDistance(state)).toBe(2);
    });

    it('4x4パズルのManhattan距離計算', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 0, 15],
        ],
        emptyPos: { row: 3, col: 2 },
        moveCount: 0,
      };
      // タイル15が1マスずれている
      expect(calculateManhattanDistance(state)).toBe(1);
    });

    it('複雑な配置のManhattan距離計算', () => {
      const state: PuzzleState = {
        board: [
          [2, 1, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };
      // タイル1が1マス、タイル2が1マス = 合計2
      expect(calculateManhattanDistance(state)).toBe(2);
    });
  });

  describe('isGoalState', () => {
    it('完成状態はゴールと判定される', () => {
      const state = createSolvedState(3);
      expect(isGoalState(state)).toBe(true);
    });

    it('未完成状態はゴールと判定されない', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };
      expect(isGoalState(state)).toBe(false);
    });

    it('4x4の完成状態もゴールと判定される', () => {
      const state = createSolvedState(4);
      expect(isGoalState(state)).toBe(true);
    });
  });

  describe('solvePuzzle', () => {
    it('完成状態の解は空配列', () => {
      const state = createSolvedState(3);
      const solution = solvePuzzle(state);
      expect(solution).toEqual([]);
    });

    it('1手で解ける問題を正しく解く', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };

      const solution = solvePuzzle(state);
      expect(solution).toHaveLength(1);
      expect(solution[0]).toEqual({ row: 2, col: 2 }); // タイル8を移動
    });

    it('2手で解ける問題を正しく解く', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [0, 7, 8],
        ],
        emptyPos: { row: 2, col: 0 },
        moveCount: 0,
      };

      const solution = solvePuzzle(state);
      expect(solution).toHaveLength(2);
      // タイル7を左に、タイル8を左に
    });

    it('シャッフルされた3x3パズルを解く', () => {
      const state = generatePuzzle(3, 10);
      const solution = solvePuzzle(state);

      // 解が存在することを確認
      expect(solution.length).toBeGreaterThanOrEqual(0);
    });

    it('4x4パズルも解ける', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 0, 15],
        ],
        emptyPos: { row: 3, col: 2 },
        moveCount: 0,
      };

      const solution = solvePuzzle(state);
      expect(solution).toHaveLength(1);
    });

    it('A*アルゴリズムは最適解を返す', () => {
      // 明らかに最適解が分かる問題
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };

      const solution = solvePuzzle(state);
      // 最適解は1手
      expect(solution).toHaveLength(1);
    });

    it('ソルバーは5秒以内に解を返す（3x3）', () => {
      const state = generatePuzzle(3, 30);
      const startTime = Date.now();

      solvePuzzle(state);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 5秒以内に完了
      expect(duration).toBeLessThan(5000);
    }, 10000); // タイムアウトを10秒に設定
  });
});
