/**
 * Simple DB test to debug
 */

import 'fake-indexeddb/auto'
import { db } from '@/lib/db/schema'

describe('Simple DB Test', () => {
  it('should create database', async () => {
    expect(db).toBeDefined()
    expect(db.name).toBe('PuzzleGameDB')
  })

  it('should add and retrieve a record', async () => {
    const record = {
      state: { size: 4, tiles: [], emptyTileId: 15, moves: 0, isComplete: false, startTime: null, endTime: null },
      savedAt: Date.now(),
    }

    const id = await db.savedGames.add(record)
    expect(id).toBeDefined()

    const retrieved = await db.savedGames.get(id)
    expect(retrieved).toBeDefined()
    expect(retrieved?.state.size).toBe(4)
  })
})
