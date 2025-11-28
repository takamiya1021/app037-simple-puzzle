'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

type ImagenModel = {
  generateContent: (request: { prompt: string }) => Promise<{ response: { images?: Array<{ data: string }> } }>
}

type ImagenFactory = (apiKey: string) => ImagenModel

interface GenerateImageArgs {
  prompt: string
  clientApiKey?: string
  modelFactory?: ImagenFactory
}

interface ImageResponse {
  success: boolean
  imageData?: string
  error?: string
}

export async function generateImage({ prompt, clientApiKey, modelFactory }: GenerateImageArgs): Promise<ImageResponse> {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { success: false, error: 'APIキーが設定されていません' }
  }

  const factory = modelFactory ?? defaultImagenFactory

  try {
    const model = factory(apiKey)
    // パズル用に正方形（1:1）の画像を生成するプロンプトを構築
    const squarePrompt = `Generate a square image (1:1 aspect ratio, exactly square dimensions). ${prompt}`
    const result = await model.generateContent({ prompt: squarePrompt })
    const base64 = result.response?.images?.[0]?.data
    if (!base64) {
      return { success: false, error: '画像データを取得できませんでした' }
    }
    return { success: true, imageData: `data:image/png;base64,${base64}` }
  } catch (error) {
    console.error('Imagen error:', error)
    return { success: false, error: '画像生成中にエラーが発生しました' }
  }
}

function defaultImagenFactory(apiKey: string): ImagenModel {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'imagen-4.0-generate-001' }) as ImagenModel
}
