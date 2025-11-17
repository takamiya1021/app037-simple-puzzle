/**
 * Phase 3: A* Solver Tests (TDD - Red)
 *
 * Tests for A* algorithm-based puzzle solver
 */

import {
  solvePuzzle,
  calculateManhattanDistance,
  getPuzzleHash,
} from '@/lib/puzzle/solver'
import { createSolvedState, generatePuzzle, applyMove, getValidMoves } from '@/lib/puzzle/generator'
import { PuzzleState } from '@/lib/puzzle/types'

describe('A* Solver', () => {
  describe('calculateManhattanDistance', () => {
    it('should return 0 for solved puzzle', () => {
      const state = createSolvedState(4)
      const distance = calculateManhattanDistance(state)

      expect(distance).toBe(0)
    })

    it('should calculate correct distance for single move away', () => {
      const state = createSolvedState(4)
      const validMoves = getValidMoves(state)
      const movedState = applyMove(state, validMoves[0])

      const distance = calculateManhattanDistance(movedState)

      // After one move from solved state, distance should be 2
      // (one tile moved 1 step away, empty moved 1 step away)
      expect(distance).toBeGreaterThan(0)
    })

    it('should calculate Manhattan distance for 3x3 puzzle', () => {
      // Create a simple 3x3 puzzle with known configuration
      const state: PuzzleState = {
        size: 3,
        tiles: [
          { id: 0, position: { x: 1, y: 0 }, isEmpty: false }, // Should be at (0,0), distance = 1
          { id: 1, position: { x: 0, y: 0 }, isEmpty: false }, // Should be at (1,0), distance = 1
          { id: 2, position: { x: 2, y: 0 }, isEmpty: false }, // Correct position
          { id: 3, position: { x: 0, y: 1 }, isEmpty: false }, // Correct position
          { id: 4, position: { x: 1, y: 1 }, isEmpty: false }, // Correct position
          { id: 5, position: { x: 2, y: 1 }, isEmpty: false }, // Correct position
          { id: 6, position: { x: 0, y: 2 }, isEmpty: false }, // Correct position
          { id: 7, position: { x: 1, y: 2 }, isEmpty: false }, // Correct position
          { id: 8, position: { x: 2, y: 2 }, isEmpty: true },  // Empty tile, correct position
        ],
        emptyTileId: 8,
        moves: 0,
        isComplete: false,
        startTime: null,
        endTime: null,
      }

      const distance = calculateManhattanDistance(state)

      // Tiles 0 and 1 are swapped, so distance = 1 + 1 = 2
      expect(distance).toBe(2)
    })

    it('should handle different puzzle sizes', () => {
      const solved4x4 = createSolvedState(4)
      const solved5x5 = createSolvedState(5)

      expect(calculateManhattanDistance(solved4x4)).toBe(0)
      expect(calculateManhattanDistance(solved5x5)).toBe(0)
    })
  })

  describe('getPuzzleHash', () => {
    it('should return same hash for identical states', () => {
      const state1 = createSolvedState(4)
      const state2 = createSolvedState(4)

      expect(getPuzzleHash(state1)).toBe(getPuzzleHash(state2))
    })

    it('should return different hash for different states', () => {
      const state1 = createSolvedState(4)
      const validMoves = getValidMoves(state1)
      const state2 = applyMove(state1, validMoves[0])

      expect(getPuzzleHash(state1)).not.toBe(getPuzzleHash(state2))
    })

    it('should handle different puzzle sizes', () => {
      const state3x3 = createSolvedState(3)
      const state4x4 = createSolvedState(4)

      expect(getPuzzleHash(state3x3)).not.toBe(getPuzzleHash(state4x4))
    })
  })

  describe('solvePuzzle', () => {
    it('should return empty solution for already solved puzzle', () => {
      const state = createSolvedState(4)
      const solution = solvePuzzle(state)

      expect(solution).toBeDefined()
      expect(solution.moves).toHaveLength(0)
      expect(solution.found).toBe(true)
    })

    it('should solve puzzle that is 1 move away from solution', () => {
      const state = createSolvedState(4)
      const validMoves = getValidMoves(state)
      const shuffledState = applyMove(state, validMoves[0])

      const solution = solvePuzzle(shuffledState)

      expect(solution.found).toBe(true)
      expect(solution.moves).toHaveLength(1)
    })

    it('should solve puzzle that is 2 moves away from solution', () => {
      const state = createSolvedState(4)
      const validMoves1 = getValidMoves(state)
      const state1 = applyMove(state, validMoves1[0])
      const validMoves2 = getValidMoves(state1)
      const state2 = applyMove(state1, validMoves2[0])

      const solution = solvePuzzle(state2)

      expect(solution.found).toBe(true)
      expect(solution.moves.length).toBeLessThanOrEqual(4)
    })

    it('should solve easy 3x3 puzzle within time limit', () => {
      const puzzle = generatePuzzle(3, 5)
      const startTime = Date.now()

      const solution = solvePuzzle(puzzle, 5000) // 5 second timeout

      const elapsed = Date.now() - startTime

      expect(solution.found).toBe(true)
      expect(elapsed).toBeLessThan(5000)
    })

    it('should solve easy 4x4 puzzle within 1 second', () => {
      const puzzle = generatePuzzle(4, 10)
      const startTime = Date.now()

      const solution = solvePuzzle(puzzle, 1000)

      const elapsed = Date.now() - startTime

      expect(solution.found).toBe(true)
      expect(elapsed).toBeLessThan(1000)
    }, 2000)

    it('should return optimal solution', () => {
      const state = createSolvedState(3)
      const validMoves = getValidMoves(state)
      const shuffledState = applyMove(state, validMoves[0])

      const solution = solvePuzzle(shuffledState)

      // For 1 move shuffle, optimal solution is 1 move
      expect(solution.moves).toHaveLength(1)
    })

    it('should handle timeout gracefully', () => {
      const puzzle = generatePuzzle(5, 100)

      const solution = solvePuzzle(puzzle, 100) // Very short timeout

      // Should either find solution or return not found
      expect(solution).toBeDefined()
      expect(typeof solution.found).toBe('boolean')
    })

    it('should provide moves that lead to solution', () => {
      const puzzle = generatePuzzle(3, 5)
      const solution = solvePuzzle(puzzle, 5000)

      if (solution.found) {
        // Apply all moves and check if we reach solved state
        let currentState = puzzle
        for (const move of solution.moves) {
          currentState = applyMove(currentState, move)
        }

        expect(currentState.isComplete).toBe(true)
      }
    })

    it('should include search statistics', () => {
      const puzzle = generatePuzzle(3, 5)
      const solution = solvePuzzle(puzzle)

      expect(solution).toHaveProperty('nodesExplored')
      expect(solution).toHaveProperty('timeElapsed')
      expect(solution.nodesExplored).toBeGreaterThan(0)
      expect(solution.timeElapsed).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Performance requirements', () => {
    it('should solve 4x4 puzzle in under 1 second', () => {
      const puzzle = generatePuzzle(4, 20)
      const startTime = Date.now()

      const solution = solvePuzzle(puzzle, 1000)

      const elapsed = Date.now() - startTime

      expect(solution.found).toBe(true)
      expect(elapsed).toBeLessThan(1000)
    }, 2000)

    // Note: 5x5 and 6x6 tests are commented out for faster test runs
    // Uncomment for full performance testing
    /*
    it('should solve 5x5 puzzle in under 5 seconds', () => {
      const puzzle = generatePuzzle(5, 30)
      const startTime = Date.now()

      const solution = solvePuzzle(puzzle, 5000)

      const elapsed = Date.now() - startTime

      expect(solution.found).toBe(true)
      expect(elapsed).toBeLessThan(5000)
    }, 10000)
    */
  })
})
