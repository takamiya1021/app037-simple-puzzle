import type { GameHistoryRecord } from '@/lib/db/schema'
import type { GameMode, PuzzleSize } from '@/lib/puzzle/types'

export type HistoryModeFilter = GameMode | 'all'
export type HistorySizeFilter = PuzzleSize | 'all'
export type HistoryRangeFilter = '7d' | '30d' | 'all'

export interface HistoryFilters {
  mode: HistoryModeFilter
  size: HistorySizeFilter
  range: HistoryRangeFilter
}

export const defaultHistoryFilters: HistoryFilters = {
  mode: 'all',
  size: 'all',
  range: '30d',
}

const PUZZLE_SIZES: PuzzleSize[] = [4, 5, 6]
const RANGE_WINDOWS_MS: Record<Exclude<HistoryRangeFilter, 'all'>, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

const createSizeMap = () =>
  PUZZLE_SIZES.reduce<Record<PuzzleSize, number | null>>((acc, size) => {
    acc[size] = null
    return acc
  }, {} as Record<PuzzleSize, number | null>)

export interface HistoryStats {
  totalGames: number
  averageDuration: number
  averageMoves: number
  averageEfficiency: number
  bestTimes: Record<PuzzleSize, number | null>
  bestMoves: Record<PuzzleSize, number | null>
}

export interface HistoryTrendPoint {
  completedAt: number
  label: string
  durationSeconds: number
  moveCount: number
  efficiency: number
  size: PuzzleSize
}

export function applyHistoryFilters(
  games: GameHistoryRecord[],
  filters: HistoryFilters,
  referenceTime = Date.now(),
): GameHistoryRecord[] {
  const filtered = games.filter((game) => {
    if (filters.mode !== 'all' && game.mode !== filters.mode) {
      return false
    }
    if (filters.size !== 'all' && game.size !== filters.size) {
      return false
    }
    if (filters.range !== 'all') {
      const windowMs = RANGE_WINDOWS_MS[filters.range]
      const cutoff = referenceTime - windowMs
      if (game.completedAt < cutoff) {
        return false
      }
    }
    return true
  })

  return filtered.sort((a, b) => b.completedAt - a.completedAt)
}

export function calculateHistoryStats(games: GameHistoryRecord[]): HistoryStats {
  if (games.length === 0) {
    return {
      totalGames: 0,
      averageDuration: 0,
      averageMoves: 0,
      averageEfficiency: 0,
      bestTimes: createSizeMap(),
      bestMoves: createSizeMap(),
    }
  }

  const totals = games.reduce(
    (acc, game) => {
      acc.duration += game.durationSeconds
      acc.moves += game.moveCount
      acc.efficiency += game.efficiencyScore
      return acc
    },
    { duration: 0, moves: 0, efficiency: 0 },
  )

  const bestTimes = createSizeMap()
  const bestMoves = createSizeMap()

  for (const game of games) {
    const currentBestTime = bestTimes[game.size]
    if (currentBestTime === null || game.durationSeconds < currentBestTime) {
      bestTimes[game.size] = game.durationSeconds
    }
    const currentBestMoves = bestMoves[game.size]
    if (currentBestMoves === null || game.moveCount < currentBestMoves) {
      bestMoves[game.size] = game.moveCount
    }
  }

  return {
    totalGames: games.length,
    averageDuration: totals.duration / games.length,
    averageMoves: totals.moves / games.length,
    averageEfficiency: totals.efficiency / games.length,
    bestTimes,
    bestMoves,
  }
}

export function buildTrendPoints(games: GameHistoryRecord[]): HistoryTrendPoint[] {
  return [...games]
    .sort((a, b) => a.completedAt - b.completedAt)
    .map((game) => ({
      completedAt: game.completedAt,
      label: new Date(game.completedAt).toLocaleDateString(),
      durationSeconds: game.durationSeconds,
      moveCount: game.moveCount,
      efficiency: Math.round(game.efficiencyScore * 100),
      size: game.size,
    }))
}
