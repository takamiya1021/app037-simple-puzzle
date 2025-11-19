import { EMPTY_TILE_ID, type PuzzleSize, type PuzzleState } from './types'

interface GenerateOptions {
  size?: PuzzleSize
  shuffleMoves?: number
  rng?: () => number
}

const DEFAULT_SHUFFLE_MOVES = 200

export function createSolvedState(size: PuzzleSize): PuzzleState {
  const totalTiles = size * size
  const state: PuzzleState = []

  for (let i = 1; i < totalTiles; i += 1) {
    state.push(i)
  }

  state.push(EMPTY_TILE_ID)
  return state
}

export function isSolvable(state: PuzzleState, size: PuzzleSize): boolean {
  const inversionCount = countInversions(state)
  const emptyRowFromBottom = size - Math.floor(state.indexOf(EMPTY_TILE_ID) / size)

  if (size % 2 !== 0) {
    return inversionCount % 2 === 0
  }

  if (emptyRowFromBottom % 2 === 0) {
    return inversionCount % 2 !== 0
  }

  return inversionCount % 2 === 0
}

export function generatePuzzle(options: GenerateOptions = {}): { state: PuzzleState; size: PuzzleSize } {
  const { size = 4, shuffleMoves = DEFAULT_SHUFFLE_MOVES, rng = Math.random } = options
  let state = createSolvedState(size)

  for (let move = 0; move < shuffleMoves; move += 1) {
    const neighbors = getValidMoves(state, size)
    const choice = neighbors[Math.floor(rng() * neighbors.length)]
    state = applyMove(state, choice)
  }

  if (!isSolvable(state, size)) {
    state = swapLastTwoTiles(state)
  }

  return { state, size }
}

export function getValidMoves(state: PuzzleState, size: PuzzleSize): number[] {
  const emptyIndex = state.indexOf(EMPTY_TILE_ID)
  const emptyRow = Math.floor(emptyIndex / size)
  const emptyCol = emptyIndex % size
  const candidates: number[] = []

  const addCandidate = (row: number, col: number) => {
    if (row >= 0 && row < size && col >= 0 && col < size) {
      candidates.push(row * size + col)
    }
  }

  addCandidate(emptyRow - 1, emptyCol)
  addCandidate(emptyRow + 1, emptyCol)
  addCandidate(emptyRow, emptyCol - 1)
  addCandidate(emptyRow, emptyCol + 1)

  return candidates.filter((index) => state[index] !== EMPTY_TILE_ID)
}

export function applyMove(state: PuzzleState, tileIndex: number): PuzzleState {
  const emptyIndex = state.indexOf(EMPTY_TILE_ID)
  const nextState = [...state]
  const temp = nextState[tileIndex]
  nextState[tileIndex] = EMPTY_TILE_ID
  nextState[emptyIndex] = temp
  return nextState
}

function swapLastTwoTiles(state: PuzzleState): PuzzleState {
  const nextState = [...state]
  const lastIndex = nextState.length - 1
  const secondLastIndex = lastIndex - 1
  const temp = nextState[secondLastIndex]
  nextState[secondLastIndex] = nextState[lastIndex]
  nextState[lastIndex] = temp
  return nextState
}

function countInversions(state: PuzzleState): number {
  const tiles = state.filter((value) => value !== EMPTY_TILE_ID)
  let inversions = 0

  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i] > tiles[j]) {
        inversions += 1
      }
    }
  }

  return inversions
}
