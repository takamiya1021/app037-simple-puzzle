import { describe, expect, it } from '@jest/globals'
import { computePlayMetrics, buildAnalysisPrompt, buildAnalysisFallback } from './analyzePlay'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { EMPTY_TILE_ID } from '@/lib/puzzle/types'

describe('computePlayMetrics', () => {
  it('returns null for unsupported sizes', () => {
    expect(computePlayMetrics({ initialState: [1, 2, 0], actualMoveCount: 10 })).toBeNull()
  })

  it('calculates optimal moves and efficiency', () => {
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 4)
    const metrics = computePlayMetrics({ initialState: state, actualMoveCount: 10 })
    expect(metrics).not.toBeNull()
    expect(metrics?.optimalMoveCount).toBeGreaterThan(0)
    expect(metrics?.efficiency).toBeLessThanOrEqual(1)
  })
})

describe('buildAnalysisPrompt', () => {
  it('includes metrics and context fields', () => {
    const prompt = buildAnalysisPrompt(
      { optimalMoveCount: 50, moveDifference: 10, efficiency: 0.8 },
      { moveCount: 60, durationSeconds: 125, hintsUsed: 1 }
    )
    expect(prompt).toContain('実際の手数: 60手')
    expect(prompt).toContain('最適手数: 50手')
    expect(prompt).toContain('効率スコア: 80%')
  })
})

describe('buildAnalysisFallback', () => {
  it('creates concise summary with differences', () => {
    const text = buildAnalysisFallback({ optimalMoveCount: 50, moveDifference: 10, efficiency: 0.8 }, { moveCount: 60, durationSeconds: 200 })
    expect(text).toContain('最適解との差は10手')
  })

  it('handles cases where actual moves are less than optimal', () => {
    const text = buildAnalysisFallback({ optimalMoveCount: 80, moveDifference: -5, efficiency: 1 }, { moveCount: 75, durationSeconds: 90 })
    expect(text).toContain('最適手数より少ない手数でクリアしました')
  })
})
