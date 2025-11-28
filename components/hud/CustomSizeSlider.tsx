'use client'

import { useGameStore } from '@/lib/store/gameStore'
import type { PuzzleSize } from '@/lib/puzzle/types'

export default function CustomSizeSlider() {
    const { size, setSize } = useGameStore()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value, 10) as PuzzleSize
        setSize(newSize)
    }

    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/50 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Grid Size</span>
                <span className="font-mono text-lg font-bold text-slate-800">{size}x{size}</span>
            </div>
            <input
                type="range"
                min="4"
                max="10"
                step="1"
                value={size}
                onChange={handleChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500 hover:accent-indigo-400"
            />
            <div className="flex w-full justify-between px-1 text-[10px] font-bold text-slate-400">
                <span>4</span>
                <span>10</span>
            </div>
        </div>
    )
}
