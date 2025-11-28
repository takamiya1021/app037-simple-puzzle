'use client'

import { useTransition, useState, useCallback, useEffect, useRef } from 'react'
import { generateAnalysis } from '@/app/actions/ai'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import { useSettingsStore } from '@/lib/store/settingsStore'

interface AnalysisReportProps {
  initialState: PuzzleState
  size: PuzzleSize
  moveCount: number
  durationSeconds: number
  hintsUsed?: number
}

const AnalysisReport = ({ initialState, size, moveCount, durationSeconds, hintsUsed = 0 }: AnalysisReportProps) => {
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{ optimalMoveCount: number; efficiency: number; moveDifference: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const { autoAnalysisEnabled } = useSettingsStore()
  const autoSignatureRef = useRef<string | null>(null)

  const handleAnalyze = useCallback(() => {
    startTransition(async () => {
      setError(null)
      const response = await generateAnalysis({
        initialState,
        size,
        moveCount,
        durationSeconds,
        hintsUsed,
      })

      if (!response.success || !response.summary) {
        setError(response.error ?? '分析に失敗しました')
        return
      }

      setSummary(response.summary)
      if (response.metrics) {
        setMetrics(response.metrics)
      }
    })
  }, [durationSeconds, hintsUsed, initialState, moveCount, size])

  useEffect(() => {
    if (!autoAnalysisEnabled) {
      autoSignatureRef.current = null
      return
    }
    if (moveCount === 0 && durationSeconds === 0) return
    const signature = `${size}-${moveCount}-${durationSeconds}-${hintsUsed}`
    if (autoSignatureRef.current === signature) return
    autoSignatureRef.current = signature
    handleAnalyze()
  }, [autoAnalysisEnabled, handleAnalyze, size, moveCount, durationSeconds, hintsUsed])

  return (
    <section className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm p-4 border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Analysis</p>
          <p className="text-lg font-semibold text-white">プレイスタイル分析</p>
          <p className="text-sm text-white/50">最適解との比較とAIコメント</p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow disabled:opacity-60 disabled:shadow-none"
        >
          {isPending ? '分析中…' : autoAnalysisEnabled ? '再実行' : 'プレイ分析'}
        </button>
      </div>

      {metrics && (
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <Metric label="実際の手数" value={`${moveCount} 手`} />
          <Metric label="最適手数" value={`${metrics.optimalMoveCount} 手`} />
          <Metric label="効率" value={`${Math.round(metrics.efficiency * 100)} %`} />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      {summary && !error && <p className="mt-3 text-sm text-white/80 bg-white/5 rounded-xl p-3">{summary}</p>}
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center">
    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
)

export default AnalysisReport
