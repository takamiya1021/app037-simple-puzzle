/**
 * Phase 1: Image Uploader Tests (TDD - Red)
 *
 * Tests for image upload, square cropping, and Base64 conversion functionality
 */

import { uploadImage, cropToSquare, imageToBase64 } from '@/lib/image/uploader'

describe('Image Uploader', () => {
  // Mock Image.prototype to trigger onload automatically in JSDOM
  beforeAll(() => {
    // @ts-ignore
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 100
      height = 100

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload()
          }
        }, 0)
      }
    }
  })

  describe('uploadImage', () => {
    it('should read a File object and return an HTMLImageElement', async () => {
      // Create a simple 1x1 pixel PNG blob
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })
      const file = new File([blob], 'test.png', { type: 'image/png' })

      const img = await uploadImage(file)

      expect(img).toBeDefined()
      expect(img.src).toContain('data:image/png;base64')
    })

    it('should reject non-image files', async () => {
      const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' })

      await expect(uploadImage(textFile)).rejects.toThrow('Invalid file type')
    })

    it('should reject empty files', async () => {
      const emptyFile = new File([], 'empty.png', { type: 'image/png' })

      await expect(uploadImage(emptyFile)).rejects.toThrow('File is empty')
    })
  })

  describe('cropToSquare', () => {
    it('should crop a rectangular image to square (landscape)', () => {
      // Create a mock landscape image (800x600)
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, 800, 600)

      const img = new Image()
      img.width = 800
      img.height = 600

      const croppedCanvas = cropToSquare(img, canvas)

      expect(croppedCanvas.width).toBe(600)
      expect(croppedCanvas.height).toBe(600)
    })

    it('should crop a rectangular image to square (portrait)', () => {
      // Create a mock portrait image (600x800)
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const img = new Image()
      img.width = 600
      img.height = 800

      const croppedCanvas = cropToSquare(img, canvas)

      expect(croppedCanvas.width).toBe(600)
      expect(croppedCanvas.height).toBe(600)
    })

    it('should not modify square images', () => {
      // Create a mock square image (500x500)
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 500

      const img = new Image()
      img.width = 500
      img.height = 500

      const croppedCanvas = cropToSquare(img, canvas)

      expect(croppedCanvas.width).toBe(500)
      expect(croppedCanvas.height).toBe(500)
    })
  })

  describe('imageToBase64', () => {
    it('should convert image to Base64 string', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'blue'
      ctx.fillRect(0, 0, 100, 100)

      const base64 = imageToBase64(canvas)

      expect(base64).toMatch(/^data:image\/png/)
      expect(typeof base64).toBe('string')
      expect(base64.length).toBeGreaterThan(0)
    })

    it('should convert with specified quality', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'green'
      ctx.fillRect(0, 0, 100, 100)

      const base64Low = imageToBase64(canvas, 0.5)
      const base64High = imageToBase64(canvas, 1.0)

      expect(base64Low).toMatch(/^data:image\/png;base64,/)
      expect(base64High).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('Full upload workflow', () => {
    it('should upload, crop, and convert image to Base64', async () => {
      // Create a simple 1x1 pixel PNG blob
      const base64Img = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const binaryString = atob(base64Img)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })
      const file = new File([blob], 'test.png', { type: 'image/png' })

      // Upload
      const img = await uploadImage(file)
      expect(img).toBeDefined()
      expect(img.src).toBeTruthy()

      // Create a mock canvas for cropping
      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 800
      mockCanvas.height = 600

      // Crop to square
      const croppedCanvas = cropToSquare(img, mockCanvas)
      expect(croppedCanvas.width).toBe(croppedCanvas.height)

      // Convert to Base64
      const base64 = imageToBase64(croppedCanvas)
      expect(base64).toMatch(/^data:image\/png/)
      expect(typeof base64).toBe('string')
    })
  })
})
