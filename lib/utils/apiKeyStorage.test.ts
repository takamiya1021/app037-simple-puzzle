import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import { deleteApiKey, loadApiKey, saveApiKey } from './apiKeyStorage'

describe('apiKeyStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and loads provider-specific keys', () => {
    expect(loadApiKey('gemini')).toBeNull()
    saveApiKey('gemini', 'abc123')
    expect(loadApiKey('gemini')).toBe('abc123')
  })

  it('deletes a specific key without affecting others', () => {
    saveApiKey('gemini', 'abc123')
    saveApiKey('imagen', 'img456')
    deleteApiKey('gemini')
    expect(loadApiKey('gemini')).toBeNull()
    expect(loadApiKey('imagen')).toBe('img456')
  })

  it('handles corrupted payload gracefully', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem('custom-image-puzzle-api-keys', 'not-json')
    expect(loadApiKey('gemini')).toBeNull()
    warnSpy.mockRestore()
  })
})
