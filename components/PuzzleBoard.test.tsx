import { fireEvent, render, screen } from '@testing-library/react'
import PuzzleBoard from './PuzzleBoard'
import { createSolvedState } from '@/lib/puzzle/generator'

describe('PuzzleBoard', () => {
  const size = 4
  const baseState = createSolvedState(size)

  it('renders tiles for each puzzle entry', () => {
    render(<PuzzleBoard size={size} state={baseState} />)
    expect(screen.getAllByTestId('puzzle-tile')).toHaveLength(size * size)
  })

  it('invokes onMove when a movable tile is clicked', () => {
    const onMove = jest.fn()
    render(<PuzzleBoard size={size} state={baseState} onMove={onMove} />)
    const movableTile = screen.getByRole('button', { name: /tile 12/i })
    fireEvent.click(movableTile)
    expect(onMove).toHaveBeenCalledTimes(1)
  })

  it('ignores clicks on non-adjacent tiles', () => {
    const onMove = jest.fn()
    render(<PuzzleBoard size={size} state={baseState} onMove={onMove} />)
    const cornerTile = screen.getByRole('button', { name: 'Tile 1' })
    fireEvent.click(cornerTile)
    expect(onMove).not.toHaveBeenCalled()
  })
})
