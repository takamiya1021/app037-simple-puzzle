'use client'

import { useEffect, useState, useTransition } from 'react'
import { generateHint, type HintResponse } from '@/app/actions/ai'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import { loadApiKey } from '@/lib/utils/apiKeyStorage'
import { useSettingsStore } from '@/lib/store/settingsStore'

interface HintButtonProps {
  state: PuzzleState
  size: PuzzleSize
  hintsUsed: number
  maxHints?: number
  onHintReceived?: (response: HintResponse) => void
}

const HintButton = ({ state, size, hintsUsed, maxHints, onHintReceived }: HintButtonProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { aiAssistEnabled, hintLimit } = useSettingsStore()

  useEffect(() => {
    setApiKey(loadApiKey('gemini'))
  }, [])

  const effectiveLimit = Math.min(hintLimit, maxHints ?? hintLimit)
  const disabled = !aiAssistEnabled || hintsUsed >= effectiveLimit || isPending
  const remaining = Math.max(0, effectiveLimit - hintsUsed)

  const handleClick = () => {
    if (disabled) return
    startTransition(async () => {
      setError(null)
      const result = await generateHint({ state, size, clientApiKey: apiKey ?? undefined })
      if (!result.success || !result.hint) {
        setError(result.error ?? 'ヒントを取得できませんでした')
        return
      }
      setMessage(result.hint)
      onHintReceived?.(result)
    })
  }

  if (!aiAssistEnabled) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-white/50">
        <p className="text-sm font-semibold">AIヒントは無効になっています</p>
        <p className="text-xs">設定から「ヒントを有効にする」をオンにしてください</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Hint</p>
          <p className="text-lg font-semibold text-white">あと {remaining} 回</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow disabled:opacity-60 disabled:shadow-none"
        >
          {isPending ? '計算中…' : 'ヒント'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      {message && !error && <p className="mt-3 text-sm text-white/80 bg-white/5 rounded-xl p-3">{message}</p>}
    </div>
  )
}

export default HintButton
