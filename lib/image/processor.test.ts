import { describe, expect, it, jest } from '@jest/globals'
import { sliceImageIntoTiles } from './processor'

describe('sliceImageIntoTiles', () => {
  const dataUrl = 'data:image/png;base64,placeholder'

  const createDeps = () => {
    let tileCallCount = 0
    const ctx = {
      drawImage: jest.fn(),
      clearRect: jest.fn(),
    }

    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ctx),
      toDataURL: jest.fn(() => `data:image/png;base64,tile-${tileCallCount++}`),
    }

    return {
      ctx,
      canvas,
      deps: {
        loadImage: jest.fn(async () => ({ width: 960, height: 960 }) as unknown as HTMLImageElement),
        createCanvas: () => canvas as unknown as HTMLCanvasElement,
      },
    }
  }

  it.each([4, 5, 6])('returns fragments for %ix%i grid', async (gridSize) => {
    const { deps } = createDeps()
    const fragments = await sliceImageIntoTiles(dataUrl, { gridSize }, deps)

    expect(fragments).toHaveLength(gridSize * gridSize)
    const last = fragments[fragments.length - 1]
    expect(last.isEmpty).toBe(true)
    expect(last.dataUrl).toBeNull()
    expect(fragments.filter((fragment) => fragment.isEmpty)).toHaveLength(1)
    expect(fragments.filter((fragment) => !fragment.isEmpty)).toHaveLength(gridSize * gridSize - 1)
  })

  it('draws the correct source offsets for the generated tiles', async () => {
    const { deps, ctx, canvas } = createDeps()
    const fragments = await sliceImageIntoTiles(dataUrl, { gridSize: 4, tileRenderSize: 200 }, deps)

    expect(canvas.width).toBe(200)
    expect(canvas.height).toBe(200)
    expect(fragments[0].dataUrl).toBe('data:image/png;base64,tile-0')
    expect(fragments[1].dataUrl).toBe('data:image/png;base64,tile-1')
    const firstCall = ctx.drawImage.mock.calls[0]
    const secondCall = ctx.drawImage.mock.calls[1]
    expect(firstCall.slice(1, 5)).toEqual([0, 0, 240, 240])
    expect(secondCall.slice(1, 5)).toEqual([240, 0, 240, 240])
  })

  it('uses default grid and tile sizes when options are omitted', async () => {
    const { deps, canvas } = createDeps()
    await sliceImageIntoTiles(dataUrl, undefined, deps)
    expect(canvas.width).toBe(200)
    expect(canvas.height).toBe(200)
  })

  it('can rely on DOM defaults when dependencies are not provided', async () => {
    const OriginalImage = global.Image
    class MockImage {
      width = 512
      height = 512
      onload: (() => void) | null = null
      onerror: ((err: unknown) => void) | null = null
      crossOrigin: string | null = null

      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    }

    // @ts-expect-error override
    global.Image = MockImage

    const originalGetContext = HTMLCanvasElement.prototype.getContext
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
    const mockCtx = {
      drawImage: jest.fn(),
      clearRect: jest.fn(),
    }

    HTMLCanvasElement.prototype.getContext = function () {
      return mockCtx as unknown as CanvasRenderingContext2D
    }
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,dom-default'

    try {
      const fragments = await sliceImageIntoTiles(dataUrl)
      expect(fragments).toHaveLength(16)
      expect(mockCtx.drawImage).toHaveBeenCalled()
    } finally {
      global.Image = OriginalImage
      HTMLCanvasElement.prototype.getContext = originalGetContext
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL
    }
  })

  it('throws an error when a 2D context cannot be created', async () => {
    const deps = {
      loadImage: jest.fn(async () => ({ width: 400, height: 400 }) as unknown as HTMLImageElement),
      createCanvas: () =>
        ({
          getContext: () => null,
          width: 0,
          height: 0,
          toDataURL: jest.fn(),
        }) as unknown as HTMLCanvasElement,
    }

    await expect(sliceImageIntoTiles(dataUrl, { gridSize: 4 }, deps)).rejects.toThrow('Canvasの2Dコンテキストを初期化できませんでした')
  })
})
