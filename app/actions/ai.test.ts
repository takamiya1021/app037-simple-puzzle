import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import { generateHint, generateAnalysis } from './ai'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { EMPTY_TILE_ID } from '@/lib/puzzle/types'

beforeEach(() => {
  delete process.env.GEMINI_API_KEY
})

describe('generateHint', () => {
  it('returns error when puzzle is already solved', async () => {
    const state = createSolvedState(4)
    const result = await generateHint({ state, size: 4 })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns default hint when no API key provided', async () => {
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 4)
    const result = await generateHint({ state, size: 4 })
    expect(result.success).toBe(true)
    expect(result.isDefaultMessage).toBe(true)
    expect(result.hint).toContain('タイル')
  })

  it('uses client API key argument when provided', async () => {
    const mockModel = {
      generateContent: jest.fn(async () => ({ response: { text: () => 'client key hint' } })),
    }
    const factory = jest.fn(() => mockModel)
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)
    const result = await generateHint({ state, size: 4, clientApiKey: 'from-client', modelFactory: factory })
    expect(factory).toHaveBeenCalledWith('from-client')
    expect(result.isDefaultMessage).toBe(false)
  })

  it('uses Gemini when API key is available', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const mockModel = {
      generateContent: jest.fn(async () => ({ response: { text: () => 'AIヒント: タイルを動かそう' } })),
    }
    const factory = jest.fn(() => mockModel)

    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)
    const result = await generateHint({ state, size: 4, modelFactory: factory })
    expect(result.success).toBe(true)
    expect(result.isDefaultMessage).toBe(false)
    expect(result.hint).toContain('AIヒント')
    expect(factory).toHaveBeenCalledWith('test-key')
    expect(mockModel.generateContent).toHaveBeenCalled()
  })

  it('falls back to default when Gemini returns empty string', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const mockModel = {
      generateContent: jest.fn(async () => ({ response: { text: () => '' } })),
    }
    const factory = jest.fn(() => mockModel)

    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)
    const result = await generateHint({ state, size: 4, modelFactory: factory })
    expect(result.isDefaultMessage).toBe(true)
    expect(result.hint).toContain('タイル')
  })

  it('recovers when the Gemini client throws an error', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const factory = jest.fn(() => {
      throw new Error('network failure')
    })
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)
    const result = await generateHint({ state, size: 4, modelFactory: factory })
    expect(result.isDefaultMessage).toBe(true)
    expect(result.success).toBe(true)
    errorSpy.mockRestore()
  })
})

describe('generateAnalysis', () => {
  it('returns error when metrics cannot be computed', async () => {
    const result = await generateAnalysis({
      initialState: [1, 2, 3],
      size: undefined,
      moveCount: 10,
      durationSeconds: 10,
    })
    expect(result.success).toBe(false)
    expect(result.metrics).toBeNull()
  })

  it('returns fallback summary when no API key', async () => {
    let initial = createSolvedState(4)
    initial = applyMove(initial, initial.indexOf(EMPTY_TILE_ID) - 4)
    const result = await generateAnalysis({ initialState: initial, size: 4, moveCount: 80, durationSeconds: 120 })
    expect(result.success).toBe(true)
    expect(result.summary).toContain('実際の手数')
    expect(result.metrics).not.toBeNull()
    expect(result.isDefaultMessage).toBe(true)
  })

  it('uses Gemini when API key exists', async () => {
    process.env.GEMINI_API_KEY = 'analysis-key'
    const mockModel = {
      generateContent: jest.fn(async () => ({ response: { text: () => '解析: 効率良い動きでした' } })),
    }
    const factory = jest.fn(() => mockModel)

    let initial = createSolvedState(4)
    initial = applyMove(initial, initial.indexOf(EMPTY_TILE_ID) - 1)
    const result = await generateAnalysis({
      initialState: initial,
      size: 4,
      moveCount: 80,
      durationSeconds: 90,
      modelFactory: factory,
    })
    expect(result.success).toBe(true)
    expect(result.isDefaultMessage).toBe(false)
    expect(result.summary).toContain('解析')
    expect(factory).toHaveBeenCalledWith('analysis-key')
  })
})
