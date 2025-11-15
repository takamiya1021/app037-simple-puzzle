/**
 * ヒント生成ロジックのテスト
 */

import { getNextOptimalMove, getMoveDirection } from '@/lib/ai/hintGenerator';
import { PuzzleState, Position } from '@/lib/puzzle/types';

describe('Hint Generator', () => {
  describe('getNextOptimalMove', () => {
    it('1手で完成する状態の次の最適な一手を返すこと', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };

      const result = getNextOptimalMove(state);

      expect(result).not.toBeNull();
      expect(result?.position).toEqual({ row: 2, col: 2 });
      expect(result?.tileNumber).toBe(8);
    });

    it('2手で完成する状態の次の最適な一手を返すこと', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [0, 7, 8],
        ],
        emptyPos: { row: 2, col: 0 },
        moveCount: 0,
      };

      const result = getNextOptimalMove(state);

      expect(result).not.toBeNull();
      expect(result?.position).toEqual({ row: 2, col: 1 });
      expect(result?.tileNumber).toBe(7);
    });

    it('完成状態の場合はnullを返すこと', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const result = getNextOptimalMove(state);

      expect(result).toBeNull();
    });

    it('複雑な状態でも次の一手を返すこと', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 0],
          [7, 8, 6],
        ],
        emptyPos: { row: 1, col: 2 },
        moveCount: 0,
      };

      const result = getNextOptimalMove(state);

      expect(result).not.toBeNull();
      expect(result?.tileNumber).toBeGreaterThan(0);
    });

    it('4x4パズルでも動作すること', () => {
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

      const result = getNextOptimalMove(state);

      expect(result).not.toBeNull();
      expect(result?.position).toEqual({ row: 3, col: 3 });
      expect(result?.tileNumber).toBe(15);
    });
  });

  describe('getMoveDirection', () => {
    it('上への移動を検出すること', () => {
      const from: Position = { row: 1, col: 1 };
      const to: Position = { row: 0, col: 1 };

      const direction = getMoveDirection(from, to);

      expect(direction).toBe('上');
    });

    it('下への移動を検出すること', () => {
      const from: Position = { row: 1, col: 1 };
      const to: Position = { row: 2, col: 1 };

      const direction = getMoveDirection(from, to);

      expect(direction).toBe('下');
    });

    it('左への移動を検出すること', () => {
      const from: Position = { row: 1, col: 1 };
      const to: Position = { row: 1, col: 0 };

      const direction = getMoveDirection(from, to);

      expect(direction).toBe('左');
    });

    it('右への移動を検出すること', () => {
      const from: Position = { row: 1, col: 1 };
      const to: Position = { row: 1, col: 2 };

      const direction = getMoveDirection(from, to);

      expect(direction).toBe('右');
    });

    it('移動しない場合は空文字を返すこと', () => {
      const from: Position = { row: 1, col: 1 };
      const to: Position = { row: 1, col: 1 };

      const direction = getMoveDirection(from, to);

      expect(direction).toBe('');
    });
  });
});
