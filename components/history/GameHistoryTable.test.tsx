import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameHistoryTable } from './GameHistoryTable'
import type { GameHistoryRecord } from '@/lib/db/schema'

const sampleGames: GameHistoryRecord[] = [
  {
    id: 'fast',
    completedAt: 2000,
    mode: 'freePlay',
    size: 4,
    durationSeconds: 90,
    moveCount: 30,
    efficiencyScore: 0.85,
    imageThumbnail: null,
    timeLimitSeconds: null,
  },
  {
    id: 'slow',
    completedAt: 1000,
    mode: 'timeAttack',
    size: 5,
    durationSeconds: 200,
    moveCount: 80,
    efficiencyScore: 0.7,
    imageThumbnail: null,
    timeLimitSeconds: 300,
  },
]

describe('GameHistoryTable', () => {
  it('sorts numeric columns correctly when clicking headers', async () => {
    render(<GameHistoryTable games={sampleGames} />)
    const user = userEvent.setup()

    const moveHeader = screen.getByRole('columnheader', { name: /手数/ })
    await user.click(moveHeader)

    let rows = screen.getAllByRole('row')
    let firstRowCells = within(rows[1]).getAllByRole('cell')
    expect(firstRowCells[3]).toHaveTextContent('30')

    await user.click(moveHeader)
    rows = screen.getAllByRole('row')
    firstRowCells = within(rows[1]).getAllByRole('cell')
    expect(firstRowCells[3]).toHaveTextContent('80')
  })
})
