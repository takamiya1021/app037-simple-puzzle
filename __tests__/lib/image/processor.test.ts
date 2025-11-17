/**
 * Phase 1: Image Processor Tests (TDD - Red)
 *
 * Tests for image splitting into puzzle pieces
 */

import { splitImage, ImageFragment } from '@/lib/image/processor'

describe('Image Processor', () => {
  // Mock Image.prototype to trigger onload automatically in JSDOM
  beforeAll(() => {
    // @ts-ignore
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 400
      height = 400

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload()
          }
        }, 0)
      }
    }
  })

  describe('splitImage', () => {
    it('should split image into 4x4 grid (16 pieces)', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const size = 4

      const fragments = splitImage(base64, size)

      expect(fragments).toHaveLength(16)

      // Check first piece
      expect(fragments[0].index).toBe(0)
      expect(fragments[0].x).toBe(0)
      expect(fragments[0].y).toBe(0)
      expect(fragments[0].imageData).toBeTruthy()

      // Check last piece (should be empty tile)
      expect(fragments[15].index).toBe(15)
      expect(fragments[15].isEmpty).toBe(true)
    })

    it('should split image into 5x5 grid (25 pieces)', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const size = 5

      const fragments = splitImage(base64, size)

      expect(fragments).toHaveLength(25)
      expect(fragments[24].isEmpty).toBe(true)
      expect(fragments[24].index).toBe(24)
    })

    it('should split image into 6x6 grid (36 pieces)', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const size = 6

      const fragments = splitImage(base64, size)

      expect(fragments).toHaveLength(36)
      expect(fragments[35].isEmpty).toBe(true)
    })

    it('should correctly assign x, y coordinates for 4x4 grid', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const fragments = splitImage(base64, 4)

      // Check specific positions
      expect(fragments[0].x).toBe(0)
      expect(fragments[0].y).toBe(0)

      expect(fragments[3].x).toBe(3)
      expect(fragments[3].y).toBe(0)

      expect(fragments[12].x).toBe(0)
      expect(fragments[12].y).toBe(3)

      expect(fragments[15].x).toBe(3)
      expect(fragments[15].y).toBe(3)
    })

    it('should mark only the last piece as empty', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const fragments = splitImage(base64, 4)

      const emptyPieces = fragments.filter(f => f.isEmpty)
      expect(emptyPieces).toHaveLength(1)
      expect(emptyPieces[0].index).toBe(15)
    })

    it('should generate image data for each non-empty piece', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const fragments = splitImage(base64, 4)

      const nonEmptyPieces = fragments.filter(f => !f.isEmpty)

      nonEmptyPieces.forEach(piece => {
        expect(piece.imageData).toMatch(/^data:image\/png/)
      })
    })

    it('should handle different puzzle sizes consistently', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      const sizes = [4, 5, 6]

      sizes.forEach(size => {
        const fragments = splitImage(base64, size)
        const expectedLength = size * size

        expect(fragments).toHaveLength(expectedLength)
        expect(fragments[expectedLength - 1].isEmpty).toBe(true)
        expect(fragments[expectedLength - 1].index).toBe(expectedLength - 1)
      })
    })
  })

  describe('ImageFragment structure', () => {
    it('should have correct properties', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const fragments = splitImage(base64, 4)
      const fragment = fragments[0]

      expect(fragment).toHaveProperty('index')
      expect(fragment).toHaveProperty('x')
      expect(fragment).toHaveProperty('y')
      expect(fragment).toHaveProperty('imageData')
      expect(fragment).toHaveProperty('isEmpty')

      expect(typeof fragment.index).toBe('number')
      expect(typeof fragment.x).toBe('number')
      expect(typeof fragment.y).toBe('number')
      expect(typeof fragment.imageData).toBe('string')
      expect(typeof fragment.isEmpty).toBe('boolean')
    })
  })
})
