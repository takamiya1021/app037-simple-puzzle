/**
 * ヒント生成ロジック
 * A*ソルバーを使用して次の最適な一手を取得
 */

import { PuzzleState, Position } from '@/lib/puzzle/types';
import { solvePuzzle, isGoalState } from '@/lib/puzzle/solver';

/**
 * 次の最適な一手の情報
 */
export interface OptimalMoveHint {
  position: Position; // 移動するタイルの位置
  tileNumber: number; // 移動するタイルの番号
  direction: string; // 移動方向（上/下/左/右）
}

/**
 * 次の最適な一手を取得
 * @param state 現在のパズル状態
 * @returns 次の最適な一手（完成状態の場合はnull）
 */
export function getNextOptimalMove(state: PuzzleState): OptimalMoveHint | null {
  // ゴール状態の場合はnullを返す
  if (isGoalState(state)) {
    return null;
  }

  // A*ソルバーで最適解を計算
  const solution = solvePuzzle(state);

  // 解が存在しない場合
  if (solution.length === 0) {
    return null;
  }

  // 最初の一手を取得
  const nextPosition = solution[0];
  const tileNumber = state.board[nextPosition.row][nextPosition.col];

  // 移動方向を計算
  const direction = getMoveDirection(nextPosition, state.emptyPos);

  return {
    position: nextPosition,
    tileNumber,
    direction,
  };
}

/**
 * 移動方向を取得
 * @param from 移動元の位置（タイルの位置）
 * @param to 移動先の位置（空きマスの位置）
 * @returns 移動方向（上/下/左/右）
 */
export function getMoveDirection(from: Position, to: Position): string {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  if (rowDiff < 0) return '上';
  if (rowDiff > 0) return '下';
  if (colDiff < 0) return '左';
  if (colDiff > 0) return '右';

  return '';
}
