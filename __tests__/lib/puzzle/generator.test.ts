/**
 * パズル生成ロジックのテスト
 */

import { generatePuzzle, createSolvedState, isSolvable } from '@/lib/puzzle/generator';
import { PuzzleState } from '@/lib/puzzle/types';

describe('パズル生成ロジック', () => {
  describe('createSolvedState', () => {
    it('3x3の完成状態を正しく生成すること', () => {
      const state = createSolvedState(3);

      expect(state.board).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ]);
      expect(state.emptyPos).toEqual({ row: 2, col: 2 });
      expect(state.moveCount).toBe(0);
    });

    it('4x4の完成状態を正しく生成すること', () => {
      const state = createSolvedState(4);

      expect(state.board).toEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0],
      ]);
      expect(state.emptyPos).toEqual({ row: 3, col: 3 });
      expect(state.moveCount).toBe(0);
    });

    it('5x5の完成状態を正しく生成すること', () => {
      const size = 5;
      const state = createSolvedState(size);

      // ボードサイズの確認
      expect(state.board.length).toBe(size);
      expect(state.board[0].length).toBe(size);

      // 空きマスが右下にあることを確認
      expect(state.emptyPos).toEqual({ row: size - 1, col: size - 1 });
      expect(state.board[size - 1][size - 1]).toBe(0);

      // 手数が0であることを確認
      expect(state.moveCount).toBe(0);
    });
  });

  describe('isSolvable', () => {
    it('完成状態は解けると判定されること', () => {
      const state = createSolvedState(4);
      expect(isSolvable(state.board)).toBe(true);
    });

    it('解ける配置は正しく判定されること', () => {
      // 解ける配置の例（4x4）- 1と2、3と4を入れ替えた場合
      const board = [
        [2, 1, 4, 3],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0],
      ];
      expect(isSolvable(board)).toBe(true);
    });

    it('解けない配置は正しく判定されること', () => {
      // 解けない配置の例（4x4）- 1, 2, 3を入れ替えた場合
      const board = [
        [3, 2, 1, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0],
      ];
      expect(isSolvable(board)).toBe(false);
    });
  });

  describe('generatePuzzle', () => {
    it('指定されたサイズのパズルを生成すること', () => {
      const size = 4;
      const shuffleCount = 20;
      const puzzle = generatePuzzle(size, shuffleCount);

      expect(puzzle.board.length).toBe(size);
      expect(puzzle.board[0].length).toBe(size);
    });

    it('生成されたパズルは解けること', () => {
      const puzzle = generatePuzzle(4, 30);
      expect(isSolvable(puzzle.board)).toBe(true);
    });

    it('空きマスの位置が正しく設定されること', () => {
      const puzzle = generatePuzzle(3, 10);
      const { row, col } = puzzle.emptyPos;

      // 空きマスの位置にある値が0であることを確認
      expect(puzzle.board[row][col]).toBe(0);
    });

    it('手数カウントが0で初期化されること', () => {
      const puzzle = generatePuzzle(4, 20);
      expect(puzzle.moveCount).toBe(0);
    });

    it('シャッフル回数が0でも動作すること', () => {
      const puzzle = generatePuzzle(3, 0);

      // シャッフル回数0の場合、完成状態が返される
      const solved = createSolvedState(3);
      expect(puzzle.board).toEqual(solved.board);
    });

    it('大きなサイズのパズルも生成できること', () => {
      const puzzle = generatePuzzle(9, 50);

      expect(puzzle.board.length).toBe(9);
      expect(puzzle.board[0].length).toBe(9);
      expect(isSolvable(puzzle.board)).toBe(true);
    });
  });
});
