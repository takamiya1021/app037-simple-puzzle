'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PuzzleBoard from './PuzzleBoard'
import OptimalSolutionViewer from './OptimalSolutionViewer'
import GameStats from './GameStats'
import GameModeSelector from './GameModeSelector'
import HintButton from './HintButton'
import AnalysisReport from './AnalysisReport'
import SettingsModal from './SettingsModal'
import ImageSelector from './ImageSelector'
import GameToast from './GameToast'
import { applyMove, createSolvedState, generatePuzzle } from '@/lib/puzzle/generator'
import { sliceImageIntoTiles } from '@/lib/image/processor'
import type { GameMode, PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import type { ImageSourceType } from '@/lib/image/types'
import { useGameStore } from '@/lib/store/gameStore'
import { useGameCompletion } from '@/hooks/useGameCompletion'
import HistoryView from './HistoryView'
import { computePlayMetrics } from '@/lib/ai/analyzePlay'
import { isComplete } from '@/lib/puzzle/validator'

const TIME_ATTACK_LIMITS: Record<PuzzleSize, number> = {
  4: 180,
  5: 300,
  6: 600,
}

const PuzzlePreview = () => {
  const {
    size,
    mode,
    puzzleState,
    initialState,
    moveCount,
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
    setHintsUsed,
    setIsRunning,
    incrementSession,
    setElapsedSeconds,
    setSelectedImage,
    setTileImages,
    showNotification,
    clearNotification,
  } = useGameStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const maxHints = 3
  const { recordCompletion } = useGameCompletion()
  const completionSessionRef = useRef<number | null>(null)

  const handleShuffle = () => {
    const { state: shuffled } = generatePuzzle({ size, shuffleMoves: 80 })
    setPuzzleState(shuffled)
    setInitialState(shuffled)
    setMoveCount(0)
    setIsRunning(true)
    incrementSession()
    setHintsUsed(0)
    setElapsedSeconds(0)
  }

  const resetSession = (nextState: PuzzleState, shouldRun: boolean) => {
    setPuzzleState(nextState)
    setInitialState(nextState)
    setMoveCount(0)
    setIsRunning(shouldRun)
    incrementSession()
    setHintsUsed(0)
    setElapsedSeconds(0)
  }

  const handleMove = (tileIndex: number) => {
    const next = applyMove(puzzleState, tileIndex)
    setPuzzleState(next)
    setMoveCount(moveCount + 1)
    setIsRunning(true)
  }

  const timeLimitSeconds = useMemo(() => {
    if (mode !== 'timeAttack') return undefined
    return TIME_ATTACK_LIMITS[size]
  }, [mode, size])

  const handleSizeChange = (value: PuzzleSize) => {
    setSize(value)
    resetSession(createSolvedState(value), false)
  }

  const handleModeChange = (value: GameMode) => {
    setMode(value)
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
    showNotification('✨ クリア！おめでとう！')
  }, [puzzleState, sessionId, recordCompletion, mode, size, moveCount, elapsedSeconds, selectedImage, hintsUsed, initialState, timeLimitSeconds, showNotification])

  return (
    <section className="flex flex-col gap-6">
      <div data-testid="image-state" data-selected={selectedImage ? 'set' : 'none'} data-source={imageSource ?? ''} className="hidden" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[4, 5, 6].map((value) => (
            <button
              key={value as PuzzleSize}
              type="button"
              onClick={() => handleSizeChange(value as PuzzleSize)}
              className={
                value === size
                  ? 'rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white'
                  : 'rounded-full border border-indigo-200 px-4 py-1 text-sm text-indigo-600'
              }
            >
              {value} × {value}
            </button>
          ))}
        </div>
        <GameModeSelector value={mode} onChange={handleModeChange} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full border border-slate-200 px-4 py-1 text-sm text-slate-600"
          >
            設定
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            className="rounded-full bg-emerald-500 px-4 py-1 text-sm font-semibold text-white shadow"
          >
            しゃっふる
          </button>
        </div>
      </div>
      <GameStats
        size={size}
        mode={mode}
        moveCount={moveCount}
        isRunning={isRunning}
        sessionId={sessionId}
        timeLimitSeconds={timeLimitSeconds}
        onTimeExpired={() => setIsRunning(false)}
        onTimeUpdate={setElapsedSeconds}
      />
      <ImageSelector selectedImage={selectedImage} onSelect={handleImageSelect} />
      <HintButton
        size={size}
        state={puzzleState}
        hintsUsed={hintsUsed}
        maxHints={maxHints}
        onHintReceived={() => setHintsUsed(Math.min(maxHints, hintsUsed + 1))}
      />
      <PuzzleBoard size={size} state={puzzleState} onMove={handleMove} tileImages={tileImages} />
      <OptimalSolutionViewer size={size} state={puzzleState} />
      <AnalysisReport
        initialState={initialState}
        size={size}
        moveCount={moveCount}
        durationSeconds={elapsedSeconds}
        hintsUsed={hintsUsed}
      />
      <HistoryView />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {notification && <GameToast message={notification} onClose={clearNotification} />}
    </section>
  )
}

export default PuzzlePreview
