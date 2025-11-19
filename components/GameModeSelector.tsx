'use client'

import clsx from 'clsx'
import type { GameMode } from '@/lib/puzzle/types'

interface GameModeSelectorProps {
  value: GameMode
  onChange: (mode: GameMode) => void
  disabled?: boolean
}

const MODES: Array<{ id: GameMode; label: string; description: string }> = [
  {
    id: 'freePlay',
    label: 'フリープレイ',
    description: '時間・手数制限なしで気軽に遊ぶモード',
  },
  {
    id: 'timeAttack',
    label: 'タイムアタック',
    description: '制限時間内にクリアしてスリルを楽しもう',
  },
  {
    id: 'moveChallenge',
    label: '手数チャレンジ',
    description: '最小手数を目指して効率プレイに挑戦',
  },
]

const GameModeSelector = ({ value, onChange, disabled = false }: GameModeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {MODES.map((mode) => {
        const isActive = value === mode.id
        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            aria-label={mode.label}
            onClick={() => {
              if (!disabled) {
                onChange(mode.id)
              }
            }}
            className={clsx(
              'w-full rounded-2xl border px-4 py-3 text-left transition hover:shadow md:w-auto',
              isActive
                ? 'border-pink-400 bg-pink-100 text-pink-900'
                : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            <p className="text-sm font-semibold">{mode.label}</p>
            <p className="text-xs text-slate-500">{mode.description}</p>
          </button>
        )
      })}
    </div>
  )
}

export default GameModeSelector
