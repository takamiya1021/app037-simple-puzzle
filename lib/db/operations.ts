import { db, type GameHistoryRecord, type SettingRecord } from './schema'

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `game-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

export async function saveGameRecord(record: Omit<GameHistoryRecord, 'id'> & { id?: string }) {
  const id = record.id ?? generateId()
  await db.games.put({ ...record, id })
  return id
}

export async function getRecentGames(limit = 10) {
  return db.games.orderBy('completedAt').reverse().limit(limit).toArray()
}

export async function saveSetting<T>(key: string, value: T) {
  const payload: SettingRecord = {
    key,
    value: JSON.stringify(value),
    updatedAt: Date.now(),
  }
  await db.settings.put(payload)
}

export async function loadSetting<T>(key: string): Promise<T | null> {
  const entry = await db.settings.get(key)
  if (!entry) return null
  return JSON.parse(entry.value) as T
}

export async function clearDatabase() {
  await Promise.all([db.games.clear(), db.settings.clear()])
}
