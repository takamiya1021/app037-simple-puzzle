'use client'

import { useEffect, useMemo, useRef } from 'react'
import Timer from './Timer'
import MoveCounter from './MoveCounter'
import { useGameTimer } from '@/lib/hooks/useGameTimer'
import type { GameMode, PuzzleSize } from '@/lib/puzzle/types'

interface GameStatsProps {
  size: PuzzleSize
  mode: GameMode
  moveCount: number
  isRunning: boolean
  sessionId: string | number
  timeLimitSeconds?: number
  onTimeExpired?: () => void
  onTimeUpdate?: (seconds: number) => void
}

const MODE_LABELS: Record<GameMode, string> = {
  freePlay: 'フリープレイ',
  timeAttack: 'タイムアタック',
  moveChallenge: '手数チャレンジ',
}

const SIZE_LABELS: Record<PuzzleSize, string> = {
  4: '初級',
  5: '中級',
  6: '上級',
}

const GameStats = ({
  size,
  mode,
  moveCount,
  isRunning,
  sessionId,
  timeLimitSeconds,
  onTimeExpired,
  onTimeUpdate,
}: GameStatsProps) => {
  const { seconds, start, pause, reset } = useGameTimer()
  const expiredRef = useRef(false)

  useEffect(() => {
    reset()
    expiredRef.current = false
  }, [sessionId, reset])

  useEffect(() => {
    if (isRunning) {
      start()
    } else {
      pause()
    }
  }, [isRunning, pause, start, sessionId])

  useEffect(() => {
    onTimeUpdate?.(seconds)
  }, [seconds, onTimeUpdate])

  useEffect(() => {
    if (!timeLimitSeconds) return
    if (seconds >= timeLimitSeconds && !expiredRef.current) {
      expiredRef.current = true
      onTimeExpired?.()
    }
  }, [seconds, timeLimitSeconds, onTimeExpired])

  const limitProgress = useMemo(() => {
    if (!timeLimitSeconds) return null
    return Math.min(100, Math.round((seconds / timeLimitSeconds) * 100))
  }, [seconds, timeLimitSeconds])

  return (
    <section className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mode</p>
          <p className="text-lg font-semibold text-slate-700">{MODE_LABELS[mode]}</p>
          <p className="text-sm text-slate-500">{SIZE_LABELS[size]} / {size}×{size}</p>
        </div>
        {timeLimitSeconds && (
          <div className="text-right text-sm text-slate-600">
            <p>制限時間: {formatSeconds(timeLimitSeconds)}</p>
            <p>進捗: {limitProgress}%</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Timer seconds={seconds} label="タイマー" />
        <MoveCounter moves={moveCount} />
        <div className="flex flex-col rounded-xl bg-white/70 p-3 text-center shadow">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">状態</span>
          <span className="text-xl font-semibold text-slate-800">{isRunning ? '進行中' : '一時停止'}</span>
        </div>
      </div>
    </section>
  )
}

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default GameStats
