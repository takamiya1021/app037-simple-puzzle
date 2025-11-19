import { createSolvedState } from './generator'
import { EMPTY_TILE_ID, type PuzzleSize, type PuzzleState } from './types'

export function canMove(state: PuzzleState, size: PuzzleSize, tileIndex: number): boolean {
  const emptyIndex = state.indexOf(EMPTY_TILE_ID)
  if (emptyIndex === -1 || tileIndex < 0 || tileIndex >= state.length) {
    return false
  }

  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size
  const targetRow = Math.floor(tileIndex / size)
  const targetCol = tileIndex % size
  const rowDiff = Math.abs(emptyRow - targetRow)
  const colDiff = Math.abs(emptyCol - targetCol)

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

export function isComplete(state: PuzzleState): boolean {
  if (!state.includes(EMPTY_TILE_ID)) {
    return false
  }

  const size = Math.sqrt(state.length)
  if (!Number.isInteger(size)) {
    return false
  }

  const solved = createSolvedState(size as PuzzleSize)
  return state.every((value, index) => value === solved[index])
}
