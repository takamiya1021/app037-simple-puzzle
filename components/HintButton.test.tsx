import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HintButton from './HintButton'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { EMPTY_TILE_ID } from '@/lib/puzzle/types'

jest.mock('@/app/actions/ai', () => ({
  generateHint: jest.fn(),
}))

jest.mock('@/lib/store/settingsStore', () => ({
  useSettingsStore: jest.fn(),
}))

const { generateHint } = jest.requireMock('@/app/actions/ai') as { generateHint: jest.Mock }
const useSettingsStore = jest.requireMock('@/lib/store/settingsStore').useSettingsStore as jest.Mock

describe('HintButton', () => {
  const baseState = (() => {
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 4)
    return state
  })()

  beforeEach(() => {
    generateHint.mockReset()
    useSettingsStore.mockReturnValue({
      aiAssistEnabled: true,
      hintLimit: 3,
    })
  })

  it('requests a hint and displays the result', async () => {
    generateHint.mockResolvedValue({ success: true, hint: 'タイル1を上に動かそう', move: { tileId: 1, direction: 'up' } })
    render(
      <HintButton
        size={4}
        state={baseState}
        hintsUsed={0}
        onHintReceived={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'ヒント' }))

    await waitFor(() => {
      expect(screen.getByText('タイル1を上に動かそう')).toBeInTheDocument()
    })
    expect(generateHint).toHaveBeenCalled()
  })

  it('disables the button when limit reached', () => {
    render(<HintButton size={4} state={baseState} hintsUsed={3} />)
    expect(screen.getByRole('button', { name: 'ヒント' })).toBeDisabled()
  })

  it('hides card when AI assist disabled', () => {
    useSettingsStore.mockReturnValue({
      aiAssistEnabled: false,
      hintLimit: 3,
    })
    render(<HintButton size={4} state={baseState} hintsUsed={0} />)
    expect(screen.getByText('AIヒントは無効になっています')).toBeInTheDocument()
  })
})
