/**
 * Phase 1: Image Uploader (TDD - Green)
 *
 * Handles image file upload, square cropping, and Base64 conversion
 */

/**
 * Uploads an image file and returns an HTMLImageElement
 * @param file - The image file to upload
 * @returns Promise resolving to HTMLImageElement
 * @throws Error if file is invalid or empty
 */
export async function uploadImage(file: File): Promise<HTMLImageElement> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image file.')
  }

  // Validate file size
  if (file.size === 0) {
    throw new Error('File is empty')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve(img)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Crops an image to a square by centering it
 * @param img - The source image element
 * @param sourceCanvas - Optional source canvas (for testing)
 * @returns Canvas with the cropped square image
 */
export function cropToSquare(
  img: HTMLImageElement,
  sourceCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const size = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Calculate crop offsets to center the image
  const offsetX = (img.width - size) / 2
  const offsetY = (img.height - size) / 2

  // If sourceCanvas is provided (for testing), draw from it
  if (sourceCanvas) {
    ctx.drawImage(
      sourceCanvas,
      offsetX,
      offsetY,
      size,
      size,
      0,
      0,
      size,
      size
    )
  } else {
    // Draw the cropped portion
    ctx.drawImage(
      img,
      offsetX,
      offsetY,
      size,
      size,
      0,
      0,
      size,
      size
    )
  }

  return canvas
}

/**
 * Converts a canvas to Base64 encoded image string
 * @param canvas - The canvas to convert
 * @param quality - Image quality (0-1, default: 0.9)
 * @returns Base64 encoded image string
 */
export function imageToBase64(canvas: HTMLCanvasElement, quality = 0.9): string {
  return canvas.toDataURL('image/png', quality)
}

/**
 * Complete workflow: Upload, crop, and convert to Base64
 * @param file - The image file to process
 * @returns Promise resolving to Base64 encoded square image
 */
export async function processImageFile(file: File): Promise<string> {
  const img = await uploadImage(file)
  const croppedCanvas = cropToSquare(img)
  return imageToBase64(croppedCanvas)
}
