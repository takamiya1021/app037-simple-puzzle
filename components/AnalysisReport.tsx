'use client'

import { useTransition, useState } from 'react'
import { generateAnalysis } from '@/app/actions/ai'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'

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

  const handleAnalyze = () => {
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
  }

  return (
    <section className="rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Analysis</p>
          <p className="text-lg font-semibold text-slate-800">プレイスタイル分析</p>
          <p className="text-sm text-slate-500">最適解との比較とAIコメント</p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isPending}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '分析中…' : 'プレイ分析'}
        </button>
      </div>

      {metrics && (
        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <Metric label="実際の手数" value={`${moveCount} 手`} />
          <Metric label="最適手数" value={`${metrics.optimalMoveCount} 手`} />
          <Metric label="効率" value={`${Math.round(metrics.efficiency * 100)} %`} />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      {summary && !error && <p className="mt-3 text-sm text-slate-700">{summary}</p>}
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white/70 p-3 text-center shadow">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
)

export default AnalysisReport
