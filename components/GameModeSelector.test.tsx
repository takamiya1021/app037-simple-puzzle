import { fireEvent, render, screen } from '@testing-library/react'
import GameModeSelector from './GameModeSelector'

const baseProps = {
  value: 'freePlay' as const,
  onChange: jest.fn(),
}

describe('GameModeSelector', () => {
  it('renders three mode buttons with descriptions', () => {
    render(<GameModeSelector {...baseProps} />)
    expect(screen.getByText('フリープレイ')).toBeInTheDocument()
    expect(screen.getByText('タイムアタック')).toBeInTheDocument()
    expect(screen.getByText('手数チャレンジ')).toBeInTheDocument()
  })

  it('calls onChange when a different mode is selected', () => {
    const onChange = jest.fn()
    render(<GameModeSelector {...baseProps} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'タイムアタック' }))
    expect(onChange).toHaveBeenCalledWith('timeAttack')
  })

  it('respects the disabled state', () => {
    const onChange = jest.fn()
    render(<GameModeSelector {...baseProps} disabled onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'タイムアタック' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
