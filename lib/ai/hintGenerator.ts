import { solvePuzzle } from '@/lib/puzzle/solver'
import { EMPTY_TILE_ID, type PuzzleMoveSuggestion, type PuzzleSize, type PuzzleState } from '@/lib/puzzle/types'

const DEFAULT_MAX_NODES = 20000
const SUPPORTED_SIZES = new Set<PuzzleSize>([4, 5, 6])

export function getNextOptimalMove(state: PuzzleState, size?: PuzzleSize): PuzzleMoveSuggestion | null {
  const resolvedSize = resolveSize(state, size)
  if (!resolvedSize) {
    return null
  }

  const result = solvePuzzle(state, resolvedSize, { maxNodes: DEFAULT_MAX_NODES })
  if (!result.solved || result.moves.length === 0 || result.states.length < 2) {
    return null
  }

  const moveIndex = result.moves[0]
  const initialEmptyIndex = state.indexOf(EMPTY_TILE_ID)
  const tileId = state[moveIndex]
  const direction = determineDirection(initialEmptyIndex, moveIndex, resolvedSize)

  if (tileId === EMPTY_TILE_ID || !direction) {
    return null
  }

  return {
    tileId,
    direction,
  }
}

export function buildHintPrompt(move: PuzzleMoveSuggestion) {
  return `スライドパズルの最適な一手を30文字程度で教えてください。\n` +
    `タイル番号: ${move.tileId}\n` +
    `移動方向: ${translateDirection(move.direction)}\n` +
    `なぜその一手が有効かを簡潔に説明してください。`
}

function resolveSize(state: PuzzleState, size?: PuzzleSize): PuzzleSize | null {
  if (size && SUPPORTED_SIZES.has(size)) {
    return size
  }

  const derived = Math.sqrt(state.length)
  if (!Number.isInteger(derived) || !SUPPORTED_SIZES.has(derived as PuzzleSize)) {
    return null
  }
  return derived as PuzzleSize
}

function determineDirection(emptyIndex: number, tileIndex: number, size: PuzzleSize): PuzzleMoveSuggestion['direction'] | null {
  if (tileIndex === emptyIndex - size) {
    return 'down'
  }
  if (tileIndex === emptyIndex + size) {
    return 'up'
  }
  if (tileIndex === emptyIndex - 1) {
    return 'right'
  }
  if (tileIndex === emptyIndex + 1) {
    return 'left'
  }
  return null
}

function translateDirection(direction: PuzzleMoveSuggestion['direction']) {
  switch (direction) {
    case 'up':
      return '上'
    case 'down':
      return '下'
    case 'left':
      return '左'
    case 'right':
      return '右'
    default:
      return direction
  }
}
