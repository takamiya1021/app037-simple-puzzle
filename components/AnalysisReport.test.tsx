import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalysisReport from './AnalysisReport'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { EMPTY_TILE_ID } from '@/lib/puzzle/types'

jest.mock('@/app/actions/ai', () => ({
  generateAnalysis: jest.fn(),
}))

jest.mock('@/lib/store/settingsStore', () => ({
  useSettingsStore: jest.fn(() => ({
    autoAnalysisEnabled: false,
  })),
}))

const { generateAnalysis } = jest.requireMock('@/app/actions/ai') as { generateAnalysis: jest.Mock }

describe('AnalysisReport', () => {
  let initialState: number[]

  beforeEach(() => {
    generateAnalysis.mockReset()
    initialState = createSolvedState(4)
    initialState = applyMove(initialState, initialState.indexOf(EMPTY_TILE_ID) - 4)
  })

  it('calls server action and renders summary', async () => {
    generateAnalysis.mockResolvedValue({ success: true, summary: '効率85%！素晴らしいプレイ', metrics: { optimalMoveCount: 50, moveDifference: 10, efficiency: 0.85 } })
    render(
      <AnalysisReport initialState={initialState} size={4} moveCount={80} durationSeconds={120} hintsUsed={1} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'プレイ分析' }))

    await waitFor(() => {
      expect(screen.getByText('効率85%！素晴らしいプレイ')).toBeInTheDocument()
    })
    expect(generateAnalysis).toHaveBeenCalled()
  })

  it('shows error message when analysis fails', async () => {
    generateAnalysis.mockResolvedValue({ success: false, error: 'fail', metrics: null })
    render(<AnalysisReport initialState={initialState} size={4} moveCount={80} durationSeconds={120} />)

    fireEvent.click(screen.getByRole('button', { name: 'プレイ分析' }))

    await waitFor(() => {
      expect(screen.getByText('fail')).toBeInTheDocument()
    })
  })
})
