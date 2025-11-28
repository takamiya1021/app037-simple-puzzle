import { render, screen } from '@testing-library/react'
import StatusHUD from './StatusHUD'
import { useGameStore } from '@/lib/store/gameStore'

// Mock the store
jest.mock('@/lib/store/gameStore')

describe('StatusHUD', () => {
  beforeEach(() => {
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      elapsedSeconds: 125, // 02:05
      moveCount: 42,
      size: 4,
    })
  })

  it('renders time correctly', () => {
    render(<StatusHUD />)
    expect(screen.getByText('02:05')).toBeInTheDocument()
  })

  it('renders move count correctly', () => {
    render(<StatusHUD />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders size correctly', () => {
    render(<StatusHUD />)
    expect(screen.getByText('4x4')).toBeInTheDocument()
  })
})
