import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryView from './HistoryView'

const now = Date.now()

const mockHistory = [
  {
    id: 'a',
    completedAt: now - 1_000,
    mode: 'freePlay' as const,
    size: 4 as const,
    durationSeconds: 120,
    moveCount: 80,
    efficiencyScore: 0.8,
    imageThumbnail: 'data:image/png;base64,aaa',
    timeLimitSeconds: null,
  },
  {
    id: 'b',
    completedAt: now - 2_000,
    mode: 'timeAttack' as const,
    size: 5 as const,
    durationSeconds: 90,
    moveCount: 60,
    efficiencyScore: 0.9,
    imageThumbnail: null,
    timeLimitSeconds: 300,
  },
  {
    id: 'c',
    completedAt: now - 3_000,
    mode: 'moveChallenge' as const,
    size: 6 as const,
    durationSeconds: 300,
    moveCount: 120,
    efficiencyScore: 0.6,
    imageThumbnail: null,
    timeLimitSeconds: null,
  },
]

jest.mock('@/lib/db/operations', () => ({
  getRecentGames: jest.fn(async () => mockHistory),
}))

describe('HistoryView', () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { indexedDB?: IDBFactory }).indexedDB = {} as IDBFactory
  })

  afterEach(() => {
    delete (globalThis as { indexedDB?: IDBFactory }).indexedDB
  })

  it('filters by mode and size via dropdown controls', async () => {
    render(<HistoryView />)
    const user = userEvent.setup()

    const sizeSelect = await screen.findByLabelText('サイズ')
    await user.selectOptions(sizeSelect, '5')
    const table = await screen.findByRole('table')
    expect(within(table).getByText('5×5')).toBeInTheDocument()
    expect(within(table).queryByText('4×4')).not.toBeInTheDocument()

    const modeSelect = screen.getByLabelText('モード')
    await user.selectOptions(modeSelect, 'moveChallenge')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('条件に一致する履歴がありません')).toBeInTheDocument()
  })

  it('shows aggregated stats for the filtered dataset', async () => {
    render(<HistoryView />)

    expect(await screen.findByText(/平均クリアタイム/)).toBeInTheDocument()
    expect(screen.getByText(/平均効率/)).toBeInTheDocument()
    expect(screen.getAllByText(/ベストタイム/)).toHaveLength(3)
  })
})
