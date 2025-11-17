/**
 * Phase 2: Puzzle Validator Tests (TDD - Red)
 *
 * Tests for move validation and completion checking
 */

import { canMove, isComplete, isMoveValid } from '@/lib/puzzle/validator'
import { createSolvedState, generatePuzzle, applyMove, getValidMoves } from '@/lib/puzzle/generator'
import { PuzzleState } from '@/lib/puzzle/types'

describe('Puzzle Validator', () => {
  describe('canMove', () => {
    it('should allow moving tile adjacent to empty space', () => {
      const state = createSolvedState(4)
      // In solved state, empty is at (3,3), tile 14 is at (2,3)

      const result = canMove(state, 14)

      expect(result).toBe(true)
    })

    it('should not allow moving tile far from empty space', () => {
      const state = createSolvedState(4)
      // Tile 0 is at (0,0), empty is at (3,3) - not adjacent

      const result = canMove(state, 0)

      expect(result).toBe(false)
    })

    it('should not allow moving empty tile', () => {
      const state = createSolvedState(4)

      const result = canMove(state, state.emptyTileId)

      expect(result).toBe(false)
    })

    it('should not allow moving non-existent tile', () => {
      const state = createSolvedState(4)

      const result = canMove(state, 999)

      expect(result).toBe(false)
    })

    it('should handle different puzzle sizes', () => {
      const state5x5 = createSolvedState(5)
      // In 5x5, empty is at (4,4), tile 23 is at (3,4)

      expect(canMove(state5x5, 23)).toBe(true)
      expect(canMove(state5x5, 0)).toBe(false)
    })
  })

  describe('isComplete', () => {
    it('should return true for solved puzzle', () => {
      const state = createSolvedState(4)

      expect(isComplete(state)).toBe(true)
    })

    it('should return false for unsolved puzzle', () => {
      const state = generatePuzzle(4, 10)

      expect(isComplete(state)).toBe(false)
    })

    it('should return false after making a move from solved state', () => {
      const state = createSolvedState(4)
      const validMoves = getValidMoves(state)
      const newState = applyMove(state, validMoves[0])

      expect(isComplete(newState)).toBe(false)
    })

    it('should handle different puzzle sizes', () => {
      expect(isComplete(createSolvedState(4))).toBe(true)
      expect(isComplete(createSolvedState(5))).toBe(true)
      expect(isComplete(createSolvedState(6))).toBe(true)
    })
  })

  describe('isMoveValid', () => {
    it('should validate move with correct tile and positions', () => {
      const state = createSolvedState(4)
      const validMoves = getValidMoves(state)
      const move = validMoves[0]

      expect(isMoveValid(state, move)).toBe(true)
    })

    it('should reject move with non-adjacent positions', () => {
      const state = createSolvedState(4)

      const invalidMove = {
        tileId: 0,
        from: { x: 0, y: 0 },
        to: { x: 3, y: 3 },
      }

      expect(isMoveValid(state, invalidMove)).toBe(false)
    })

    it('should reject move with empty tile', () => {
      const state = createSolvedState(4)
      const emptyTile = state.tiles.find(t => t.isEmpty)!

      const invalidMove = {
        tileId: emptyTile.id,
        from: emptyTile.position,
        to: { x: emptyTile.position.x - 1, y: emptyTile.position.y },
      }

      expect(isMoveValid(state, invalidMove)).toBe(false)
    })

    it('should reject move to position not containing empty tile', () => {
      const state = createSolvedState(4)

      const invalidMove = {
        tileId: 0,
        from: { x: 0, y: 0 },
        to: { x: 1, y: 0 }, // This position is not empty
      }

      expect(isMoveValid(state, invalidMove)).toBe(false)
    })

    it('should reject move with wrong from position', () => {
      const state = createSolvedState(4)

      const invalidMove = {
        tileId: 14,
        from: { x: 0, y: 0 }, // Wrong from position
        to: { x: 3, y: 3 },
      }

      expect(isMoveValid(state, invalidMove)).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty state gracefully', () => {
      const emptyState: PuzzleState = {
        size: 4,
        tiles: [],
        emptyTileId: 15,
        moves: 0,
        isComplete: false,
        startTime: null,
        endTime: null,
      }

      expect(canMove(emptyState, 0)).toBe(false)
      expect(isComplete(emptyState)).toBe(false)
    })

    it('should validate moves in corner positions', () => {
      const state = createSolvedState(3)
      // 3x3 puzzle, empty at (2,2), can move tiles at (1,2) and (2,1)

      expect(canMove(state, 7)).toBe(true) // tile at (1,2)
      expect(canMove(state, 5)).toBe(true) // tile at (2,1)
      expect(canMove(state, 0)).toBe(false) // tile at (0,0)
    })
  })
})
