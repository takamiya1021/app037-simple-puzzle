import { fireEvent, render, screen } from '@testing-library/react'
import SettingsModal from './SettingsModal'

jest.mock('@/lib/utils/apiKeyStorage', () => ({
  saveApiKey: jest.fn(),
  deleteApiKey: jest.fn(),
  loadApiKey: jest.fn(() => ''),
}))

jest.mock('@/lib/store/settingsStore', () => ({
  useSettingsStore: jest.fn(() => ({
    aiAssistEnabled: true,
    autoAnalysisEnabled: true,
    hintLimit: 3,
    setAiAssistEnabled: jest.fn(),
    setAutoAnalysisEnabled: jest.fn(),
    setHintLimit: jest.fn(),
  })),
}))

const storage = jest.requireMock('@/lib/utils/apiKeyStorage')

describe('SettingsModal', () => {
  it('saves keys and displays confirmation', () => {
    render(<SettingsModal open onClose={jest.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Gemini API Key'), { target: { value: 'gem-key' } })
    fireEvent.change(screen.getByPlaceholderText('Gemini Image API Key'), { target: { value: 'img-key' } })
    fireEvent.click(screen.getByText('保存する'))
    expect(storage.saveApiKey).toHaveBeenCalledWith('gemini', 'gem-key')
    expect(storage.saveApiKey).toHaveBeenCalledWith('geminiImage', 'img-key')
    expect(screen.getByText('APIキーを保存しました')).toBeInTheDocument()
  })

  it('clears individual keys', () => {
    render(<SettingsModal open onClose={jest.fn()} />)
    fireEvent.click(screen.getAllByText('削除')[0])
    expect(storage.deleteApiKey).toHaveBeenCalledWith('gemini')
  })
})
