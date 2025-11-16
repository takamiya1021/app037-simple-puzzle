/**
 * 移動可否判定ロジックのテスト
 */

import { isMovable, getValidMoves, applyMove } from '@/lib/puzzle/validator';
import { PuzzleState, Position } from '@/lib/puzzle/types';
import { createSolvedState } from '@/lib/puzzle/generator';

describe('移動可否判定ロジック', () => {
  describe('isMovable', () => {
    it('空きマスの上のタイルは移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 1, col: 2 }; // タイル6
      expect(isMovable(state, targetPos)).toBe(true);
    });

    it('空きマスの下のタイルは移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 0],
          [4, 5, 6],
          [7, 8, 9],
        ],
        emptyPos: { row: 0, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 1, col: 2 }; // タイル6
      expect(isMovable(state, targetPos)).toBe(true);
    });

    it('空きマスの左のタイルは移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 0, 8],
        ],
        emptyPos: { row: 2, col: 1 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 2, col: 0 }; // タイル7
      expect(isMovable(state, targetPos)).toBe(true);
    });

    it('空きマスの右のタイルは移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [0, 7, 8],
        ],
        emptyPos: { row: 2, col: 0 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 2, col: 1 }; // タイル7
      expect(isMovable(state, targetPos)).toBe(true);
    });

    it('空きマスに隣接していないタイルは移動不可', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 0, col: 0 }; // タイル1
      expect(isMovable(state, targetPos)).toBe(false);
    });

    it('空きマス自体は移動不可', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 2, col: 2 }; // 空きマス
      expect(isMovable(state, targetPos)).toBe(false);
    });
  });

  describe('getValidMoves', () => {
    it('中央の空きマスは4方向移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 0, 5],
          [6, 7, 8],
        ],
        emptyPos: { row: 1, col: 1 },
        moveCount: 0,
      };

      const validMoves = getValidMoves(state);
      expect(validMoves).toHaveLength(4);

      // 上下左右のタイルが移動可能
      expect(validMoves).toContainEqual({ row: 0, col: 1 }); // タイル2
      expect(validMoves).toContainEqual({ row: 2, col: 1 }); // タイル7
      expect(validMoves).toContainEqual({ row: 1, col: 0 }); // タイル4
      expect(validMoves).toContainEqual({ row: 1, col: 2 }); // タイル5
    });

    it('角の空きマスは2方向移動可能', () => {
      const state = createSolvedState(3);
      const validMoves = getValidMoves(state);

      expect(validMoves).toHaveLength(2);
      expect(validMoves).toContainEqual({ row: 1, col: 2 }); // タイル6
      expect(validMoves).toContainEqual({ row: 2, col: 1 }); // タイル8
    });

    it('辺の空きマスは3方向移動可能', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 0],
          [6, 7, 8],
        ],
        emptyPos: { row: 1, col: 2 },
        moveCount: 0,
      };

      const validMoves = getValidMoves(state);
      expect(validMoves).toHaveLength(3);
    });
  });

  describe('applyMove', () => {
    it('タイル移動後、ボードの状態が正しく更新される', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 1, col: 2 }; // タイル6を移動
      const newState = applyMove(state, targetPos);

      expect(newState.board).toEqual([
        [1, 2, 3],
        [4, 5, 0],
        [7, 8, 6],
      ]);
      expect(newState.emptyPos).toEqual({ row: 1, col: 2 });
      expect(newState.moveCount).toBe(1);
    });

    it('移動後も元のstateは変更されない（イミュータブル）', () => {
      const state: PuzzleState = {
        board: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 0],
        ],
        emptyPos: { row: 2, col: 2 },
        moveCount: 0,
      };

      const targetPos: Position = { row: 2, col: 1 }; // タイル8を移動
      const newState = applyMove(state, targetPos);

      // 元のstateは変更されていない
      expect(state.board[2][2]).toBe(0);
      expect(state.board[2][1]).toBe(8);
      expect(state.emptyPos).toEqual({ row: 2, col: 2 });
      expect(state.moveCount).toBe(0);

      // 新しいstateは正しく更新されている
      expect(newState.board[2][2]).toBe(8);
      expect(newState.board[2][1]).toBe(0);
      expect(newState.emptyPos).toEqual({ row: 2, col: 1 });
      expect(newState.moveCount).toBe(1);
    });

    it('複数回移動しても手数が正しくカウントされる', () => {
      let state = createSolvedState(3);

      state = applyMove(state, { row: 2, col: 1 }); // 1回目
      expect(state.moveCount).toBe(1);

      state = applyMove(state, { row: 1, col: 1 }); // 2回目
      expect(state.moveCount).toBe(2);

      state = applyMove(state, { row: 1, col: 2 }); // 3回目
      expect(state.moveCount).toBe(3);
    });
  });
});
