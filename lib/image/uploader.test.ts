import { describe, expect, it, jest } from '@jest/globals'
import {
  processUploadedFile,
  getSquareCropBox,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  encodeBytesToBase64,
} from './uploader'

describe('getSquareCropBox', () => {
  it('calculates a centered square crop when width is greater than height', () => {
    const crop = getSquareCropBox(1200, 800)
    expect(crop).toEqual({ sx: 200, sy: 0, sw: 800, sh: 800 })
  })

  it('calculates a centered square crop when height is greater than width', () => {
    const crop = getSquareCropBox(640, 1024)
    expect(crop).toEqual({ sx: 0, sy: 192, sw: 640, sh: 640 })
  })
})

describe('encodeBytesToBase64', () => {
  it('encodes using the Buffer implementation when available', () => {
    const bytes = new Uint8Array([104, 105])
    expect(encodeBytesToBase64(bytes)).toBe('aGk=')
  })

  it('falls back to btoa when Buffer is not defined', () => {
    const originalBuffer = global.Buffer
    const originalBtoa = global.btoa
    const BufferRef = originalBuffer

    // @ts-expect-error simulate missing Buffer
    global.Buffer = undefined
    global.btoa =
      originalBtoa ??
      ((value: string) => {
        return BufferRef.from(value, 'binary').toString('base64')
      })

    try {
      const bytes = new Uint8Array([1, 2, 3])
      expect(encodeBytesToBase64(bytes)).toBe(BufferRef.from(bytes).toString('base64'))
    } finally {
      global.Buffer = originalBuffer
      global.btoa = originalBtoa
    }
  })
})

describe('processUploadedFile', () => {
  const createMockDeps = () => {
    const mockCtx = {
      drawImage: jest.fn(),
    }

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => mockCtx),
      toDataURL: jest.fn(() => 'data:image/png;base64,mock-square'),
    }

    const mockImage = {
      width: 1200,
      height: 800,
    }

    return {
      mockCtx,
      mockCanvas,
      deps: {
        loadImage: jest.fn(async () => mockImage as unknown as HTMLImageElement),
        createCanvas: () => mockCanvas as unknown as HTMLCanvasElement,
      },
    }
  }

  it('rejects unsupported mime types', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'note.txt', { type: 'text/plain' })

    await expect(processUploadedFile(file)).rejects.toThrow('サポートされていない画像形式')
  })

  it('rejects files that exceed the size limit', async () => {
    const bigBytes = new Uint8Array(MAX_FILE_SIZE_BYTES + 1)
    const file = new File([bigBytes], 'huge.png', { type: SUPPORTED_IMAGE_TYPES[0] })

    await expect(
      processUploadedFile(file, { maxFileSize: 1000 })
    ).rejects.toThrow('ファイルサイズが大きすぎます')
  })

  it('reads, crops, and normalizes an image to the requested square size', async () => {
    const file = new File([new Uint8Array([10, 20, 30])], 'photo.png', { type: SUPPORTED_IMAGE_TYPES[1] })
    const { mockCtx, mockCanvas, deps } = createMockDeps()

    const result = await processUploadedFile(file, { targetSize: 400 }, deps)

    expect(result.originalDataUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(result.squareDataUrl).toBe('data:image/png;base64,mock-square')
    expect(result.size).toBe(400)
    expect(mockCanvas.width).toBe(400)
    expect(mockCanvas.height).toBe(400)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      200,
      0,
      800,
      800,
      0,
      0,
      400,
      400
    )
  })

  it('prefers the FileReader API when it is available in the environment', async () => {
    const OriginalFileReader = global.FileReader
    const file = new File([new Uint8Array([5, 6, 7])], 'reader.png', { type: SUPPORTED_IMAGE_TYPES[0] })

    class MockFileReader {
      public onload: (() => void) | null = null
      public onerror: ((err: unknown) => void) | null = null
      public result: string | ArrayBuffer | null = null

      readAsDataURL() {
        this.result = 'data:image/png;base64,file-reader-path'
        this.onload?.()
      }
    }

    // @ts-expect-error test shim
    global.FileReader = MockFileReader
    const { deps } = createMockDeps()

    try {
      const result = await processUploadedFile(file, { targetSize: 128 }, deps)
      expect(result.originalDataUrl).toBe('data:image/png;base64,file-reader-path')
    } finally {
      global.FileReader = OriginalFileReader
    }
  })

  it('throws a helpful error when 2D context cannot be created', async () => {
    const file = new File([new Uint8Array([9, 9, 9])], 'noctx.png', { type: SUPPORTED_IMAGE_TYPES[0] })

    const deps = {
      loadImage: jest.fn(async () => ({ width: 640, height: 640 }) as unknown as HTMLImageElement),
      createCanvas: () =>
        ({
          getContext: () => null,
          width: 0,
          height: 0,
          toDataURL: jest.fn(),
        }) as unknown as HTMLCanvasElement,
    }

    await expect(processUploadedFile(file, undefined, deps)).rejects.toThrow('Canvasの2Dコンテキストを初期化できませんでした')
  })
})
