import 'fake-indexeddb/auto'
if (typeof globalThis.structuredClone !== 'function') {
  // @ts-expect-error polyfill for test environment
  globalThis.structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value))
}
import { clearDatabase, getRecentGames, loadSetting, saveGameRecord, saveSetting } from './operations'
import type { GameMode, PuzzleSize } from '@/lib/puzzle/types'

const baseRecord = {
  completedAt: Date.now(),
  mode: 'freePlay' as GameMode,
  size: 4 as PuzzleSize,
  durationSeconds: 120,
  moveCount: 30,
  efficiencyScore: 0.8,
  imageThumbnail: null,
  timeLimitSeconds: null,
}

describe('db operations', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  it('saves and retrieves game history in reverse chronological order', async () => {
    await saveGameRecord({ ...baseRecord, completedAt: 1000, moveCount: 10 })
    await saveGameRecord({ ...baseRecord, completedAt: 2000, moveCount: 20 })
    const games = await getRecentGames(2)
    expect(games).toHaveLength(2)
    expect(games[0].completedAt).toBe(2000)
    expect(games[1].moveCount).toBe(10)
  })

  it('persists settings as JSON', async () => {
    await saveSetting('apiKey', { gemini: 'secret-key' })
    const value = await loadSetting<{ gemini: string }>('apiKey')
    expect(value).toEqual({ gemini: 'secret-key' })
  })
})
