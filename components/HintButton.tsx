'use client'

import { useEffect, useState, useTransition } from 'react'
import { generateHint, type HintResponse } from '@/app/actions/ai'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import { loadApiKey } from '@/lib/utils/apiKeyStorage'

interface HintButtonProps {
  state: PuzzleState
  size: PuzzleSize
  hintsUsed: number
  maxHints: number
  onHintReceived?: (response: HintResponse) => void
}

const HintButton = ({ state, size, hintsUsed, maxHints, onHintReceived }: HintButtonProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setApiKey(loadApiKey('gemini'))
  }, [])

  const disabled = hintsUsed >= maxHints || isPending
  const remaining = Math.max(0, maxHints - hintsUsed)

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

  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Hint</p>
          <p className="text-lg font-semibold text-slate-800">あと {remaining} 回</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '計算中…' : 'ヒント'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      {message && !error && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  )
}

export default HintButton
