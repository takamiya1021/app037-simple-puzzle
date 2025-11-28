import { solvePuzzle } from '@/lib/puzzle/solver'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'

export interface PlayMetrics {
  optimalMoveCount: number
  moveDifference: number
  efficiency: number // 0-1 range where 1 == optimal
}

export interface DetailedAnalysis {
  playStyle: string       // プレイスタイルの特徴
  praise: string          // 称賛ポイント
  improvement: string     // 改善アドバイス
  nextChallenge: string   // 次回への挑戦目標
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
  const speedPerMove = context.moveCount > 0 ? (context.durationSeconds / context.moveCount).toFixed(1) : '0'
  
  return `あなたはパズルゲームのプレイ分析AIです。以下のプレイデータを分析してください。

## プレイデータ
- パズルサイズ: スライドパズル
- 実際の手数: ${context.moveCount}手
- 最適手数: ${metrics.optimalMoveCount}手
- 効率スコア: ${efficiencyPercent}%（最適解に対する割合）
- 所要時間: ${formatDuration(context.durationSeconds)}
- 1手あたりの時間: ${speedPerMove}秒
- ヒント使用回数: ${context.hintsUsed ?? 0}回
- 最適解との差: ${metrics.moveDifference}手

## 分析指示
上記データを踏まえて、以下の4項目を日本語で分析してJSON形式で返してください。

{
  "playStyle": "プレイスタイルの特徴を20文字程度で（例：慎重派、スピード重視、効率的など）",
  "praise": "このプレイの良かった点を30文字程度で称賛",
  "improvement": "次回に向けた具体的なアドバイスを40文字程度で",
  "nextChallenge": "次の挑戦目標を20文字程度で提案"
}

JSONのみを返してください。`
}

export function parseAnalysisResponse(text: string): DetailedAnalysis | null {
  try {
    // JSON部分を抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    
    const parsed = JSON.parse(jsonMatch[0])
    if (parsed.playStyle && parsed.praise && parsed.improvement && parsed.nextChallenge) {
      return parsed as DetailedAnalysis
    }
    return null
  } catch {
    return null
  }
}

export function buildDetailedFallback(metrics: PlayMetrics, context: { moveCount: number; durationSeconds: number; hintsUsed?: number }): DetailedAnalysis {
  const efficiencyPercent = Math.round(metrics.efficiency * 100)
  const speedPerMove = context.moveCount > 0 ? context.durationSeconds / context.moveCount : 0
  const hintsUsed = context.hintsUsed ?? 0
  
  // プレイスタイル判定
  let playStyle = '標準プレイヤー'
  if (efficiencyPercent >= 90) {
    playStyle = '効率マスター'
  } else if (speedPerMove < 2) {
    playStyle = 'スピードスター'
  } else if (hintsUsed === 0 && efficiencyPercent >= 70) {
    playStyle = '独力クリアの達人'
  } else if (speedPerMove > 5) {
    playStyle = '慎重派プレイヤー'
  }
  
  // 称賛ポイント
  let praise = 'パズルをクリアできました！'
  if (efficiencyPercent >= 95) {
    praise = '素晴らしい！ほぼ最適解でクリア！'
  } else if (efficiencyPercent >= 80) {
    praise = '効率的なプレイでした！'
  } else if (hintsUsed === 0) {
    praise = 'ヒントなしでクリア、お見事！'
  } else if (context.durationSeconds < 60) {
    praise = 'スピーディーなクリア！'
  }
  
  // 改善アドバイス
  let improvement = '練習を続けて最適解に近づこう！'
  if (efficiencyPercent < 50) {
    improvement = 'コーナーから順に揃えると効率UP'
  } else if (speedPerMove > 5) {
    improvement = '迷ったらヒントを活用してみよう'
  } else if (metrics.moveDifference > 10) {
    improvement = '最適解ビューアで手順を研究しよう'
  }
  
  // 次の挑戦
  let nextChallenge = '同じサイズで効率を上げよう'
  if (efficiencyPercent >= 90) {
    nextChallenge = '大きいサイズに挑戦！'
  } else if (hintsUsed > 0) {
    nextChallenge = 'ヒントなしでクリアを目指そう'
  }
  
  return { playStyle, praise, improvement, nextChallenge }
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
