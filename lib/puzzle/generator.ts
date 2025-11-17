/**
 * Phase 2: Puzzle Generator (TDD - Green)
 *
 * Logic for generating and manipulating puzzle states
 */

import {
  PuzzleState,
  TileData,
  Move,
  Position,
  positionToIndex,
  indexToPosition,
  arePositionsAdjacent,
} from './types'

/**
 * Creates a solved puzzle state
 * @param size - Grid size (e.g., 4 for 4x4)
 * @returns Solved puzzle state
 */
export function createSolvedState(size: number): PuzzleState {
  const tiles: TileData[] = []
  const totalTiles = size * size

  for (let i = 0; i < totalTiles; i++) {
    tiles.push({
      id: i,
      position: indexToPosition(i, size),
      isEmpty: i === totalTiles - 1,
    })
  }

  return {
    size,
    tiles,
    emptyTileId: totalTiles - 1,
    moves: 0,
    isComplete: true,
    startTime: null,
    endTime: null,
  }
}

/**
 * Gets all valid moves for the current state
 * @param state - Current puzzle state
 * @returns Array of valid moves
 */
export function getValidMoves(state: PuzzleState): Move[] {
  const moves: Move[] = []
  const emptyTile = state.tiles.find(t => t.id === state.emptyTileId)

  if (!emptyTile) {
    return moves
  }

  const emptyPos = emptyTile.position

  // Check all four directions
  const directions: Position[] = [
    { x: emptyPos.x - 1, y: emptyPos.y }, // Left
    { x: emptyPos.x + 1, y: emptyPos.y }, // Right
    { x: emptyPos.x, y: emptyPos.y - 1 }, // Up
    { x: emptyPos.x, y: emptyPos.y + 1 }, // Down
  ]

  for (const dir of directions) {
    // Check if position is valid
    if (dir.x >= 0 && dir.x < state.size && dir.y >= 0 && dir.y < state.size) {
      const tileAtPos = state.tiles.find(
        t => t.position.x === dir.x && t.position.y === dir.y
      )

      if (tileAtPos && !tileAtPos.isEmpty) {
        moves.push({
          tileId: tileAtPos.id,
          from: dir,
          to: emptyPos,
        })
      }
    }
  }

  return moves
}

/**
 * Applies a move to the puzzle state
 * @param state - Current puzzle state
 * @param move - Move to apply
 * @returns New puzzle state
 */
export function applyMove(state: PuzzleState, move: Move): PuzzleState {
  // Create a deep copy of the state
  const newState: PuzzleState = {
    ...state,
    tiles: state.tiles.map(t => ({ ...t, position: { ...t.position } })),
    moves: state.moves + 1,
  }

  // Find the tile to move and the empty tile
  const tileToMove = newState.tiles.find(t => t.id === move.tileId)
  const emptyTile = newState.tiles.find(t => t.id === state.emptyTileId)

  if (!tileToMove || !emptyTile) {
    throw new Error('Invalid move: tile not found')
  }

  // Swap positions
  tileToMove.position = move.to
  emptyTile.position = move.from

  // Check if puzzle is complete
  newState.isComplete = checkComplete(newState)

  return newState
}

/**
 * Checks if the puzzle is in solved state
 * @param state - Puzzle state to check
 * @returns true if puzzle is solved
 */
function checkComplete(state: PuzzleState): boolean {
  return state.tiles.every(tile => {
    const expectedPos = indexToPosition(tile.id, state.size)
    return tile.position.x === expectedPos.x && tile.position.y === expectedPos.y
  })
}

/**
 * Generates a shuffled puzzle
 * @param size - Grid size
 * @param shuffleMoves - Number of random moves to shuffle
 * @returns Shuffled puzzle state
 */
export function generatePuzzle(size: number, shuffleMoves: number = 50): PuzzleState {
  let state = createSolvedState(size)
  state.isComplete = false

  // Perform random valid moves to shuffle
  for (let i = 0; i < shuffleMoves; i++) {
    const validMoves = getValidMoves(state)

    if (validMoves.length === 0) {
      break
    }

    // Choose a random valid move
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    state = applyMove(state, randomMove)
  }

  // Reset move counter after shuffling
  state.moves = 0
  state.startTime = null
  state.endTime = null

  return state
}
