'use client'

import { useTransition, useState, useCallback, useEffect, useRef } from 'react'
import { generateAnalysis } from '@/app/actions/ai'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import { useSettingsStore } from '@/lib/store/settingsStore'
import { loadApiKey } from '@/lib/utils/apiKeyStorage'
import type { DetailedAnalysis } from '@/lib/ai/analyzePlay'

interface AnalysisReportProps {
  initialState: PuzzleState
  size: PuzzleSize
  moveCount: number
  durationSeconds: number
  hintsUsed?: number
}

const AnalysisReport = ({ initialState, size, moveCount, durationSeconds, hintsUsed = 0 }: AnalysisReportProps) => {
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{ optimalMoveCount: number; efficiency: number; moveDifference: number } | null>(null)
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isAiGenerated, setIsAiGenerated] = useState(false)
  const { autoAnalysisEnabled } = useSettingsStore()
  const autoSignatureRef = useRef<string | null>(null)

  const handleAnalyze = useCallback(() => {
    startTransition(async () => {
      setError(null)
      const clientApiKey = loadApiKey('gemini')
      const response = await generateAnalysis({
        initialState,
        size,
        moveCount,
        durationSeconds,
        hintsUsed,
        clientApiKey: clientApiKey ?? undefined,
      })

      if (!response.success) {
        setError(response.error ?? '分析に失敗しました')
        return
      }

      if (response.metrics) {
        setMetrics(response.metrics)
      }
      if (response.detailedAnalysis) {
        setDetailedAnalysis(response.detailedAnalysis)
      }
      setIsAiGenerated(!response.isDefaultMessage)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}秒`
    return `${mins}分${secs.toString().padStart(2, '0')}秒`
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Analysis</p>
            {isAiGenerated && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                ✨ Gemini
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-white">プレイスタイル分析</p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow disabled:opacity-60 disabled:shadow-none"
        >
          {isPending ? '分析中…' : '再分析'}
        </button>
      </div>

      {/* Play Style Badge */}
      {detailedAnalysis && (
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300 font-bold text-lg">
            🎮 {detailedAnalysis.playStyle}
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid gap-3 text-sm grid-cols-2 md:grid-cols-4">
          <Metric label="実際の手数" value={`${moveCount}手`} icon="👆" />
          <Metric label="最適手数" value={`${metrics.optimalMoveCount}手`} icon="⭐" />
          <Metric 
            label="効率" 
            value={`${Math.round(metrics.efficiency * 100)}%`} 
            icon="📊"
            highlight={metrics.efficiency >= 0.8}
          />
          <Metric label="所要時間" value={formatTime(durationSeconds)} icon="⏱️" />
        </div>
      )}

      {/* Detailed Analysis Cards */}
      {detailedAnalysis && (
        <div className="grid gap-3 md:grid-cols-2">
          <AnalysisCard 
            icon="🏆" 
            title="称賛ポイント" 
            content={detailedAnalysis.praise}
            gradient="from-amber-500/20 to-orange-500/20"
            borderColor="border-amber-400/30"
          />
          <AnalysisCard 
            icon="💡" 
            title="改善アドバイス" 
            content={detailedAnalysis.improvement}
            gradient="from-blue-500/20 to-cyan-500/20"
            borderColor="border-blue-400/30"
          />
        </div>
      )}

      {/* Next Challenge */}
      {detailedAnalysis && (
        <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-green-400/70">Next Challenge</p>
              <p className="text-white font-semibold">{detailedAnalysis.nextChallenge}</p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl p-3">{error}</p>}
      
      {isPending && !detailedAnalysis && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-purple-400"></div>
          <p className="mt-2 text-white/50 text-sm">AIが分析中...</p>
        </div>
      )}
    </section>
  )
}

const Metric = ({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) => (
  <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30' : 'bg-white/10 border border-white/10'}`}>
    <p className="text-lg mb-1">{icon}</p>
    <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-green-300' : 'text-white'}`}>{value}</p>
  </div>
)

const AnalysisCard = ({ icon, title, content, gradient, borderColor }: { 
  icon: string; 
  title: string; 
  content: string;
  gradient: string;
  borderColor: string;
}) => (
  <div className={`rounded-xl bg-gradient-to-br ${gradient} border ${borderColor} p-4`}>
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">{title}</p>
        <p className="text-white/90">{content}</p>
      </div>
    </div>
  </div>
)

export default AnalysisReport
