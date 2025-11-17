/**
 * Phase 4: Database Schema (TDD - Green)
 *
 * Dexie.js database schema definition
 */

import Dexie, { Table } from 'dexie'
import { PuzzleState, GameMode } from '@/lib/puzzle/types'

/**
 * Game history record
 */
export interface GameRecord {
  id?: string
  size: number
  mode: GameMode
  moves: number
  timeElapsed: number
  completed: boolean
  timestamp: number
}

/**
 * User settings
 */
export interface UserSettings {
  id?: number
  soundEnabled: boolean
  musicEnabled: boolean
  difficulty: 'easy' | 'medium' | 'hard' | 'custom'
  theme: 'light' | 'dark' | 'auto'
}

/**
 * Saved game state
 */
export interface SavedGame {
  id?: number
  state: PuzzleState
  savedAt: number
}

/**
 * Puzzle Game Database
 */
export class PuzzleGameDB extends Dexie {
  savedGames!: Table<SavedGame>
  gameHistory!: Table<GameRecord>
  settings!: Table<UserSettings>

  constructor() {
    super('PuzzleGameDB')

    this.version(1).stores({
      savedGames: '++id, savedAt',
      gameHistory: '++id, timestamp, size, mode, completed',
      settings: '++id',
    })
  }
}

// Create database instance
export const db = new PuzzleGameDB()
