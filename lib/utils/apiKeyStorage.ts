const STORAGE_KEY = 'custom-image-puzzle-api-keys'

type Provider = 'gemini'

interface ApiKeyPayload {
  gemini?: string
  // Legacy keys (for backward compatibility)
  geminiImage?: string
  imagen?: string
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  return window.localStorage
}

export function saveApiKey(provider: Provider, key: string) {
  const storage = getStorage()
  if (!storage) return
  const payload = readPayload(storage)
  payload.gemini = key
  
  // クリーンアップ: 統合されたので古いキーは削除
  delete payload.geminiImage
  delete payload.imagen
  
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadApiKey(_provider: Provider = 'gemini'): string | null {
  const storage = getStorage()
  if (!storage) return null
  const payload = readPayload(storage)
  
  // 優先順位: gemini > geminiImage > imagen
  return payload.gemini ?? payload.geminiImage ?? payload.imagen ?? null
}

export function deleteApiKey(_provider: Provider) {
  const storage = getStorage()
  if (!storage) return
  const payload = readPayload(storage)
  delete payload.gemini
  delete payload.geminiImage
  delete payload.imagen
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function readPayload(storage: Storage): ApiKeyPayload {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ApiKeyPayload
  } catch (error) {
    console.warn('Failed to parse API key payload', error)
    return {}
  }
}
