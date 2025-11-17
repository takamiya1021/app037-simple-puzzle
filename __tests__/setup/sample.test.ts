/**
 * Phase 0: Sample Test (TDD - Red/Green/Refactor)
 *
 * Purpose: Verify that the test environment is properly configured
 */

describe('Test Environment Setup', () => {
  describe('Jest Configuration', () => {
    it('should run basic assertions', () => {
      expect(true).toBe(true)
    })

    it('should handle basic math operations', () => {
      const sum = (a: number, b: number) => a + b
      expect(sum(2, 3)).toBe(5)
      expect(sum(-1, 1)).toBe(0)
    })

    it('should handle arrays', () => {
      const numbers = [1, 2, 3, 4, 5]
      expect(numbers).toHaveLength(5)
      expect(numbers).toContain(3)
    })

    it('should handle objects', () => {
      const puzzle = {
        size: 4,
        moves: 0,
        completed: false,
      }
      expect(puzzle).toHaveProperty('size', 4)
      expect(puzzle.completed).toBe(false)
    })
  })

  describe('Async Operations', () => {
    it('should handle promises', async () => {
      const asyncFunction = () => Promise.resolve('success')
      await expect(asyncFunction()).resolves.toBe('success')
    })

    it('should handle async/await', async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      const start = Date.now()
      await delay(10)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(10)
    })
  })

  describe('TypeScript Support', () => {
    interface PuzzleState {
      tiles: number[]
      emptyIndex: number
    }

    it('should support TypeScript types', () => {
      const state: PuzzleState = {
        tiles: [1, 2, 3, 0],
        emptyIndex: 3,
      }
      expect(state.tiles).toHaveLength(4)
      expect(state.emptyIndex).toBe(3)
    })
  })
})
