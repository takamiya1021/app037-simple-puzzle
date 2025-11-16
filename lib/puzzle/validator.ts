/**
 * パズルの移動可否判定ロジック
 */

import { PuzzleState, Position } from './types';

/**
 * 指定された位置のタイルが移動可能かどうかを判定
 * @param state 現在のパズル状態
 * @param targetPos 移動対象のタイルの位置
 * @returns 移動可能な場合はtrue
 */
export function isMovable(state: PuzzleState, targetPos: Position): boolean {
  const { emptyPos } = state;
  const { row, col } = targetPos;

  // 空きマス自体は移動不可
  if (row === emptyPos.row && col === emptyPos.col) {
    return false;
  }

  // 空きマスと隣接しているかチェック
  const isAdjacent =
    (row === emptyPos.row && Math.abs(col - emptyPos.col) === 1) || // 左右
    (col === emptyPos.col && Math.abs(row - emptyPos.row) === 1); // 上下

  return isAdjacent;
}

/**
 * 現在の状態で移動可能なタイルの位置を取得
 * @param state 現在のパズル状態
 * @returns 移動可能なタイルの位置の配列
 */
export function getValidMoves(state: PuzzleState): Position[] {
  const { emptyPos, board } = state;
  const size = board.length;
  const validMoves: Position[] = [];

  // 空きマスの上下左右をチェック
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 }, // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 }, // 右
  ];

  for (const dir of directions) {
    const newRow = emptyPos.row + dir.row;
    const newCol = emptyPos.col + dir.col;

    // ボード内かチェック
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      validMoves.push({ row: newRow, col: newCol });
    }
  }

  return validMoves;
}

/**
 * タイルを移動して新しい状態を返す（イミュータブル）
 * @param state 現在のパズル状態
 * @param targetPos 移動対象のタイルの位置
 * @returns 移動後の新しいパズル状態
 */
export function applyMove(state: PuzzleState, targetPos: Position): PuzzleState {
  const { board, emptyPos, moveCount } = state;

  // ボードのディープコピー
  const newBoard = board.map((row) => [...row]);

  // タイルと空きマスを入れ替え
  const temp = newBoard[targetPos.row][targetPos.col];
  newBoard[targetPos.row][targetPos.col] = newBoard[emptyPos.row][emptyPos.col];
  newBoard[emptyPos.row][emptyPos.col] = temp;

  return {
    board: newBoard,
    emptyPos: { row: targetPos.row, col: targetPos.col },
    moveCount: moveCount + 1,
  };
}
