import { fireEvent, render, screen } from '@testing-library/react'
import GameToast from './GameToast'

describe('GameToast', () => {
  it('renders message and reacts to close', () => {
    const onClose = jest.fn()
    render(<GameToast message="クリア！" onClose={onClose} />)
    expect(screen.getByText('クリア！')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalled()
  })
})
