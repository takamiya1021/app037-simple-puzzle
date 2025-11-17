/**
 * Phase 2: Puzzle Validator (TDD - Green)
 *
 * Functions for validating moves and checking puzzle completion
 */

import { PuzzleState, Move, indexToPosition, arePositionsAdjacent } from './types'

/**
 * Checks if a tile can be moved
 * @param state - Current puzzle state
 * @param tileId - ID of the tile to check
 * @returns true if the tile can be moved
 */
export function canMove(state: PuzzleState, tileId: number): boolean {
  // Cannot move the empty tile
  if (tileId === state.emptyTileId) {
    return false
  }

  // Find the tile and empty tile
  const tile = state.tiles.find(t => t.id === tileId)
  const emptyTile = state.tiles.find(t => t.id === state.emptyTileId)

  if (!tile || !emptyTile) {
    return false
  }

  // Check if tile is adjacent to empty space
  return arePositionsAdjacent(tile.position, emptyTile.position)
}

/**
 * Checks if the puzzle is complete (solved)
 * @param state - Puzzle state to check
 * @returns true if puzzle is solved
 */
export function isComplete(state: PuzzleState): boolean {
  if (!state.tiles || state.tiles.length === 0) {
    return false
  }

  // Check if all tiles are in their correct positions
  return state.tiles.every(tile => {
    const expectedPos = indexToPosition(tile.id, state.size)
    return tile.position.x === expectedPos.x && tile.position.y === expectedPos.y
  })
}

/**
 * Validates if a move is legal
 * @param state - Current puzzle state
 * @param move - Move to validate
 * @returns true if move is valid
 */
export function isMoveValid(state: PuzzleState, move: Move): boolean {
  // Find the tile to move
  const tile = state.tiles.find(t => t.id === move.tileId)
  if (!tile) {
    return false
  }

  // Cannot move empty tile
  if (tile.isEmpty) {
    return false
  }

  // Check if from position matches tile's current position
  if (tile.position.x !== move.from.x || tile.position.y !== move.from.y) {
    return false
  }

  // Find the empty tile
  const emptyTile = state.tiles.find(t => t.id === state.emptyTileId)
  if (!emptyTile) {
    return false
  }

  // Check if to position is the empty tile's position
  if (emptyTile.position.x !== move.to.x || emptyTile.position.y !== move.to.y) {
    return false
  }

  // Check if positions are adjacent
  if (!arePositionsAdjacent(move.from, move.to)) {
    return false
  }

  return true
}

/**
 * Validates puzzle state integrity
 * @param state - Puzzle state to validate
 * @returns true if state is valid
 */
export function validatePuzzleState(state: PuzzleState): boolean {
  // Check if size is valid
  if (state.size < 3 || state.size > 10) {
    return false
  }

  // Check if tiles array has correct length
  const expectedTiles = state.size * state.size
  if (state.tiles.length !== expectedTiles) {
    return false
  }

  // Check if there's exactly one empty tile
  const emptyTiles = state.tiles.filter(t => t.isEmpty)
  if (emptyTiles.length !== 1) {
    return false
  }

  // Check if all positions are within bounds and unique
  const positions = new Set<string>()
  for (const tile of state.tiles) {
    if (
      tile.position.x < 0 ||
      tile.position.x >= state.size ||
      tile.position.y < 0 ||
      tile.position.y >= state.size
    ) {
      return false
    }

    const posKey = `${tile.position.x},${tile.position.y}`
    if (positions.has(posKey)) {
      return false // Duplicate position
    }
    positions.add(posKey)
  }

  return true
}
