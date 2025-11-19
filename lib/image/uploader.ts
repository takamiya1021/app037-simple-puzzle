import { defaultCanvasFactory, loadImageElement, resolveImageDimensions, type CanvasFactory } from './utils'

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const DEFAULT_TARGET_SIZE = 640

export interface UploadOptions {
  targetSize?: number
  maxFileSize?: number
}

interface UploadDependencies {
  createCanvas?: CanvasFactory
  loadImage?: (src: string) => Promise<HTMLImageElement>
}

export interface ProcessedImage {
  originalDataUrl: string
  squareDataUrl: string
  size: number
}

export function getSquareCropBox(width: number, height: number) {
  const size = Math.min(width, height)
  const sx = (width - size) / 2
  const sy = (height - size) / 2

  return { sx, sy, sw: size, sh: size }
}

export async function processUploadedFile(
  file: File,
  { targetSize = DEFAULT_TARGET_SIZE, maxFileSize = MAX_FILE_SIZE_BYTES }: UploadOptions = {},
  { createCanvas = defaultCanvasFactory, loadImage = loadImageElement }: UploadDependencies = {}
): Promise<ProcessedImage> {
  validateFileType(file)
  validateFileSize(file, maxFileSize)

  const originalDataUrl = await readFileAsDataURL(file)
  const image = await loadImage(originalDataUrl)
  const { width, height } = resolveImageDimensions(image)
  const crop = getSquareCropBox(width, height)
  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvasの2Dコンテキストを初期化できませんでした')
  }

  canvas.width = targetSize
  canvas.height = targetSize
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, targetSize, targetSize)
  const squareDataUrl = canvas.toDataURL('image/png')

  return {
    originalDataUrl,
    squareDataUrl,
    size: targetSize,
  }
}

function validateFileType(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
    throw new Error('サポートされていない画像形式です')
  }
}

function validateFileSize(file: File, maxFileSize: number) {
  if (file.size > maxFileSize) {
    throw new Error('ファイルサイズが大きすぎます')
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer)
    const base64 = encodeBytesToBase64(bytes)
    const mimeType = file.type || 'application/octet-stream'
    return `data:${mimeType};base64,${base64}`
  })
}

export function encodeBytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }

  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  if (typeof btoa !== 'undefined') {
    return btoa(binary)
  }

  throw new Error('Base64エンコードがサポートされていません')
}
