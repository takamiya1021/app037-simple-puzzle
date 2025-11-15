/**
 * パズル生成ロジック
 */

import { PuzzleState, Position } from './types';

/**
 * 完成状態のパズルを生成
 * @param size パズルのサイズ（3, 4, 5, 9, etc.）
 * @returns 完成状態のPuzzleState
 */
export function createSolvedState(size: number): PuzzleState {
  const board: number[][] = [];

  // 1から順番に数字を配置（最後のマスは0）
  let num = 1;
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      if (row === size - 1 && col === size - 1) {
        board[row][col] = 0; // 最後のマスは空き
      } else {
        board[row][col] = num++;
      }
    }
  }

  return {
    board,
    emptyPos: { row: size - 1, col: size - 1 },
    moveCount: 0,
  };
}

/**
 * パズルが解ける配置かどうかを判定
 * @param board パズルボード
 * @returns 解ける場合はtrue
 */
export function isSolvable(board: number[][]): boolean {
  const size = board.length;
  const flat: number[] = [];

  // 2次元配列を1次元に変換（0を除く）
  let emptyRow = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        emptyRow = row;
      } else {
        flat.push(board[row][col]);
      }
    }
  }

  // 転倒数を計算
  let inversions = 0;
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) {
        inversions++;
      }
    }
  }

  // パズルサイズが奇数の場合
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }

  // パズルサイズが偶数の場合
  // 空きマスの行（下からの位置）と転倒数の和が偶数なら解ける
  const emptyRowFromBottom = size - emptyRow;
  return (inversions + emptyRowFromBottom) % 2 === 1;
}

/**
 * 指定された位置の隣接する有効な位置を取得
 * @param pos 現在の位置
 * @param size ボードのサイズ
 * @returns 隣接する有効な位置の配列
 */
function getAdjacentPositions(pos: Position, size: number): Position[] {
  const { row, col } = pos;
  const positions: Position[] = [];

  // 上
  if (row > 0) positions.push({ row: row - 1, col });
  // 下
  if (row < size - 1) positions.push({ row: row + 1, col });
  // 左
  if (col > 0) positions.push({ row, col: col - 1 });
  // 右
  if (col < size - 1) positions.push({ row, col: col + 1 });

  return positions;
}

/**
 * パズルをシャッフル
 * 完成状態から逆算してランダムに移動することで、必ず解ける配置を保証
 * @param size パズルのサイズ
 * @param shuffleCount シャッフル回数
 * @returns シャッフルされたPuzzleState
 */
export function generatePuzzle(size: number, shuffleCount: number): PuzzleState {
  const state = createSolvedState(size);

  if (shuffleCount === 0) {
    return state;
  }

  let board = state.board.map((row) => [...row]); // ディープコピー
  let emptyPos = { ...state.emptyPos };

  // ランダムにシャッフル
  for (let i = 0; i < shuffleCount; i++) {
    const adjacentPositions = getAdjacentPositions(emptyPos, size);

    // ランダムに隣接位置を選択
    const randomIndex = Math.floor(Math.random() * adjacentPositions.length);
    const targetPos = adjacentPositions[randomIndex];

    // タイルを移動（空きマスと入れ替え）
    const temp = board[targetPos.row][targetPos.col];
    board[targetPos.row][targetPos.col] = board[emptyPos.row][emptyPos.col];
    board[emptyPos.row][emptyPos.col] = temp;

    // 空きマスの位置を更新
    emptyPos = targetPos;
  }

  return {
    board,
    emptyPos,
    moveCount: 0,
  };
}
