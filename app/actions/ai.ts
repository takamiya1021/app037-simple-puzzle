'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getNextOptimalMove, buildHintPrompt } from '@/lib/ai/hintGenerator'
import { buildAnalysisFallback, buildAnalysisPrompt, buildDetailedFallback, parseAnalysisResponse, computePlayMetrics, type PlayMetrics, type DetailedAnalysis } from '@/lib/ai/analyzePlay'
import type { PuzzleMoveSuggestion, PuzzleSize, PuzzleState } from '@/lib/puzzle/types'

export interface HintResponse {
  success: boolean
  hint?: string
  move?: PuzzleMoveSuggestion | null
  isDefaultMessage?: boolean
  error?: string
}

export interface AnalysisResponse {
  success: boolean
  summary?: string
  metrics?: PlayMetrics | null
  detailedAnalysis?: DetailedAnalysis | null
  isDefaultMessage?: boolean
  error?: string
}

type GenerativeModel = {
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } | null }> | Promise<{ response: { text: () => string } }>
}

type ModelFactory = (apiKey: string) => GenerativeModel

interface GenerateHintArgs {
  state: PuzzleState
  size?: PuzzleSize
  clientApiKey?: string
  modelFactory?: ModelFactory
}

export async function generateHint({ state, size, clientApiKey, modelFactory }: GenerateHintArgs): Promise<HintResponse> {
  const move = getNextOptimalMove(state, size)
  if (!move) {
    return {
      success: false,
      error: 'パズルは既に完成しているか、解が見つかりません。',
      move: null,
    }
  }

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      success: true,
      move,
      hint: buildFallbackMessage(move),
      isDefaultMessage: true,
    }
  }

  const factory = modelFactory ?? defaultModelFactory

  try {
    const model = factory(apiKey)
    const prompt = buildHintPrompt(move)
    const response = await model.generateContent(prompt)
    const text = response.response?.text()?.trim()

    return {
      success: true,
      move,
      hint: text && text.length > 0 ? text : buildFallbackMessage(move),
      isDefaultMessage: !text,
    }
  } catch (error) {
    console.error('Gemini hint error:', error)
    return {
      success: true,
      move,
      hint: buildFallbackMessage(move),
      isDefaultMessage: true,
    }
  }
}

function buildFallbackMessage(move: PuzzleMoveSuggestion) {
  const direction = translateDirection(move.direction)
  return `タイル${move.tileId}を${direction}に動かしましょう`
}

function defaultModelFactory(apiKey: string): GenerativeModel {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
}

function translateDirection(direction: PuzzleMoveSuggestion['direction']) {
  switch (direction) {
    case 'up':
      return '上'
    case 'down':
      return '下'
    case 'left':
      return '左'
    case 'right':
      return '右'
    default:
      return direction
  }
}

interface GenerateAnalysisArgs {
  initialState: PuzzleState
  size?: PuzzleSize
  moveCount: number
  durationSeconds: number
  clientApiKey?: string
  modelFactory?: ModelFactory
  hintsUsed?: number
}

export async function generateAnalysis({
  initialState,
  size,
  moveCount,
  durationSeconds,
  clientApiKey,
  modelFactory,
  hintsUsed = 0,
}: GenerateAnalysisArgs): Promise<AnalysisResponse> {
  const metrics = computePlayMetrics({ initialState, size, actualMoveCount: moveCount })
  if (!metrics) {
    return { success: false, error: '分析に必要なデータが不足しています。', metrics: null }
  }

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY
  const fallbackSummary = buildAnalysisFallback(metrics, { moveCount, durationSeconds })
  const fallbackDetailed = buildDetailedFallback(metrics, { moveCount, durationSeconds, hintsUsed })

  if (!apiKey) {
    return { 
      success: true, 
      summary: fallbackSummary, 
      metrics, 
      detailedAnalysis: fallbackDetailed,
      isDefaultMessage: true 
    }
  }

  const factory = modelFactory ?? defaultModelFactory

  try {
    const model = factory(apiKey)
    const prompt = buildAnalysisPrompt(metrics, { moveCount, durationSeconds, hintsUsed })
    const response = await model.generateContent(prompt)
    const text = response.response?.text()?.trim()

    // JSONパースを試みる
    const detailedAnalysis = text ? parseAnalysisResponse(text) : null

    // AIからの応答があれば、それを使用（パースできなくてもtextがあればAI生成として扱う）
    const isAiGenerated = !!text && text.length > 0

    return {
      success: true,
      summary: detailedAnalysis ? `${detailedAnalysis.playStyle}: ${detailedAnalysis.praise}` : (text || fallbackSummary),
      metrics,
      detailedAnalysis: detailedAnalysis || fallbackDetailed,
      isDefaultMessage: !isAiGenerated,
    }
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return {
      success: true,
      summary: fallbackSummary,
      metrics,
      detailedAnalysis: fallbackDetailed,
      isDefaultMessage: true,
    }
  }
}
