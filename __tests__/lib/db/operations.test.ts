/**
 * Phase 4: Database Operations Tests (TDD - Red)
 *
 * Tests for IndexedDB operations using Dexie.js
 */

import {
  saveGameState,
  loadGameState,
  saveGameHistory,
  getGameHistory,
  saveSettings,
  getSettings,
  clearAllData,
} from '@/lib/db/operations'
import { PuzzleState, GameMode } from '@/lib/puzzle/types'
import { createSolvedState } from '@/lib/puzzle/generator'

// Mock indexedDB for testing
import 'fake-indexeddb/auto'

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearAllData()
  })

  describe('saveGameState and loadGameState', () => {
    it('should save and load game state', async () => {
      const state = createSolvedState(4)

      await saveGameState(state)
      const loaded = await loadGameState()

      expect(loaded).toBeDefined()
      expect(loaded?.size).toBe(4)
      expect(loaded?.tiles).toHaveLength(16)
    })

    it('should return null when no game state exists', async () => {
      const loaded = await loadGameState()

      expect(loaded).toBeNull()
    })

    it('should overwrite existing game state', async () => {
      const state1 = createSolvedState(4)
      const state2 = createSolvedState(5)

      await saveGameState(state1)
      await saveGameState(state2)

      const loaded = await loadGameState()

      expect(loaded?.size).toBe(5)
    })
  })

  describe('saveGameHistory and getGameHistory', () => {
    it('should save game to history', async () => {
      const gameRecord = {
        id: 'test-1',
        size: 4,
        mode: 'free' as GameMode,
        moves: 50,
        timeElapsed: 120000,
        completed: true,
        timestamp: Date.now(),
      }

      await saveGameHistory(gameRecord)
      const history = await getGameHistory()

      expect(history).toHaveLength(1)
      expect(history[0].id).toBe('test-1')
      expect(history[0].moves).toBe(50)
    })

    it('should return multiple game records sorted by timestamp', async () => {
      const now = Date.now()

      const game1 = {
        id: 'test-1',
        size: 4,
        mode: 'free' as GameMode,
        moves: 30,
        timeElapsed: 60000,
        completed: true,
        timestamp: now - 1000,
      }

      const game2 = {
        id: 'test-2',
        size: 5,
        mode: 'time-attack' as GameMode,
        moves: 50,
        timeElapsed: 90000,
        completed: true,
        timestamp: now,
      }

      await saveGameHistory(game1)
      await saveGameHistory(game2)

      const history = await getGameHistory()

      expect(history).toHaveLength(2)
      // Should be sorted by timestamp descending (newest first)
      expect(history[0].id).toBe('test-2')
      expect(history[1].id).toBe('test-1')
    })

    it('should limit history to 100 records', async () => {
      const records = []
      for (let i = 0; i < 150; i++) {
        records.push({
          id: `test-${i}`,
          size: 4,
          mode: 'free' as GameMode,
          moves: i,
          timeElapsed: i * 1000,
          completed: true,
          timestamp: Date.now() + i,
        })
      }

      for (const record of records) {
        await saveGameHistory(record)
      }

      const history = await getGameHistory()

      expect(history.length).toBeLessThanOrEqual(100)
    })

    it('should filter history by size', async () => {
      await saveGameHistory({
        id: 'test-1',
        size: 4,
        mode: 'free' as GameMode,
        moves: 30,
        timeElapsed: 60000,
        completed: true,
        timestamp: Date.now(),
      })

      await saveGameHistory({
        id: 'test-2',
        size: 5,
        mode: 'free' as GameMode,
        moves: 50,
        timeElapsed: 90000,
        completed: true,
        timestamp: Date.now(),
      })

      const history4x4 = await getGameHistory({ size: 4 })

      expect(history4x4).toHaveLength(1)
      expect(history4x4[0].size).toBe(4)
    })

    it('should filter history by mode', async () => {
      await saveGameHistory({
        id: 'test-1',
        size: 4,
        mode: 'free' as GameMode,
        moves: 30,
        timeElapsed: 60000,
        completed: true,
        timestamp: Date.now(),
      })

      await saveGameHistory({
        id: 'test-2',
        size: 4,
        mode: 'time-attack' as GameMode,
        moves: 50,
        timeElapsed: 90000,
        completed: true,
        timestamp: Date.now(),
      })

      const freeHistory = await getGameHistory({ mode: 'free' })

      expect(freeHistory).toHaveLength(1)
      expect(freeHistory[0].mode).toBe('free')
    })
  })

  describe('saveSettings and getSettings', () => {
    it('should save and load settings', async () => {
      const settings = {
        soundEnabled: true,
        musicEnabled: false,
        difficulty: 'medium' as const,
        theme: 'light' as const,
      }

      await saveSettings(settings)
      const loaded = await getSettings()

      expect(loaded).toEqual(settings)
    })

    it('should return default settings when none exist', async () => {
      const loaded = await getSettings()

      expect(loaded).toBeDefined()
      expect(loaded.soundEnabled).toBe(true)
      expect(loaded.musicEnabled).toBe(true)
    })

    it('should update existing settings', async () => {
      const settings1 = {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'easy' as const,
        theme: 'light' as const,
      }

      const settings2 = {
        soundEnabled: false,
        musicEnabled: false,
        difficulty: 'hard' as const,
        theme: 'dark' as const,
      }

      await saveSettings(settings1)
      await saveSettings(settings2)

      const loaded = await getSettings()

      expect(loaded.soundEnabled).toBe(false)
      expect(loaded.difficulty).toBe('hard')
    })
  })

  describe('clearAllData', () => {
    it('should clear all stored data', async () => {
      const state = createSolvedState(4)
      const gameRecord = {
        id: 'test-1',
        size: 4,
        mode: 'free' as GameMode,
        moves: 50,
        timeElapsed: 120000,
        completed: true,
        timestamp: Date.now(),
      }

      await saveGameState(state)
      await saveGameHistory(gameRecord)

      await clearAllData()

      const loadedState = await loadGameState()
      const history = await getGameHistory()

      expect(loadedState).toBeNull()
      expect(history).toHaveLength(0)
    })
  })
})
