import { describe, expect, it } from '@jest/globals'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { buildHintPrompt, getNextOptimalMove } from './hintGenerator'
import { EMPTY_TILE_ID, type PuzzleMoveSuggestion } from '@/lib/puzzle/types'

describe('getNextOptimalMove', () => {
  it('returns null for solved boards', () => {
    const state = createSolvedState(4)
    expect(getNextOptimalMove(state, 4)).toBeNull()
  })

  it('returns the first optimal move with direction and tile id', () => {
    let state = createSolvedState(4)
    // move tile above empty into empty (tile moves down, so optimal hint should move it up)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 4)

    const hint = getNextOptimalMove(state, 4)
    expect(hint).not.toBeNull()
    expect((hint as PuzzleMoveSuggestion).direction).toBe('up')
    expect((hint as PuzzleMoveSuggestion).tileId).toBeGreaterThan(0)
  })

  it('derives board size automatically when omitted', () => {
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)
    const hint = getNextOptimalMove(state)
    expect(hint).not.toBeNull()
    expect((hint as PuzzleMoveSuggestion).direction).toMatch(/left|right|up|down/)
  })

  it('builds a localized prompt for Gemini', () => {
    const prompt = buildHintPrompt({ tileId: 5, direction: 'left' })
    expect(prompt).toContain('タイル番号')
    expect(prompt).toContain('左')
  })

  it('returns null when board size is unsupported', () => {
    expect(getNextOptimalMove([1, 0, 2])).toBeNull()
  })
})
