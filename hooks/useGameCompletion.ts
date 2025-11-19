import { useState } from 'react'
import { saveGameRecord } from '@/lib/db/operations'
import type { GameMode, PuzzleSize } from '@/lib/puzzle/types'

export interface GameCompletionPayload {
  mode: GameMode
  size: PuzzleSize
  moveCount: number
  durationSeconds: number
  efficiencyScore: number
  imageThumbnail: string | null
  hintsUsed: number
  timeLimitSeconds?: number
}

export function useGameCompletion() {
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)

  const recordCompletion = async (payload: GameCompletionPayload) => {
    if (typeof indexedDB === 'undefined') {
      return null
    }
    const id = await saveGameRecord({
      completedAt: Date.now(),
      mode: payload.mode,
      size: payload.size,
      durationSeconds: payload.durationSeconds,
      moveCount: payload.moveCount,
      efficiencyScore: payload.efficiencyScore,
      imageThumbnail: payload.imageThumbnail,
      timeLimitSeconds: payload.timeLimitSeconds ?? null,
    })
    setLastSavedId(id)
    return id
  }

  return { recordCompletion, lastSavedId }
}
