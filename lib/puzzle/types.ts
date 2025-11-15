/**
 * パズル関連の型定義
 */

/**
 * 位置情報
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * パズルの状態
 */
export interface PuzzleState {
  board: number[][];        // 2次元配列（0は空きマス）
  emptyPos: Position;       // 空きマスの位置
  moveCount: number;        // 現在の手数
}

/**
 * 移動情報
 */
export interface Move {
  tileNumber: number;       // 移動したタイル番号
  from: Position;           // 移動前の位置
  to: Position;             // 移動後の位置
  timestamp: number;        // 移動時刻
}

/**
 * ゲームモード
 */
export type GameMode = 'timeAttack' | 'minMoves' | 'freePlay';

/**
 * 難易度
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'custom';

/**
 * 表示モード
 */
export type DisplayMode = 'number' | 'image';

/**
 * パズルゲームセッション
 */
export interface PuzzleGame {
  id: string;
  timestamp: number;
  mode: GameMode;
  difficulty: Difficulty;
  size: number;
  displayMode: DisplayMode;
  initialState: number[];
  moves: Move[];
  duration: number;
  moveCount: number;
  hintsUsed: number;
  completed: boolean;
  aiAdvice: string;
}
