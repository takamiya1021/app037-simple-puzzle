import { create } from 'zustand'
import { createSolvedState } from '@/lib/puzzle/generator'
import type { GameMode, PuzzleSize, PuzzleState } from '@/lib/puzzle/types'
import type { ImageSourceType } from '@/lib/image/types'

const DEFAULT_SIZE: PuzzleSize = 4

interface GameStoreState {
  size: PuzzleSize
  mode: GameMode
  puzzleState: PuzzleState
  initialState: PuzzleState
  moveCount: number
  targetMoves: number | null // null = 制限なし
  hintsUsed: number
  isRunning: boolean
  sessionId: number
  elapsedSeconds: number
  selectedImage: string | null
  imageSource: ImageSourceType | null
  tileImages: Record<number, string | null>
  notification: string | null
}

interface GameStoreActions {
  setSize: (size: PuzzleSize) => void
  setMode: (mode: GameMode) => void
  setPuzzleState: (state: PuzzleState) => void
  setInitialState: (state: PuzzleState) => void
  setMoveCount: (count: number) => void
  setTargetMoves: (count: number | null) => void
  setHintsUsed: (count: number) => void
  setIsRunning: (isRunning: boolean) => void
  incrementSession: () => void
  setElapsedSeconds: (seconds: number) => void
  setSelectedImage: (image: string | null, source?: ImageSourceType | null) => void
  setTileImages: (map: Record<number, string | null>) => void
  showNotification: (message: string) => void
  clearNotification: () => void
}

export type GameStore = GameStoreState & GameStoreActions

const createDefaultState = (): GameStoreState => ({
  size: DEFAULT_SIZE,
  mode: 'freePlay',
  puzzleState: createSolvedState(DEFAULT_SIZE),
  initialState: createSolvedState(DEFAULT_SIZE),
  moveCount: 0,
  targetMoves: null,
  hintsUsed: 0,
  isRunning: false,
  sessionId: 1,
  elapsedSeconds: 0,
  selectedImage: null,
  imageSource: null,
  tileImages: {},
  notification: null,
})

export const useGameStore = create<GameStore>((set) => ({
  ...createDefaultState(),
  setSize: (size) => set({ size }),
  setMode: (mode) => set({ mode }),
  setPuzzleState: (puzzleState) => set({ puzzleState }),
  setInitialState: (initialState) => set({ initialState }),
  setMoveCount: (moveCount) => set({ moveCount }),
  setTargetMoves: (targetMoves) => set({ targetMoves }),
  setHintsUsed: (hintsUsed) => set({ hintsUsed }),
  setIsRunning: (isRunning) => set({ isRunning }),
  incrementSession: () => set((state) => ({ sessionId: state.sessionId + 1 })),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setSelectedImage: (selectedImage, source) =>
    set((state) => ({ selectedImage, imageSource: source ?? state.imageSource })),
  setTileImages: (tileImages) => set({ tileImages }),
  showNotification: (message) => set({ notification: message }),
  clearNotification: () => set({ notification: null }),
}))

export const resetGameStore = () => {
  useGameStore.setState((state) => ({
    ...state,
    ...createDefaultState(),
  }))
}
