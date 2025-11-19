import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

describe('RootLayout', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders its children content', () => {
    render(
      <RootLayout>
        <p data-testid="layout-child">child</p>
      </RootLayout>
    )

    expect(screen.getByTestId('layout-child')).toHaveTextContent('child')
  })
})
