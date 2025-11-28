import { fireEvent, render, screen } from '@testing-library/react'
import AISettingsPanel from './AISettingsPanel'

jest.mock('@/lib/store/settingsStore', () => ({
  useSettingsStore: jest.fn(),
}))

const useSettingsStore = jest.requireMock('@/lib/store/settingsStore').useSettingsStore as jest.Mock

describe('AISettingsPanel', () => {
  const mockActions = {
    setAiAssistEnabled: jest.fn(),
    setAutoAnalysisEnabled: jest.fn(),
    setHintLimit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useSettingsStore.mockReturnValue({
      aiAssistEnabled: true,
      autoAnalysisEnabled: false,
      hintLimit: 3,
      ...mockActions,
    })
  })

  it('toggles AI assist', () => {
    render(<AISettingsPanel />)
    fireEvent.click(screen.getByRole('switch', { name: 'ヒントを有効にする' }))
    expect(mockActions.setAiAssistEnabled).toHaveBeenCalledWith(false)
  })

  it('updates hint limit', () => {
    render(<AISettingsPanel />)
    fireEvent.change(screen.getByLabelText('ヒント最大回数'), { target: { value: '5' } })
    expect(mockActions.setHintLimit).toHaveBeenCalledWith(5)
  })
})
