import { render, screen } from '@testing-library/react'
import Timer from './Timer'

describe('Timer', () => {
  it('formats seconds into MM:SS', () => {
    render(<Timer label="時間" seconds={125} />)
    expect(screen.getByText('02:05')).toBeInTheDocument()
  })
})
