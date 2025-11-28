'use client'

import { useGameStore } from '@/lib/store/gameStore'
import type { GameMode } from '@/lib/puzzle/types'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function ModeChips() {
    const { mode, setMode } = useGameStore()

    const modes: { id: GameMode; label: string }[] = [
        { id: 'freePlay', label: 'フリープレイ' },
        { id: 'timeAttack', label: 'タイムアタック' },
        { id: 'moveChallenge', label: '手数チャレンジ' },
    ]

    return (
        <div className="flex flex-wrap justify-center gap-2">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={clsx(
                        'relative rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
                        mode === m.id
                            ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                            : 'bg-white/40 text-slate-600 hover:bg-white/60'
                    )}
                >
                    {mode === m.id && (
                        <motion.div
                            layoutId="activeMode"
                            className="absolute inset-0 rounded-full bg-cyan-500"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{ zIndex: -1 }}
                        />
                    )}
                    <span className="relative z-10">{m.label}</span>
                </button>
            ))}
        </div>
    )
}
