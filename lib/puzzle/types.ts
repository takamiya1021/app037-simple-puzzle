/**
 * Phase 2: Puzzle Types
 *
 * Core type definitions for the puzzle game
 */

/**
 * Represents a position on the puzzle grid
 */
export interface Position {
  x: number
  y: number
}

/**
 * Represents a single tile in the puzzle
 */
export interface TileData {
  id: number
  position: Position
  imageData?: string
  isEmpty: boolean
}

/**
 * Represents the complete puzzle state
 */
export interface PuzzleState {
  size: number
  tiles: TileData[]
  emptyTileId: number
  moves: number
  isComplete: boolean
  startTime: number | null
  endTime: number | null
}

/**
 * Represents a move action
 */
export interface Move {
  tileId: number
  from: Position
  to: Position
}

/**
 * Game mode types
 */
export type GameMode = 'free' | 'time-attack' | 'move-challenge'

/**
 * Difficulty level
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom'

/**
 * Puzzle configuration
 */
export interface PuzzleConfig {
  size: number
  mode: GameMode
  difficulty: Difficulty
  imageSource: string
  shuffleMoves?: number
}

/**
 * Direction of movement
 */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Converts position to index
 */
export function positionToIndex(pos: Position, size: number): number {
  return pos.y * size + pos.x
}

/**
 * Converts index to position
 */
export function indexToPosition(index: number, size: number): Position {
  return {
    x: index % size,
    y: Math.floor(index / size),
  }
}

/**
 * Checks if two positions are adjacent
 */
export function arePositionsAdjacent(pos1: Position, pos2: Position): boolean {
  const dx = Math.abs(pos1.x - pos2.x)
  const dy = Math.abs(pos1.y - pos2.y)
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
}
