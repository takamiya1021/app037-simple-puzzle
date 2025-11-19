import { act, render, screen } from '@testing-library/react'
import GameStats from './GameStats'

describe('GameStats', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const baseProps = {
    size: 4 as const,
    mode: 'freePlay' as const,
    moveCount: 0,
    isRunning: true,
    sessionId: 'session-1',
  }

  it('updates timer while running and notifies updates', () => {
    const onTimeUpdate = jest.fn()
    render(<GameStats {...baseProps} onTimeUpdate={onTimeUpdate} />)

    act(() => {
      jest.advanceTimersByTime(4000)
    })

    expect(onTimeUpdate).toHaveBeenLastCalledWith(4)
    expect(screen.getByText('00:04')).toBeInTheDocument()
  })

  it('resets when sessionId changes', () => {
    const { rerender } = render(<GameStats {...baseProps} />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(screen.getByText('00:03')).toBeInTheDocument()

    rerender(<GameStats {...baseProps} sessionId="session-2" />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('fires onTimeExpired when limit reached', () => {
    const onTimeExpired = jest.fn()
    render(<GameStats {...baseProps} mode="timeAttack" timeLimitSeconds={5} onTimeExpired={onTimeExpired} />)

    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(onTimeExpired).toHaveBeenCalledTimes(1)
  })
})
