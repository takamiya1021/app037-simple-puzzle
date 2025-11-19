import { render, screen } from '@testing-library/react'
import HomePage from '../page'

describe('HomePage', () => {
  it('renders the construction placeholder', () => {
    render(<HomePage />)
    expect(screen.getByText('カスタム画像パズルを構築中…')).toBeInTheDocument()
  })
})
