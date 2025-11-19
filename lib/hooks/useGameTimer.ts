'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseGameTimerOptions {
  autoStart?: boolean
  initialSeconds?: number
}

export function useGameTimer(options: UseGameTimerOptions = {}) {
  const { autoStart = false, initialSeconds = 0 } = options
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    setSeconds((prev) => prev + 1)
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(tick, 1000)
  }, [tick])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setSeconds(0)
    setIsRunning(false)
    if (autoStart) {
      intervalRef.current = setInterval(tick, 1000)
      setIsRunning(true)
    }
  }, [autoStart, clearTimer, tick])

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return () => clearTimer()
  }, [autoStart, start, clearTimer])

  return { seconds, isRunning, start, pause, reset }
}
