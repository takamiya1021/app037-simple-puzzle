import { render, screen, fireEvent } from '@testing-library/react'
import CustomSizeSlider from './CustomSizeSlider'
import { useGameStore } from '@/lib/store/gameStore'

// Mock the store
jest.mock('@/lib/store/gameStore')

describe('CustomSizeSlider', () => {
    const mockSetSize = jest.fn()

    beforeEach(() => {
        ; (useGameStore as unknown as jest.Mock).mockReturnValue({
            size: 4,
            setSize: mockSetSize,
        })
    })

    it('renders slider correctly', () => {
        render(<CustomSizeSlider />)
        expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('calls setSize when slider changes', () => {
        render(<CustomSizeSlider />)
        const slider = screen.getByRole('slider')
        fireEvent.change(slider, { target: { value: '6' } })
        expect(mockSetSize).toHaveBeenCalledWith(6)
    })

    it('displays current size label', () => {
        render(<CustomSizeSlider />)
        expect(screen.getByText('4x4')).toBeInTheDocument()
    })
})
