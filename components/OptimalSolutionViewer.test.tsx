import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OptimalSolutionViewer from './OptimalSolutionViewer'
import { createSolvedState, applyMove } from '@/lib/puzzle/generator'
import { EMPTY_TILE_ID } from '@/lib/puzzle/types'

describe('OptimalSolutionViewer', () => {
  it('computes and lists solution steps when solvable', async () => {
    let state = createSolvedState(4)
    state = applyMove(state, state.indexOf(EMPTY_TILE_ID) - 1)

    const user = userEvent.setup()
    render(<OptimalSolutionViewer size={4} state={state} />)

    await user.click(screen.getByRole('button', { name: '最適解を計算' }))

    const steps = await screen.findAllByTestId('solution-step')
    expect(steps.length).toBeGreaterThan(0)
  })

  it('shows an error when no solution can be found', async () => {
    const state = createSolvedState(4)
    ;[state[0], state[1]] = [state[1], state[0]]

    const user = userEvent.setup()
    render(<OptimalSolutionViewer size={4} state={state} />)

    await user.click(screen.getByRole('button', { name: '最適解を計算' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('解を特定できません')
    })
  })
})
