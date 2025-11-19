'use client'

import { useEffect, useMemo, useState } from 'react'
import { getRecentGames } from '@/lib/db/operations'
import type { GameHistoryRecord } from '@/lib/db/schema'
import { GameHistoryChart } from './charts/GameHistoryChart'
import { GameHistoryTable } from './history/GameHistoryTable'
import {
  applyHistoryFilters,
  buildTrendPoints,
  calculateHistoryStats,
  defaultHistoryFilters,
  type HistoryFilters,
  type HistoryModeFilter,
  type HistoryRangeFilter,
} from '@/lib/history/analytics'
import type { PuzzleSize } from '@/lib/puzzle/types'

const SIZE_OPTIONS: Array<{ value: 'all' | PuzzleSize; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 4, label: '4×4 (初級)' },
  { value: 5, label: '5×5 (中級)' },
  { value: 6, label: '6×6 (上級)' },
]

const MODE_OPTIONS: Array<{ value: HistoryModeFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'freePlay', label: 'フリープレイ' },
  { value: 'timeAttack', label: 'タイムアタック' },
  { value: 'moveChallenge', label: '手数チャレンジ' },
]

const RANGE_OPTIONS: Array<{ value: HistoryRangeFilter; label: string }> = [
  { value: '7d', label: '直近7日' },
  { value: '30d', label: '直近30日' },
  { value: 'all', label: 'すべての履歴' },
]

const PUZZLE_SIZES: PuzzleSize[] = [4, 5, 6]
const SIZE_LABEL: Record<PuzzleSize, string> = {
  4: '初級',
  5: '中級',
  6: '上級',
}

const formatDuration = (seconds: number | null) => {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return '--'
  if (seconds < 60) return `${Math.round(seconds)}秒`
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return `${minutes}分${remainder.toString().padStart(2, '0')}秒`
}

const formatMoves = (moves: number | null) => {
  if (!moves || !Number.isFinite(moves) || moves <= 0) return '--'
  return `${Math.round(moves)}手`
}

const formatEfficiency = (ratio: number) => {
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return '--'
  return `${Math.round(ratio * 100)}%`
}

const HistoryView = () => {
  const [games, setGames] = useState<GameHistoryRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<HistoryFilters>(defaultHistoryFilters)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (typeof indexedDB === 'undefined') {
          setError('IndexedDBが利用できません')
          return
        }
        const recent = await getRecentGames(50)
        if (!cancelled) {
          setGames(recent)
        }
      } catch (err) {
        console.error('Failed to load history', err)
        if (!cancelled) {
          setError('履歴を読み込めませんでした')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredGames = useMemo(() => applyHistoryFilters(games, filters), [games, filters])
  const stats = useMemo(() => calculateHistoryStats(filteredGames), [filteredGames])
  const trendPoints = useMemo(() => buildTrendPoints(filteredGames), [filteredGames])
  const rangeLabel = RANGE_OPTIONS.find((opt) => opt.value === filters.range)?.label ?? '直近30日'
  const hasMatches = filteredGames.length > 0

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters((prev) => {
      if (key === 'size') {
        return { ...prev, size: value === 'all' ? 'all' : Number(value) as PuzzleSize }
      }
      if (key === 'mode') {
        return { ...prev, mode: value as HistoryModeFilter }
      }
      return { ...prev, range: value as HistoryRangeFilter }
    })
  }

  if (error) {
    return <p className="text-sm text-rose-500">{error}</p>
  }

  if (loading) {
    return <p className="text-sm text-slate-500">履歴を読み込み中...</p>
  }

  if (games.length === 0) {
    return <p className="text-sm text-slate-500">履歴がありません</p>
  }

  const summaryCards = [
    { label: '平均クリアタイム', value: formatDuration(stats.averageDuration) },
    { label: '平均手数', value: formatMoves(stats.averageMoves) },
    { label: '平均効率', value: formatEfficiency(stats.averageEfficiency) },
  ]

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-inner">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">履歴と統計</h3>
          <p className="text-xs text-slate-500">{rangeLabel}・{filteredGames.length}件表示 / 総履歴 {games.length}件</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <label htmlFor="mode-filter" className="flex flex-col gap-1 font-semibold">
            モード
            <select
              id="mode-filter"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm"
              value={filters.mode}
              onChange={(event) => handleFilterChange('mode', event.target.value)}
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="size-filter" className="flex flex-col gap-1 font-semibold">
            サイズ
            <select
              id="size-filter"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm"
              value={filters.size}
              onChange={(event) => handleFilterChange('size', event.target.value)}
            >
              {SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="range-filter" className="flex flex-col gap-1 font-semibold">
            期間
            <select
              id="range-filter"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm"
              value={filters.range}
              onChange={(event) => handleFilterChange('range', event.target.value)}
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {PUZZLE_SIZES.map((size) => (
          <div key={size} className="rounded-2xl border border-slate-100 bg-white/70 p-4">
            <p className="text-xs font-semibold text-slate-500">{SIZE_LABEL[size]}</p>
            <p className="text-lg font-bold text-slate-800">{size}×{size}</p>
            <p className="text-sm text-slate-600">ベストタイム: {formatDuration(stats.bestTimes[size])}</p>
            <p className="text-xs text-slate-500">最少手数: {formatMoves(stats.bestMoves[size])}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <GameHistoryChart
          points={trendPoints}
          metric="durationSeconds"
          label="クリアタイム推移"
          unit="秒"
          color="#0ea5e9"
        />
        <GameHistoryChart
          points={trendPoints}
          metric="moveCount"
          label="手数推移"
          unit="手"
          color="#8b5cf6"
        />
      </div>
      <div className="mt-4">
        <GameHistoryChart
          points={trendPoints}
          metric="efficiency"
          label="効率スコア推移"
          unit="%"
          color="#f97316"
        />
      </div>

      <div className="mt-6">
        {hasMatches ? (
          <GameHistoryTable games={filteredGames} />
        ) : (
          <p className="text-sm text-slate-500">条件に一致する履歴がありません</p>
        )}
      </div>
    </section>
  )
}

export default HistoryView
