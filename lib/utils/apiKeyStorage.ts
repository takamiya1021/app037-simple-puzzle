const STORAGE_KEY = 'custom-image-puzzle-api-keys'

type Provider = 'gemini' | 'imagen'

interface ApiKeyPayload {
  gemini?: string
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
  payload[provider] = key
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadApiKey(provider: Provider): string | null {
  const storage = getStorage()
  if (!storage) return null
  const payload = readPayload(storage)
  return payload[provider] ?? null
}

export function deleteApiKey(provider: Provider) {
  const storage = getStorage()
  if (!storage) return
  const payload = readPayload(storage)
  delete payload[provider]
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
