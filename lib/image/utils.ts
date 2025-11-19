export type CanvasFactory = () => HTMLCanvasElement

export function defaultCanvasFactory(): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('Canvas API is only available in the browser environment')
  }
  return document.createElement('canvas')
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  if (typeof Image === 'undefined') {
    throw new Error('Image API is not available in the current environment')
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = (error) => reject(error)
    image.src = src
  })
}

export interface DimensionLike {
  width: number
  height: number
  naturalWidth?: number
  naturalHeight?: number
}

export function resolveImageDimensions(image: DimensionLike): { width: number; height: number } {
  const width = image.naturalWidth ?? image.width
  const height = image.naturalHeight ?? image.height
  return { width, height }
}
