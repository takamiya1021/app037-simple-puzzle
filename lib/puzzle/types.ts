export type PuzzleSize = 4 | 5 | 6

export type PuzzleTileId = number

export type PuzzleState = PuzzleTileId[]

export type GameMode = 'freePlay' | 'timeAttack' | 'moveChallenge'

export interface Position {
  row: number
  col: number
}

export interface PuzzleMetadata {
  size: PuzzleSize
  moveCount: number
  startTime: number
  mode: GameMode
}

export interface PuzzleTileData {
  id: PuzzleTileId
  position: Position
  isEmpty: boolean
  imageFragment?: string | null
}

export interface PuzzleMoveSuggestion {
  tileId: PuzzleTileId
  direction: 'up' | 'down' | 'left' | 'right'
  reason?: string
}

export const EMPTY_TILE_ID: PuzzleTileId = 0
