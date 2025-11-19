import { solvePuzzle } from '@/lib/puzzle/solver'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'

export interface PlayMetrics {
  optimalMoveCount: number
  moveDifference: number
  efficiency: number // 0-1 range where 1 == optimal
}

export interface PlayStatsInput {
  initialState: PuzzleState
  size?: PuzzleSize
  actualMoveCount: number
}

const SUPPORTED_SIZES = new Set<PuzzleSize>([4, 5, 6])

export function computePlayMetrics({ initialState, size, actualMoveCount }: PlayStatsInput): PlayMetrics | null {
  const resolvedSize = resolveSize(initialState, size)
  if (!resolvedSize) {
    return null
  }
  const solution = solvePuzzle(initialState, resolvedSize, { maxNodes: 50000 })
  if (!solution.solved) {
    return null
  }
  const optimalMoveCount = solution.moves.length
  const difference = actualMoveCount - optimalMoveCount
  const efficiency = optimalMoveCount === 0 || actualMoveCount <= 0 ? 1 : Math.min(1, optimalMoveCount / actualMoveCount)

  return {
    optimalMoveCount,
    moveDifference: difference,
    efficiency: Number(efficiency.toFixed(2)),
  }
}

export function buildAnalysisPrompt(metrics: PlayMetrics, context: { moveCount: number; durationSeconds: number; hintsUsed?: number }) {
  const efficiencyPercent = Math.round(metrics.efficiency * 100)
  return `あなたはスライドパズルをクリアしました。\n` +
    `実際の手数: ${context.moveCount}手\n` +
    `最適手数: ${metrics.optimalMoveCount}手\n` +
    `所要時間: ${formatDuration(context.durationSeconds)}\n` +
    `ヒント使用回数: ${context.hintsUsed ?? 0}回\n` +
    `効率スコア: ${efficiencyPercent}%\n` +
    `上記データを踏まえて、50文字以内の日本語でプレイスタイルの称賛と改善ポイントを1文でまとめてください。`
}

export function buildAnalysisFallback(metrics: PlayMetrics, context: { moveCount: number; durationSeconds: number }) {
  const efficiencyPercent = Math.round(metrics.efficiency * 100)
  const diff = context.moveCount - metrics.optimalMoveCount
  const diffText = diff >= 0 ? `最適解との差は${diff}手でした。` : '最適手数より少ない手数でクリアしました！'
  return `実際の手数${context.moveCount}、最適${metrics.optimalMoveCount}、効率${efficiencyPercent}%。${diffText}`
}

function resolveSize(state: PuzzleState, hintedSize?: PuzzleSize): PuzzleSize | null {
  if (hintedSize && SUPPORTED_SIZES.has(hintedSize)) {
    return hintedSize
  }
  const derived = Math.sqrt(state.length)
  if (!Number.isInteger(derived)) {
    return null
  }
  const candidate = derived as PuzzleSize
  return SUPPORTED_SIZES.has(candidate) ? candidate : null
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0秒'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins === 0) {
    return `${secs}秒`
  }
  return `${mins}分${secs.toString().padStart(2, '0')}秒`
}
