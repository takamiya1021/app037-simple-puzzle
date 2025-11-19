import { applyHistoryFilters, buildTrendPoints, calculateHistoryStats, defaultHistoryFilters } from './analytics'
import type { GameHistoryRecord } from '@/lib/db/schema'

const baseRecord = (overrides: Partial<GameHistoryRecord> = {}): GameHistoryRecord => ({
  id: overrides.id ?? crypto.randomUUID?.() ?? Math.random().toString(16),
  completedAt: overrides.completedAt ?? Date.now(),
  mode: overrides.mode ?? 'freePlay',
  size: overrides.size ?? 4,
  durationSeconds: overrides.durationSeconds ?? 120,
  moveCount: overrides.moveCount ?? 60,
  efficiencyScore: overrides.efficiencyScore ?? 0.8,
  imageThumbnail: overrides.imageThumbnail ?? null,
  timeLimitSeconds: overrides.timeLimitSeconds ?? null,
})

describe('history analytics helpers', () => {
  it('filters by size, mode, and range', () => {
    const now = Date.now()
    const games: GameHistoryRecord[] = [
      baseRecord({ id: '1', size: 4, mode: 'freePlay', completedAt: now - 24 * 60 * 60 * 1000 }),
      baseRecord({ id: '2', size: 5, mode: 'timeAttack', completedAt: now - 10 * 24 * 60 * 60 * 1000 }),
      baseRecord({ id: '3', size: 6, mode: 'moveChallenge', completedAt: now - 40 * 24 * 60 * 60 * 1000 }),
    ]

    const byMode = applyHistoryFilters(games, { ...defaultHistoryFilters, mode: 'timeAttack' }, now)
    expect(byMode).toHaveLength(1)
    expect(byMode[0].id).toBe('2')

    const bySize = applyHistoryFilters(games, { ...defaultHistoryFilters, size: 6, range: 'all' }, now)
    expect(bySize).toHaveLength(1)
    expect(bySize[0].id).toBe('3')

    const recentOnly = applyHistoryFilters(games, { ...defaultHistoryFilters, range: '7d' }, now)
    expect(recentOnly).toHaveLength(1)
    expect(recentOnly[0].id).toBe('1')
  })

  it('computes stats per puzzle size', () => {
    const games: GameHistoryRecord[] = [
      baseRecord({ id: 'a', size: 4, durationSeconds: 90, moveCount: 40, efficiencyScore: 0.9 }),
      baseRecord({ id: 'b', size: 4, durationSeconds: 80, moveCount: 38, efficiencyScore: 0.95 }),
      baseRecord({ id: 'c', size: 5, durationSeconds: 200, moveCount: 70, efficiencyScore: 0.7 }),
    ]

    const stats = calculateHistoryStats(games)
    expect(stats.totalGames).toBe(3)
    expect(stats.averageDuration).toBeCloseTo((90 + 80 + 200) / 3)
    expect(stats.averageMoves).toBeCloseTo((40 + 38 + 70) / 3)
    expect(stats.averageEfficiency).toBeCloseTo((0.9 + 0.95 + 0.7) / 3)
    expect(stats.bestTimes[4]).toBe(80)
    expect(stats.bestMoves[4]).toBe(38)
    expect(stats.bestTimes[5]).toBe(200)
  })

  it('builds chronological trend points', () => {
    const games: GameHistoryRecord[] = [
      baseRecord({ id: 'late', completedAt: 2000, durationSeconds: 150, moveCount: 50, efficiencyScore: 0.8 }),
      baseRecord({ id: 'early', completedAt: 1000, durationSeconds: 100, moveCount: 30, efficiencyScore: 0.9 }),
    ]

    const points = buildTrendPoints(games)
    expect(points).toHaveLength(2)
    expect(points[0].completedAt).toBe(1000)
    expect(points[1].durationSeconds).toBe(150)
  })
})
