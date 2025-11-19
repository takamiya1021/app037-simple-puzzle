import { describe, expect, it } from '@jest/globals'
import { createSolvedState } from './generator'
import { canMove, isComplete } from './validator'

describe('canMove', () => {
  it('allows moving tiles adjacent to the empty slot', () => {
    const size = 4
    const state = createSolvedState(size)
    const moveIndex = size * size - size - 1 // tile above empty
    expect(canMove(state, size, moveIndex)).toBe(true)
  })

  it('rejects tiles that are not adjacent', () => {
    const state = createSolvedState(4)
    expect(canMove(state, 4, 0)).toBe(false)
  })
})

describe('isComplete', () => {
  it('returns true only for the solved arrangement', () => {
    const solved = createSolvedState(4)
    expect(isComplete(solved)).toBe(true)

    const unsolved = [...solved]
    const temp = unsolved[0]
    unsolved[0] = unsolved[1]
    unsolved[1] = temp
    expect(isComplete(unsolved)).toBe(false)
  })

  it('guards against states without the empty tile', () => {
    const invalid = [1, 2, 3]
    expect(isComplete(invalid)).toBe(false)
  })
})
