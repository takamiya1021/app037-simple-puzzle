/**
 * Phase 4: Database Operations (TDD - Green)
 *
 * Database operation functions using Dexie.js
 */

import { db, GameRecord, UserSettings, SavedGame } from './schema'
import { PuzzleState, GameMode } from '@/lib/puzzle/types'

/**
 * Default user settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: 'medium',
  theme: 'auto',
}

/**
 * Saves current game state
 */
export async function saveGameState(state: PuzzleState): Promise<void> {
  // Clear existing saved games and save new one
  await db.savedGames.clear()
  await db.savedGames.add({
    state,
    savedAt: Date.now(),
  })
}

/**
 * Loads saved game state
 */
export async function loadGameState(): Promise<PuzzleState | null> {
  const saved = await db.savedGames.orderBy('savedAt').last()
  return saved ? saved.state : null
}

/**
 * Saves a completed game to history
 */
export async function saveGameHistory(record: GameRecord): Promise<void> {
  await db.gameHistory.add({
    ...record,
    id: record.id || `game-${Date.now()}-${Math.random()}`,
  })

  // Keep only the latest 100 records
  const count = await db.gameHistory.count()
  if (count > 100) {
    const toDelete = count - 100
    const oldest = await db.gameHistory.orderBy('timestamp').limit(toDelete).toArray()
    const idsToDelete = oldest.map(r => r.id!).filter(id => id !== undefined)
    await db.gameHistory.bulkDelete(idsToDelete)
  }
}

/**
 * Gets game history with optional filters
 */
export async function getGameHistory(filters?: {
  size?: number
  mode?: GameMode
  completed?: boolean
}): Promise<GameRecord[]> {
  let query = db.gameHistory.orderBy('timestamp').reverse()

  const results = await query.toArray()

  // Apply filters
  let filtered = results

  if (filters?.size !== undefined) {
    filtered = filtered.filter(r => r.size === filters.size)
  }

  if (filters?.mode !== undefined) {
    filtered = filtered.filter(r => r.mode === filters.mode)
  }

  if (filters?.completed !== undefined) {
    filtered = filtered.filter(r => r.completed === filters.completed)
  }

  return filtered
}

/**
 * Saves user settings
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  // Clear existing settings and save new ones
  await db.settings.clear()
  await db.settings.add(settings)
}

/**
 * Gets user settings
 */
export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.orderBy('id').last()
  return settings || DEFAULT_SETTINGS
}

/**
 * Clears all data from the database
 */
export async function clearAllData(): Promise<void> {
  await db.savedGames.clear()
  await db.gameHistory.clear()
  await db.settings.clear()
}

/**
 * Gets statistics from game history
 */
export async function getStatistics(size?: number) {
  const history = await getGameHistory(size ? { size } : undefined)

  const completed = history.filter(h => h.completed)

  if (completed.length === 0) {
    return {
      totalGames: 0,
      completedGames: 0,
      averageMoves: 0,
      averageTime: 0,
      bestMoves: 0,
      bestTime: 0,
    }
  }

  const totalGames = history.length
  const completedGames = completed.length
  const averageMoves = completed.reduce((sum, h) => sum + h.moves, 0) / completedGames
  const averageTime = completed.reduce((sum, h) => sum + h.timeElapsed, 0) / completedGames
  const bestMoves = Math.min(...completed.map(h => h.moves))
  const bestTime = Math.min(...completed.map(h => h.timeElapsed))

  return {
    totalGames,
    completedGames,
    averageMoves: Math.round(averageMoves),
    averageTime: Math.round(averageTime),
    bestMoves,
    bestTime,
  }
}
