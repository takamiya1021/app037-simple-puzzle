'use client'

import { useGameStore } from '@/lib/store/gameStore'
import { useEffect, useState } from 'react'

export default function StatusHUD() {
    const { elapsedSeconds, moveCount, size } = useGameStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (!mounted) return null

    return (
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 rounded-2xl bg-white/30 p-4 shadow-lg backdrop-blur-md border border-white/50">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-slate-600">Time</span>
                    <span className="font-mono text-xl font-bold text-slate-800">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="h-8 w-px bg-slate-400/30" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-slate-600">Moves</span>
                    <span className="font-mono text-xl font-bold text-slate-800">{moveCount}</span>
                </div>
                <div className="h-8 w-px bg-slate-400/30" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-slate-600">Size</span>
                    <span className="font-mono text-xl font-bold text-slate-800">{size}x{size}</span>
                </div>
            </div>
        </div>
    )
}
