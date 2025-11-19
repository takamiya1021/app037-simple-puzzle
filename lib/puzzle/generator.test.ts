import { describe, expect, it } from '@jest/globals'
import { createSolvedState, generatePuzzle, getValidMoves, applyMove, isSolvable } from './generator'
import { EMPTY_TILE_ID } from './types'

describe('createSolvedState', () => {
  it.each([4, 5, 6] as const)('returns an ordered array for %ix%i boards', (size) => {
    const state = createSolvedState(size)
    const lastIndex = state.length - 1
    expect(state).toHaveLength(size * size)
    expect(state[lastIndex]).toBe(EMPTY_TILE_ID)
    expect(new Set(state).size).toBe(state.length)
  })
})

describe('generatePuzzle', () => {
  it('produces solvable states using even permutations', () => {
    const { state, size } = generatePuzzle({ size: 4, shuffleMoves: 40, rng: () => 0.75 })
    expect(state).toHaveLength(size * size)
    expect(isSolvable(state, size)).toBe(true)
  })

  it('falls back to random shuffle if rng is not provided', () => {
    const { state, size } = generatePuzzle({ size: 5, shuffleMoves: 10 })
    expect(state).toHaveLength(size * size)
  })
})

describe('getValidMoves', () => {
  it('returns indices adjacent to the empty tile', () => {
    const size = 4
    const state = createSolvedState(size)
    const moves = getValidMoves(state, size)
    expect(moves.sort()).toEqual([11, 14])
  })
})

describe('applyMove', () => {
  it('swaps the clicked tile with the empty slot', () => {
    const size = 4
    const initial = createSolvedState(size)
    const moves = getValidMoves(initial, size)
    const updated = applyMove(initial, moves[0])
    expect(updated).not.toEqual(initial)
    expect(updated[moves[0]]).toBe(EMPTY_TILE_ID)
  })
})
