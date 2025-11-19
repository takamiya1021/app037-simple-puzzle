import Dexie, { type Table } from 'dexie'
import type { GameMode, PuzzleSize } from '@/lib/puzzle/types'

export interface GameHistoryRecord {
  id: string
  completedAt: number
  mode: GameMode
  size: PuzzleSize
  durationSeconds: number
  moveCount: number
  efficiencyScore: number
  imageThumbnail?: string | null
  timeLimitSeconds?: number | null
}

export interface SettingRecord {
  key: string
  value: string
  updatedAt: number
}

class PuzzleDatabase extends Dexie {
  games!: Table<GameHistoryRecord, string>
  settings!: Table<SettingRecord, string>

  constructor() {
    super('CustomImagePuzzleDB')
    this.version(1).stores({
      games: '&id, completedAt, mode, size',
      settings: '&key',
    })
  }
}

export const db = new PuzzleDatabase()
