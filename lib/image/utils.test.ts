import { describe, expect, it } from '@jest/globals'
import { defaultCanvasFactory, loadImageElement, resolveImageDimensions } from './utils'

describe('image utils', () => {
  it('creates a canvas element through the default factory', () => {
    const canvas = defaultCanvasFactory()
    expect(canvas.tagName).toBe('CANVAS')
  })

  it('resolves dimensions preferring natural size', () => {
    const dims = resolveImageDimensions({ width: 400, height: 200, naturalWidth: 800, naturalHeight: 600 })
    expect(dims).toEqual({ width: 800, height: 600 })
  })

  it('loads an image element when the Image API is available', async () => {
    const OriginalImage = global.Image

    class MockImage {
      onload: (() => void) | null = null
      onerror: ((error: unknown) => void) | null = null
      crossOrigin: string | null = null
      private _src = ''

      set src(value: string) {
        this._src = value
        setTimeout(() => this.onload?.())
      }

      get src(): string {
        return this._src
      }
    }

    // @ts-expect-error override for test
    global.Image = MockImage

    try {
      const image = await loadImageElement('data:image/png;base64,abc')
      expect(image).toBeInstanceOf(MockImage as unknown as typeof Image)
    } finally {
      global.Image = OriginalImage
    }
  })

  it('throws when the Image API is unavailable', async () => {
    const OriginalImage = global.Image
    // @ts-expect-error simulate missing Image
    global.Image = undefined

    await expect(loadImageElement('data:image/png;base64,abc')).rejects.toThrow('Image API is not available')

    global.Image = OriginalImage
  })
})
