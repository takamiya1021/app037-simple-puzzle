import { render, screen, fireEvent } from '@testing-library/react'
import ModeChips from './ModeChips'
import { useGameStore } from '@/lib/store/gameStore'

// Mock the store
jest.mock('@/lib/store/gameStore')

describe('ModeChips', () => {
    const mockSetMode = jest.fn()

    beforeEach(() => {
        ; (useGameStore as unknown as jest.Mock).mockReturnValue({
            mode: 'freePlay',
            setMode: mockSetMode,
        })
    })

    it('renders all mode options', () => {
        render(<ModeChips />)
        expect(screen.getByText('フリープレイ')).toBeInTheDocument()
        expect(screen.getByText('タイムアタック')).toBeInTheDocument()
        expect(screen.getByText('手数チャレンジ')).toBeInTheDocument()
    })

    it('highlights active mode', () => {
        render(<ModeChips />)
        const activeChip = screen.getByText('フリープレイ').closest('button')
        expect(activeChip).toHaveClass('bg-cyan-500')
    })

    it('calls setMode when clicking a chip', () => {
        render(<ModeChips />)
        fireEvent.click(screen.getByText('タイムアタック'))
        expect(mockSetMode).toHaveBeenCalledWith('timeAttack')
    })
})
