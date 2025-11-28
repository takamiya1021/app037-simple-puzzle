'use client'

import { useMemo, useState } from 'react'
import { buildSolutionFrames, solvePuzzle, type SolveResult } from '@/lib/puzzle/solver'
import type { PuzzleSize, PuzzleState } from '@/lib/puzzle/types'

interface OptimalSolutionViewerProps {
  size: PuzzleSize
  state: PuzzleState
}

const OptimalSolutionViewer = ({ size, state }: OptimalSolutionViewerProps) => {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [solution, setSolution] = useState<SolveResult | null>(null)

  const frames = useMemo(() => {
    if (!solution?.solved) return []
    return buildSolutionFrames(solution.moves, solution.states)
  }, [solution])

  const handleCompute = async () => {
    setStatus('loading')
    setError(null)
    try {
      const result = await Promise.resolve().then(() => solvePuzzle(state, size, { maxNodes: 20000 }))
      if (result.solved) {
        setSolution(result)
      } else {
        setSolution(null)
        setError('解を特定できませんでした')
      }
    } catch (err) {
      console.error(err)
      setError('解析に失敗しました')
      setSolution(null)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Optimal</p>
          <h3 className="text-base font-semibold text-white">最適解ビューア</h3>
          <p className="text-xs text-white/50">A*で求めたステップをチェック</p>
        </div>
        <button
          type="button"
          onClick={handleCompute}
          disabled={status === 'loading'}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow disabled:opacity-60 disabled:shadow-none"
        >
          最適解を計算
        </button>
      </div>

      {status === 'loading' && (
        <p role="status" className="mt-3 text-sm text-cyan-400 animate-pulse">
          計算中...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      {frames.length > 0 && solution && (
        <ol className="mt-4 space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
          {frames.map((frame, index) => {
            const previousState = solution.states[index - 1]
            const movedTile = frame.moveIndex !== null && previousState ? previousState[frame.moveIndex] : null
            return (
              <li key={frame.step} data-testid="solution-step" className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="font-semibold text-white">Step {frame.step}</p>
                {movedTile ? (
                  <p className="text-xs text-white/60">タイル {movedTile} を空きマスに移動</p>
                ) : (
                  <p className="text-xs text-white/40">開始位置</p>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default OptimalSolutionViewer
