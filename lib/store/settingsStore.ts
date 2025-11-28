import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PuzzleSize } from '@/lib/puzzle/types'

export type AnimationSpeed = 'slow' | 'normal' | 'fast'
export type ImageMode = 'image' | 'number' | 'outline'
export type ApiKeyStatus = 'unknown' | 'valid' | 'invalid'
export type HintLimit = 1 | 2 | 3 | 4 | 5

interface SettingsState {
  soundEnabled: boolean
  animationSpeed: AnimationSpeed
  imageMode: ImageMode
  aiAssistEnabled: boolean
  autoAnalysisEnabled: boolean
  hintLimit: HintLimit
  offlineBadgeDismissed: boolean
  lastValidatedAt?: number
  geminiKeyStatus: ApiKeyStatus
  geminiImageKeyStatus: ApiKeyStatus
  // タイムアタック制限時間（秒）
  timeLimits: Record<PuzzleSize, number>
}

interface SettingsActions {
  setSoundEnabled: (value: boolean) => void
  setAnimationSpeed: (value: AnimationSpeed) => void
  setImageMode: (value: ImageMode) => void
  setAiAssistEnabled: (value: boolean) => void
  setAutoAnalysisEnabled: (value: boolean) => void
  setHintLimit: (value: HintLimit) => void
  dismissOfflineBadge: () => void
  setLastValidatedAt: (timestamp: number | undefined) => void
  setGeminiKeyStatus: (status: ApiKeyStatus) => void
  setGeminiImageKeyStatus: (status: ApiKeyStatus) => void
  setTimeLimit: (size: PuzzleSize, seconds: number) => void
  resetSettings: () => void
}

export type SettingsStore = SettingsState & SettingsActions

const STORAGE_KEY = 'custom-image-puzzle-settings'

const defaultState: SettingsState = {
  soundEnabled: true,
  animationSpeed: 'normal',
  imageMode: 'image',
  aiAssistEnabled: true,
  autoAnalysisEnabled: true,
  hintLimit: 3,
  offlineBadgeDismissed: false,
  lastValidatedAt: undefined,
  geminiKeyStatus: 'unknown',
  geminiImageKeyStatus: 'unknown',
  timeLimits: {
    4: 180, // 3分
    5: 300, // 5分
    6: 600, // 10分
  },
}

const createStorage = () => {
  if (typeof window === 'undefined') {
    const noopStorage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    }
    return noopStorage
  }
  return window.localStorage
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setSoundEnabled: (value) => set({ soundEnabled: value }),
      setAnimationSpeed: (value) => set({ animationSpeed: value }),
      setImageMode: (value) => set({ imageMode: value }),
      setAiAssistEnabled: (value) => set({ aiAssistEnabled: value }),
      setAutoAnalysisEnabled: (value) => set({ autoAnalysisEnabled: value }),
      setHintLimit: (value) => set({ hintLimit: value }),
      dismissOfflineBadge: () => set({ offlineBadgeDismissed: true }),
      setLastValidatedAt: (timestamp) => set({ lastValidatedAt: timestamp }),
      setGeminiKeyStatus: (status) => set({ geminiKeyStatus: status }),
      setGeminiImageKeyStatus: (status) => set({ geminiImageKeyStatus: status }),
      setTimeLimit: (size, seconds) => 
        set((state) => ({ timeLimits: { ...state.timeLimits, [size]: seconds } })),
      resetSettings: () => set(defaultState),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createStorage()),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        animationSpeed: state.animationSpeed,
        imageMode: state.imageMode,
        aiAssistEnabled: state.aiAssistEnabled,
        autoAnalysisEnabled: state.autoAnalysisEnabled,
        hintLimit: state.hintLimit,
        offlineBadgeDismissed: state.offlineBadgeDismissed,
        lastValidatedAt: state.lastValidatedAt,
        geminiKeyStatus: state.geminiKeyStatus,
        geminiImageKeyStatus: state.geminiImageKeyStatus,
        timeLimits: state.timeLimits,
      }),
      merge: (persisted, current) => ({
        ...defaultState,
        ...current,
        ...(persisted as Partial<SettingsState>),
        // 以前のバージョンに timeLimits がなかった場合のフォールバック
        timeLimits: (persisted as Partial<SettingsState>).timeLimits || defaultState.timeLimits,
      }),
    }
  )
)

export const getDefaultSettingsState = (): SettingsState => ({ ...defaultState })
