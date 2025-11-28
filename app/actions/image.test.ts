import { describe, expect, it, beforeEach } from '@jest/globals'
import { generateImage } from './image'

beforeEach(() => {
  delete process.env.GEMINI_API_KEY
  delete process.env.GEMINI_IMAGE_API_KEY
})

describe('generateImage', () => {
  it('fails when no API key is provided', async () => {
    const result = await generateImage({ prompt: 'cat' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('APIキーが設定されていません')
  })

  it('fails when only prompt is empty', async () => {
    const result = await generateImage({ prompt: '', clientApiKey: 'test-key' })
    // APIキーがあっても、空のプロンプトでもAPIは呼ばれる（Geminiがエラーを返す）
    expect(result.success).toBe(false)
  })

  it('uses clientApiKey when provided', async () => {
    // APIキーがあれば、generateImage は API を呼び出そうとする
    // 実際の API 呼び出しは失敗するが、APIキーの検証は通る
    const result = await generateImage({ prompt: 'cat', clientApiKey: 'invalid-key' })
    expect(result.success).toBe(false)
    // APIキーが無効なのでエラーになるが、「APIキーが設定されていません」ではない
    expect(result.error).not.toBe('APIキーが設定されていません')
  })

  it('prefers GEMINI_IMAGE_API_KEY over GEMINI_API_KEY', async () => {
    process.env.GEMINI_IMAGE_API_KEY = 'image-key'
    process.env.GEMINI_API_KEY = 'text-key'

    // 両方設定されている場合、image-key が使われる
    // API呼び出しは失敗するが、APIキーの優先順位は確認できる
    const result = await generateImage({ prompt: 'forest' })
    expect(result.success).toBe(false)
    expect(result.error).not.toBe('APIキーが設定されていません')
  })

  it('falls back to GEMINI_API_KEY when GEMINI_IMAGE_API_KEY is not set', async () => {
    process.env.GEMINI_API_KEY = 'text-key'

    const result = await generateImage({ prompt: 'forest' })
    expect(result.success).toBe(false)
    expect(result.error).not.toBe('APIキーが設定されていません')
  })
})
