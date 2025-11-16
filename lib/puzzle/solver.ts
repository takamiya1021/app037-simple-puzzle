/**
 * A*アルゴリズムによるパズルソルバー
 */

import { PuzzleState, Position } from './types';
import { getValidMoves, applyMove } from './validator';

/**
 * A*探索用のノード
 */
interface Node {
  state: PuzzleState;
  g: number; // 開始からのコスト
  h: number; // ヒューリスティック（Manhattan距離）
  f: number; // 総コスト (g + h)
  parent: Node | null;
  move?: Position; // このノードに到達するための移動
}

/**
 * 優先度キュー（簡易実装）
 */
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

/**
 * Manhattan距離（ヒューリスティック関数）を計算
 * @param state パズル状態
 * @returns Manhattan距離
 */
export function calculateManhattanDistance(state: PuzzleState): number {
  const { board } = state;
  const size = board.length;
  let distance = 0;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = board[row][col];
      if (value === 0) continue; // 空きマスは無視

      // 目標位置を計算（1から始まる数字）
      const targetRow = Math.floor((value - 1) / size);
      const targetCol = (value - 1) % size;

      // Manhattan距離を加算
      distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
    }
  }

  return distance;
}

/**
 * ゴール状態（完成状態）かどうかを判定
 * @param state パズル状態
 * @returns ゴール状態ならtrue
 */
export function isGoalState(state: PuzzleState): boolean {
  const { board } = state;
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const expectedValue =
        row === size - 1 && col === size - 1 ? 0 : row * size + col + 1;

      if (board[row][col] !== expectedValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * パズル状態を文字列に変換（重複検出用）
 * @param state パズル状態
 * @returns 状態を表す文字列
 */
function stateToString(state: PuzzleState): string {
  return state.board.map((row) => row.join(',')).join(';');
}

/**
 * 経路を再構築
 * @param node ゴールノード
 * @returns 移動手順の配列
 */
function reconstructPath(node: Node): Position[] {
  const path: Position[] = [];
  let current: Node | null = node;

  while (current && current.parent) {
    if (current.move) {
      path.unshift(current.move);
    }
    current = current.parent;
  }

  return path;
}

/**
 * A*アルゴリズムでパズルを解く
 * @param initialState 初期状態
 * @returns 最適解の手順（Position配列）
 */
export function solvePuzzle(initialState: PuzzleState): Position[] {
  // ゴール状態なら空配列を返す
  if (isGoalState(initialState)) {
    return [];
  }

  const openSet = new PriorityQueue<Node>();
  const closedSet = new Set<string>();

  // 初期ノード
  const startNode: Node = {
    state: initialState,
    g: 0,
    h: calculateManhattanDistance(initialState),
    f: calculateManhattanDistance(initialState),
    parent: null,
  };

  openSet.enqueue(startNode, startNode.f);

  let iterations = 0;
  const maxIterations = 100000; // 無限ループ防止

  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;

    const current = openSet.dequeue();
    if (!current) break;

    // ゴール判定
    if (isGoalState(current.state)) {
      return reconstructPath(current);
    }

    // 訪問済みに追加
    const stateStr = stateToString(current.state);
    if (closedSet.has(stateStr)) continue;
    closedSet.add(stateStr);

    // 隣接ノードを展開
    const validMoves = getValidMoves(current.state);

    for (const move of validMoves) {
      const newState = applyMove(current.state, move);
      const newStateStr = stateToString(newState);

      // 既に訪問済みならスキップ
      if (closedSet.has(newStateStr)) continue;

      const g = current.g + 1;
      const h = calculateManhattanDistance(newState);
      const f = g + h;

      const newNode: Node = {
        state: newState,
        g,
        h,
        f,
        parent: current,
        move,
      };

      openSet.enqueue(newNode, f);
    }
  }

  // 解が見つからなかった場合（通常は発生しないはず）
  console.warn('Solution not found within iteration limit');
  return [];
}
