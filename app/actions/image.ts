'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

interface GenerateImageArgs {
  prompt: string
  clientApiKey?: string
}

interface ImageResponse {
  success: boolean
  imageData?: string
  error?: string
}

/**
 * Gemini 2.5 Flash Image (Nano Banana) を使用して画像を生成
 * 
 * 公式ドキュメント: https://ai.google.dev/gemini-api/docs/image-generation
 */
export async function generateImage({ prompt, clientApiKey }: GenerateImageArgs): Promise<ImageResponse> {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { success: false, error: 'APIキーが設定されていません' }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Gemini 2.5 Flash Image (Nano Banana) モデルを使用
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        // @ts-expect-error - responseModalities is valid but not in types yet
        responseModalities: ['Text', 'Image'],
      },
    })

    // 画像生成リクエスト
    const result = await model.generateContent(prompt)
    const response = result.response
    const candidates = response.candidates

    if (!candidates || candidates.length === 0) {
      return { success: false, error: '画像を生成できませんでした' }
    }

    // レスポンスのパーツから画像データを探す
    const parts = candidates[0].content?.parts
    if (!parts) {
      return { success: false, error: '画像データを取得できませんでした' }
    }

    for (const part of parts) {
      // inlineData に画像データが含まれる
      if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
        const mimeType = part.inlineData.mimeType
        const base64 = part.inlineData.data
        return { 
          success: true, 
          imageData: `data:${mimeType};base64,${base64}` 
        }
      }
    }

    // 画像が見つからなかった場合、テキストレスポンスを確認
    const textPart = parts.find(p => p.text)
    if (textPart?.text) {
      return { success: false, error: `画像を生成できませんでした: ${textPart.text}` }
    }

    return { success: false, error: '画像データを取得できませんでした' }
  } catch (error) {
    console.error('Gemini Image error:', error)
    const message = error instanceof Error ? error.message : '画像生成中にエラーが発生しました'
    return { success: false, error: message }
  }
}
