import { renderHook, act } from '@testing-library/react'
import { useGameCompletion } from './useGameCompletion'

jest.mock('@/lib/db/operations', () => ({
  saveGameRecord: jest.fn(async () => 'id-1'),
}))

const { saveGameRecord } = jest.requireMock('@/lib/db/operations') as { saveGameRecord: jest.Mock }

describe('useGameCompletion', () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { indexedDB?: object }).indexedDB = {}
  })

  afterEach(() => {
    delete (globalThis as { indexedDB?: object }).indexedDB
  })

  it('saves game record and stores ID', async () => {
    const { result } = renderHook(() => useGameCompletion())
    await act(async () => {
      await result.current.recordCompletion({
        mode: 'freePlay',
        size: 4,
        moveCount: 100,
        durationSeconds: 120,
        efficiencyScore: 0.8,
        imageThumbnail: 'data:image/png;base64,abc',
        hintsUsed: 1,
      })
    })

    expect(saveGameRecord).toHaveBeenCalled()
    expect(result.current.lastSavedId).toBe('id-1')
  })
})
