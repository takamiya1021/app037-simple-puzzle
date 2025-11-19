import { act, renderHook } from '@testing-library/react'
import { useGameTimer } from './useGameTimer'

describe('useGameTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts, ticks, and pauses correctly', () => {
    const { result } = renderHook(() => useGameTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(2500)
    })

    expect(result.current.seconds).toBe(2)

    act(() => {
      result.current.pause()
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.seconds).toBe(2)
  })

  it('resets to zero and restarts when requested', () => {
    const { result } = renderHook(() => useGameTimer())

    act(() => {
      result.current.start()
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.seconds).toBe(3)

    act(() => {
      result.current.reset()
    })

    expect(result.current.seconds).toBe(0)
  })
})
