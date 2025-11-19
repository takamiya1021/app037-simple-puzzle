import { describe, expect, it, beforeEach } from '@jest/globals'
import { generateImage } from './image'

beforeEach(() => {
  delete process.env.GEMINI_API_KEY
})

describe('generateImage', () => {
  it('fails when no API key is provided', async () => {
    const result = await generateImage({ prompt: 'cat' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('uses provided client key', async () => {
    const mockModel = {
      generateContent: jest.fn(async () => ({ response: { images: [{ data: 'BASE64DATA' }] } })),
    }
    const factory = jest.fn(() => mockModel)
    const result = await generateImage({ prompt: 'cat', clientApiKey: 'client-key', modelFactory: factory })
    expect(result.success).toBe(true)
    expect(result.imageData).toContain('data:image/png;base64,BASE64DATA')
  })

  it('falls back to error when Imagen throws', async () => {
    const factory = jest.fn(() => ({
      generateContent: () => {
        throw new Error('imagen-fail')
      },
    }))

    const result = await generateImage({ prompt: 'dog', clientApiKey: 'client-key', modelFactory: factory })
    expect(result.success).toBe(false)
    expect(result.error).toContain('エラー')
  })
})
