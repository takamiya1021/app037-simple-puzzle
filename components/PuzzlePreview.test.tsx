/* eslint-disable react/display-name, @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import PuzzlePreview from './PuzzlePreview'

jest.mock('@/lib/puzzle/generator', () => {
  const solved = Array.from({ length: 16 }, (_, index) => (index === 15 ? 0 : index + 1))
  return {
    createSolvedState: jest.fn(() => solved.slice()),
    generatePuzzle: jest.fn(() => ({ state: solved.slice().reverse(), size: 4 })),
    applyMove: jest.fn((state) => state),
  }
})

jest.mock('@/lib/image/processor', () => ({
  sliceImageIntoTiles: jest.fn(async () => [
    { id: 0, row: 0, col: 0, dataUrl: 'fragment-1', isEmpty: false },
    { id: 1, row: 0, col: 1, dataUrl: 'fragment-2', isEmpty: false },
    { id: 2, row: 0, col: 2, dataUrl: null, isEmpty: true },
  ]),
}))

jest.mock('./GameStats', () => (props: any) => (
  <div data-testid="stats" data-session={props.sessionId} data-mode={props.mode} data-limit={props.timeLimitSeconds}>
    <button type="button" onClick={() => props.onTimeUpdate?.(42)}>
      tick
    </button>
  </div>
))

jest.mock('./GameModeSelector', () => (props: any) => (
  <button type="button" onClick={() => props.onChange('timeAttack')}>
    mode
  </button>
))

jest.mock('./HintButton', () => (props: any) => (
  <div data-testid="hint" data-hints={props.hintsUsed}>
    <button type="button" onClick={() => props.onHintReceived?.({ success: true })}>
      use hint
    </button>
  </div>
))

jest.mock('./PuzzleBoard', () => () => <div data-testid="board">board</div>)
jest.mock('./OptimalSolutionViewer', () => () => <div data-testid="optimal">optimal</div>)
jest.mock('./AIImageGenerator', () => () => <div data-testid="ai-image">ai-image</div>)
jest.mock('./ImageSelector', () => (props: any) => (
  <div data-testid="image-selector">
    <button type="button" onClick={() => props.onSelect('data:image', 'upload')}>
      pick-image
    </button>
  </div>
))
jest.mock('./AnalysisReport', () => (props: any) => (
  <div data-testid="analysis" data-duration={props.durationSeconds}>
    analysis
  </div>
))
jest.mock('./SettingsModal', () => (props: any) => (
  props.open ? (
    <div data-testid="settings-modal">
      modal
      <button type="button" onClick={props.onClose}>
        close
      </button>
    </div>
  ) : null
))

describe('PuzzlePreview', () => {
  it('increments session when shuffled', () => {
    render(<PuzzlePreview />)
    const stats = screen.getByTestId('stats')
    const initialSession = stats.getAttribute('data-session')
    fireEvent.click(screen.getByRole('button', { name: 'しゃっふる' }))
    expect(screen.getByTestId('stats').getAttribute('data-session')).not.toBe(initialSession)
  })

  it('updates elapsed seconds via GameStats callback and passes to AnalysisReport', () => {
    render(<PuzzlePreview />)
    const tickButton = within(screen.getByTestId('stats')).getByRole('button', { name: 'tick' })
    fireEvent.click(tickButton)
    expect(screen.getByTestId('analysis').getAttribute('data-duration')).toBe('42')
  })

  it('tracks hint usage through callback', () => {
    render(<PuzzlePreview />)
    const hintSection = screen.getByTestId('hint')
    expect(hintSection.getAttribute('data-hints')).toBe('0')
    fireEvent.click(within(hintSection).getByRole('button', { name: 'use hint' }))
    expect(screen.getByTestId('hint').getAttribute('data-hints')).toBe('1')
  })

  it('opens settings modal when pressing 設定 button', () => {
    render(<PuzzlePreview />)

    fireEvent.click(screen.getByRole('button', { name: '設定' }))

    expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
  })

  it('updates image selection state when ImageSelector emits selection', () => {
    render(<PuzzlePreview />)
    fireEvent.click(screen.getByText('pick-image'))
    return waitFor(() => {
      expect(screen.getByTestId('image-state').getAttribute('data-selected')).toBe('set')
    })
  })
})
