'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PuzzleBoard from './PuzzleBoard'
import SettingsModal from './SettingsModal'
import ImageSelector from './ImageSelector'
import GameToast from './GameToast'
import HintButton from './HintButton'
import AnalysisReport from './AnalysisReport'
import OptimalSolutionViewer from './OptimalSolutionViewer'
import { applyMove, createSolvedState, generatePuzzle } from '@/lib/puzzle/generator'
import { sliceImageIntoTiles } from '@/lib/image/processor'
import { solvePuzzle } from '@/lib/puzzle/solver'
import type { GameMode, PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import type { ImageSourceType } from '@/lib/image/types'
import { useGameStore } from '@/lib/store/gameStore'
import { useGameCompletion } from '@/hooks/useGameCompletion'
import { computePlayMetrics } from '@/lib/ai/analyzePlay'
import { isComplete } from '@/lib/puzzle/validator'
import clsx from 'clsx'

import { useSettingsStore } from '@/lib/store/settingsStore'

const MODE_LABELS: Record<GameMode, string> = {
  freePlay: 'フリー',
  timeAttack: 'タイム',
  moveChallenge: '手数',
}

const PuzzlePreview = () => {
  const {
    size,
    mode,
    puzzleState,
    initialState,
    moveCount,
    targetMoves,
    hintsUsed,
    isRunning,
    sessionId,
    elapsedSeconds,
    selectedImage,
    imageSource,
    tileImages,
    notification,
    setSize,
    setMode,
    setPuzzleState,
    setInitialState,
    setMoveCount,
    setTargetMoves,
    setHintsUsed,
    setIsRunning,
    incrementSession,
    setElapsedSeconds,
    setSelectedImage,
    setTileImages,
    showNotification,
    clearNotification,
  } = useGameStore()

  const { timeLimits } = useSettingsStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  const isCompleted = isComplete(puzzleState)
  
  const { recordCompletion } = useGameCompletion()
  const completionSessionRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(elapsedSeconds + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, elapsedSeconds, setElapsedSeconds])

  const calculateTargetMoves = useCallback(async (state: PuzzleState, puzzleSize: PuzzleSize) => {
    // 6x6以上は計算コストが高すぎるため固定値または簡易計算にする
    // ここでは一旦4x4と5x5のみ計算し、それ以外はnull（制限なし）にするか固定値にする
    if (puzzleSize > 5) {
      setTargetMoves(100) // 仮の固定値
      return
    }

    setIsCalculating(true)
    
    // メインスレッドをブロックしないように setTimeout で逃がす
    setTimeout(() => {
      try {
        const result = solvePuzzle(state, puzzleSize, { maxNodes: 100000 })
        if (result.solved) {
          // 最適解の1.5倍を目標にする（最低10手は確保）
          const optimal = result.moves.length
          const target = Math.max(10, Math.ceil(optimal * 1.5))
          setTargetMoves(target)
        } else {
          setTargetMoves(null)
        }
      } catch (e) {
        console.error('Solver failed', e)
        setTargetMoves(null)
      } finally {
        setIsCalculating(false)
      }
    }, 100)
  }, [setTargetMoves])

  const handleShuffle = () => {
    const { state: shuffled } = generatePuzzle({ size, shuffleMoves: 80 })
    setPuzzleState(shuffled)
    setInitialState(shuffled)
    setMoveCount(0)
    setIsRunning(true)
    incrementSession()
    setHintsUsed(0)
    setElapsedSeconds(0)
    
    if (mode === 'moveChallenge') {
      calculateTargetMoves(shuffled, size)
    } else {
      setTargetMoves(null)
    }
  }

  const resetSession = (nextState: PuzzleState, shouldRun: boolean) => {
    setPuzzleState(nextState)
    setInitialState(nextState)
    setMoveCount(0)
    setIsRunning(shouldRun)
    incrementSession()
    setHintsUsed(0)
    setElapsedSeconds(0)
    setTargetMoves(null)
  }

  const handleMove = (tileIndex: number) => {
    const next = applyMove(puzzleState, tileIndex)
    setPuzzleState(next)
    setMoveCount(moveCount + 1)
    if (!isRunning) setIsRunning(true)
  }

  const timeLimitSeconds = useMemo(() => {
    if (mode !== 'timeAttack') return undefined
    return timeLimits[size]
  }, [mode, size, timeLimits])

  const handleSizeChange = (value: PuzzleSize) => {
    setSize(value)
    resetSession(createSolvedState(value), false)
  }

  const handleModeChange = (value: GameMode) => {
    setMode(value)
    // モード変更時はリセットするが、シャッフルはしない（ユーザーにシャッフルさせる）
    resetSession(createSolvedState(size), false)
  }

  const createTileImages = useCallback(
    async (image: string, puzzleSize: PuzzleSize) => {
      try {
        const fragments = await sliceImageIntoTiles(image, { gridSize: puzzleSize })
        const map: Record<number, string | null> = {}
        fragments.forEach((fragment) => {
          if (!fragment.isEmpty && fragment.dataUrl) {
            map[fragment.id + 1] = fragment.dataUrl
          }
        })
        setTileImages(map)
      } catch (error) {
        console.error('Failed to slice image', error)
      }
    },
    [setTileImages]
  )

  const handleImageSelect = (image: string, source: ImageSourceType) => {
    setSelectedImage(image, source)
    createTileImages(image, size)
    setImageModalOpen(false)
  }

  useEffect(() => {
    if (selectedImage) {
      createTileImages(selectedImage, size)
    }
  }, [selectedImage, size, createTileImages])

  useEffect(() => {
    if (!isComplete(puzzleState)) {
      completionSessionRef.current = null
      return
    }

    if (completionSessionRef.current === sessionId) {
      return
    }

    completionSessionRef.current = sessionId

    const metrics = computePlayMetrics({ initialState, size, actualMoveCount: moveCount })
    const efficiencyScore = metrics?.efficiency ?? 1

    recordCompletion({
      mode,
      size,
      moveCount,
      durationSeconds: elapsedSeconds,
      efficiencyScore,
      imageThumbnail: selectedImage,
      hintsUsed,
      timeLimitSeconds: timeLimitSeconds,
    }).catch((error) => {
      console.error('Failed to save history', error)
    })
    showNotification('🎉 クリア！')
    setIsRunning(false)
  }, [puzzleState, sessionId, recordCompletion, mode, size, moveCount, elapsedSeconds, selectedImage, hintsUsed, initialState, timeLimitSeconds, showNotification, setIsRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section className="flex flex-col gap-4">
      <div data-testid="image-state" data-selected={selectedImage ? 'set' : 'none'} data-source={imageSource ?? ''} className="hidden" />

      {/* Stats bar */}
      <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-white/50">Time</div>
            <div className={clsx(
              "font-mono text-xl font-bold",
              timeLimitSeconds && elapsedSeconds > timeLimitSeconds * 0.8 ? "text-rose-400" : "text-[var(--accent)]"
            )}>
              {formatTime(elapsedSeconds)}
              {timeLimitSeconds && <span className="text-xs text-white/50"> / {formatTime(timeLimitSeconds)}</span>}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-white/50">Moves</div>
            <div className={clsx(
              "font-mono text-xl font-bold",
              targetMoves && moveCount > targetMoves ? "text-rose-400" : "text-white"
            )}>
              {moveCount}
              {targetMoves && (
                <span className="text-xs text-white/50">
                  {' / '}
                  {isCalculating ? '...' : targetMoves}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-white/50">{MODE_LABELS[mode]}</div>
          <div className="text-lg font-bold text-white">{size}×{size}</div>
        </div>
      </div>

      {/* Puzzle board */}
      <div className="glass overflow-hidden rounded-2xl p-4">
        <PuzzleBoard size={size} state={puzzleState} onMove={handleMove} tileImages={tileImages} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Size chips */}
        {([4, 5, 6] as PuzzleSize[]).map((s) => (
          <button
            key={s}
            onClick={() => handleSizeChange(s)}
            className={clsx('chip', size === s ? 'chip-active' : 'chip-inactive')}
          >
            {s}×{s}
          </button>
        ))}

        <div className="mx-2 h-6 w-px bg-white/10" />

        {/* Mode chips */}
        {(['freePlay', 'timeAttack', 'moveChallenge'] as GameMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={clsx('chip', mode === m ? 'chip-active' : 'chip-inactive')}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setImageModalOpen(true)}
          className="chip chip-inactive flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          画像
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="chip chip-inactive flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          設定
        </button>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={clsx('chip flex items-center gap-2', showAIPanel ? 'chip-active' : 'chip-inactive')}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI
        </button>
        <button
          onClick={handleShuffle}
          className="btn-glow rounded-full px-6 py-2 font-bold text-white"
        >
          {isCalculating ? '計算中...' : 'シャッフル'}
        </button>
      </div>

      {/* AI Panel - Hint & Optimal Solution */}
      {showAIPanel && !isCompleted && (
        <div className="glass rounded-2xl p-4 space-y-4">
          <HintButton
            state={puzzleState}
            size={size}
            hintsUsed={hintsUsed}
            onHintReceived={() => setHintsUsed(hintsUsed + 1)}
          />
          <OptimalSolutionViewer size={size} state={puzzleState} />
        </div>
      )}

      {/* Analysis Report - shown after completion */}
      {isCompleted && moveCount > 0 && (
        <div className="glass rounded-2xl p-4">
          <AnalysisReport
            initialState={initialState}
            size={size}
            moveCount={moveCount}
            durationSeconds={elapsedSeconds}
            hintsUsed={hintsUsed}
          />
        </div>
      )}

      {/* Image selector modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setImageModalOpen(false)}>
          <div className="glass max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">画像を選択</h3>
              <button onClick={() => setImageModalOpen(false)} className="text-white/50 hover:text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ImageSelector selectedImage={selectedImage} onSelect={handleImageSelect} />
          </div>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {notification && <GameToast message={notification} onClose={clearNotification} />}
    </section>
  )
}

export default PuzzlePreview
