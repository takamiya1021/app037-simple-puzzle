import { describe, expect, it } from '@jest/globals'
import { createSolvedState, applyMove } from './generator'
import { EMPTY_TILE_ID, type PuzzleState } from './types'
import { solvePuzzle, computeManhattanDistance, reconstructMoves, buildSolutionFrames } from './solver'

describe('computeManhattanDistance', () => {
  it('returns zero for solved state', () => {
    const state = createSolvedState(4)
    expect(computeManhattanDistance(state, 4)).toBe(0)
  })

  it('calculates distance for displaced tiles', () => {
    const state = createSolvedState(4)
    ;[state[0], state[1]] = [state[1], state[0]]
    expect(computeManhattanDistance(state, 4)).toBeGreaterThan(0)
  })
})

describe('solvePuzzle', () => {
  it('returns the optimal path for a near-solved board', () => {
    const size = 4
    let state = createSolvedState(size)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - size) // move tile above down
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1) // move tile left

    const result = solvePuzzle(state, size, { maxNodes: 5000 })
    expect(result.solved).toBe(true)
    expect(result.moves.length).toBeGreaterThan(0)
    expect(result.moves.length).toBeLessThanOrEqual(2)
    expect(result.nodesEvaluated).toBeGreaterThan(0)
    expect(result.timeMs).toBeLessThan(1000)
  })

  it('returns unsolved flag for impossible states', () => {
    const state = createSolvedState(4)
    ;[state[0], state[1]] = [state[1], state[0]]
    const result = solvePuzzle(state, 4, { maxNodes: 1000 })
    expect(result.solved).toBe(false)
  })

  it.each([5, 6] as const)('solves a simple %ix%i configuration', (size) => {
    let state = createSolvedState(size)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - size)
    const result = solvePuzzle(state, size, { maxNodes: 20000 })
    expect(result.solved).toBe(true)
    expect(result.moves.length).toBe(1)
    expect(result.timeMs).toBeLessThan(size === 5 ? 5000 : 30000)
  })
})

describe('reconstructMoves', () => {
  it('creates an ordered list of states from parent map', () => {
    const size = 4
    const solved = createSolvedState(size)
    const result = reconstructMoves(
      {
        [solved.join(',')]: null,
      },
      solved,
      size
    )
    expect(result.states).toHaveLength(1)
    expect(result.moves).toHaveLength(0)
  })
})

describe('buildSolutionFrames', () => {
  it('maps moves and states into ordered frames', () => {
    const states: PuzzleState[] = [
      [1, 2, 3, EMPTY_TILE_ID],
      [1, 2, EMPTY_TILE_ID, 3],
    ]
    const moves = [2]
    const frames = buildSolutionFrames(moves, states)
    expect(frames).toHaveLength(2)
    expect(frames[0].moveIndex).toBeNull()
    expect(frames[1].moveIndex).toBe(2)
    expect(frames[1].state).toEqual(states[1])
  })
})
