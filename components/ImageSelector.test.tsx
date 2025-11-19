/* eslint-disable react/display-name */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ImageSelector from './ImageSelector'

jest.mock('@/lib/image/presets', () => ({
  presetCategories: [{ id: 'animals', label: 'Animals', description: '' }],
  presetImages: [
    { id: 'dog', name: 'Dog', category: 'animals', src: '/dog.png', accent: '#fff', description: '' },
  ],
}))

jest.mock('@/lib/image/uploader', () => ({
  processUploadedFile: jest.fn(async () => ({ squareDataUrl: 'data:upload', originalDataUrl: 'data:original', size: 600 })),
}))

jest.mock('./AIImageGenerator', () => ({ onSelect }: { onSelect?: (image: string) => void }) => (
  <button type="button" onClick={() => onSelect?.('data:ai')}>
    mock-ai
  </button>
))

const { processUploadedFile } = jest.requireMock('@/lib/image/uploader') as { processUploadedFile: jest.Mock }

describe('ImageSelector', () => {
  it('handles preset selection', () => {
    const onSelect = jest.fn()
    render(<ImageSelector selectedImage={null} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'プリセット' }))
    fireEvent.click(screen.getByText('Dog'))
    expect(onSelect).toHaveBeenCalledWith('/dog.png', 'preset')
  })

  it('handles upload input change', async () => {
    const onSelect = jest.fn()
    render(<ImageSelector selectedImage={null} onSelect={onSelect} />)
    const input = screen.getByLabelText('image-upload-input') as HTMLInputElement
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(processUploadedFile).toHaveBeenCalled()
      expect(onSelect).toHaveBeenCalledWith('data:upload', 'upload')
    })
  })

  it('handles AI generation selection', () => {
    const onSelect = jest.fn()
    render(<ImageSelector selectedImage={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'AI生成' }))
    fireEvent.click(screen.getByText('mock-ai'))
    expect(onSelect).toHaveBeenCalledWith('data:ai', 'ai')
  })
})
