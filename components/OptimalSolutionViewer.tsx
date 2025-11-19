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
    <div className="rounded-2xl bg-slate-50 p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Optimal</p>
          <h3 className="text-base font-semibold text-slate-700">最適解ビューア</h3>
          <p className="text-xs text-slate-500">A*で求めたステップをチェック</p>
        </div>
        <button
          type="button"
          onClick={handleCompute}
          disabled={status === 'loading'}
          className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white disabled:opacity-60"
        >
          最適解を計算
        </button>
      </div>

      {status === 'loading' && (
        <p role="status" className="mt-3 text-sm text-slate-500">
          計算中...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {frames.length > 0 && solution && (
        <ol className="mt-4 space-y-2 text-sm text-slate-600">
          {frames.map((frame, index) => {
            const previousState = solution.states[index - 1]
            const movedTile = frame.moveIndex !== null && previousState ? previousState[frame.moveIndex] : null
            return (
              <li key={frame.step} data-testid="solution-step" className="rounded-xl bg-white/70 p-3 shadow-sm">
                <p className="font-semibold text-slate-700">Step {frame.step}</p>
                {movedTile ? (
                  <p className="text-xs text-slate-500">タイル {movedTile} を空きマスに移動</p>
                ) : (
                  <p className="text-xs text-slate-400">開始位置</p>
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
