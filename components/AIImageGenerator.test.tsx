import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AIImageGenerator from './AIImageGenerator'

jest.mock('@/app/actions/image', () => ({
  generateImage: jest.fn(),
}))

jest.mock('@/lib/utils/apiKeyStorage', () => ({
  loadApiKey: jest.fn(() => null),
}))

const { generateImage } = jest.requireMock('@/app/actions/image') as { generateImage: jest.Mock }

describe('AIImageGenerator', () => {
  beforeEach(() => {
    generateImage.mockReset()
  })

  it('validates prompt and shows error', async () => {
    render(<AIImageGenerator />)
    fireEvent.click(screen.getByRole('button', { name: '画像生成' }))
    expect(screen.getByText('プロンプトを入力してください')).toBeInTheDocument()
  })

  it('calls server action, displays image, and invokes onSelect', async () => {
    generateImage.mockResolvedValue({ success: true, imageData: 'data:image/png;base64,abc' })
    const onSelect = jest.fn()
    render(<AIImageGenerator onSelect={onSelect} />)
    fireEvent.change(screen.getByPlaceholderText('例：宇宙を旅する猫と流れ星'), { target: { value: 'cat' } })
    fireEvent.click(screen.getByRole('button', { name: '画像生成' }))

    await waitFor(() => {
      expect(generateImage).toHaveBeenCalled()
      expect(screen.getByAltText('AI生成画像')).toBeInTheDocument()
      expect(onSelect).toHaveBeenCalledWith('data:image/png;base64,abc')
    })
  })

  it('shows error when generation fails', async () => {
    generateImage.mockResolvedValue({ success: false, error: '失敗' })
    render(<AIImageGenerator />)
    fireEvent.change(screen.getByPlaceholderText('例：宇宙を旅する猫と流れ星'), { target: { value: 'cat' } })
    fireEvent.click(screen.getByRole('button', { name: '画像生成' }))
    await waitFor(() => {
      expect(screen.getByText('失敗')).toBeInTheDocument()
    })
  })
})
