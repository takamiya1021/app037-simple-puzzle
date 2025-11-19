import { render, screen } from '@testing-library/react'
import MoveCounter from './MoveCounter'

describe('MoveCounter', () => {
  it('displays move count with label', () => {
    render(<MoveCounter moves={42} />)
    expect(screen.getByText('42 手')).toBeInTheDocument()
  })
})
