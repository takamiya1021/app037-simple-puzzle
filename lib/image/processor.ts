import { defaultCanvasFactory, loadImageElement, resolveImageDimensions, type CanvasFactory } from './utils'

export interface ImageFragment {
  id: number
  row: number
  col: number
  dataUrl: string | null
  isEmpty: boolean
}

export interface SliceOptions {
  gridSize?: 4 | 5 | 6
  tileRenderSize?: number
}

interface ProcessorDependencies {
  createCanvas?: CanvasFactory
  loadImage?: (src: string) => Promise<HTMLImageElement>
}

const DEFAULT_TILE_RENDER_SIZE = 200

export async function sliceImageIntoTiles(
  dataUrl: string,
  { gridSize = 4, tileRenderSize = DEFAULT_TILE_RENDER_SIZE }: SliceOptions = {},
  { createCanvas = defaultCanvasFactory, loadImage = loadImageElement }: ProcessorDependencies = {}
): Promise<ImageFragment[]> {
  const image = await loadImage(dataUrl)
  const { width, height } = resolveImageDimensions(image)
  const sourceSize = Math.min(width, height)
  const sourceTileSize = sourceSize / gridSize
  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvasの2Dコンテキストを初期化できませんでした')
  }

  canvas.width = tileRenderSize
  canvas.height = tileRenderSize

  const fragments: ImageFragment[] = []

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const isLastTile = row === gridSize - 1 && col === gridSize - 1
      if (!isLastTile) {
        ctx.clearRect(0, 0, tileRenderSize, tileRenderSize)
        ctx.drawImage(
          image,
          col * sourceTileSize,
          row * sourceTileSize,
          sourceTileSize,
          sourceTileSize,
          0,
          0,
          tileRenderSize,
          tileRenderSize
        )
      }

      fragments.push({
        id: row * gridSize + col,
        row,
        col,
        dataUrl: isLastTile ? null : canvas.toDataURL('image/png'),
        isEmpty: isLastTile,
      })
    }
  }

  return fragments
}
