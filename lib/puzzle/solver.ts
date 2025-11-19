import { applyMove, createSolvedState, getValidMoves, isSolvable } from './generator'
import { EMPTY_TILE_ID, type PuzzleSize, type PuzzleState } from './types'

interface SolveOptions {
  maxNodes?: number
}

interface ParentInfo {
  parentKey: string | null
  moveIndex: number | null
}

export interface SolveResult {
  solved: boolean
  moves: number[]
  states: PuzzleState[]
  nodesEvaluated: number
  reason?: string
  timeMs: number
}

const DEFAULT_MAX_NODES = 50000

export function solvePuzzle(initialState: PuzzleState, size: PuzzleSize, options: SolveOptions = {}): SolveResult {
  const { maxNodes = DEFAULT_MAX_NODES } = options
  const goalState = createSolvedState(size)
  const goalKey = serializeState(goalState)
  const startKey = serializeState(initialState)
  const startTime = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()

  if (startKey === goalKey) {
    return {
      solved: true,
      moves: [],
      states: [initialState],
      nodesEvaluated: 0,
      timeMs: 0,
    }
  }

  if (!isSolvable(initialState, size)) {
    return { solved: false, moves: [], states: [], nodesEvaluated: 0, reason: 'unsolvable-state', timeMs: 0 }
  }

  const openSet = new MinPriorityQueue<StateNode>()
  const gScore = new Map<string, number>([[startKey, 0]])
  const cameFrom: Record<string, ParentInfo | null> = { [startKey]: null }
  const statesByKey: Record<string, PuzzleState> = { [startKey]: initialState }
  const startNode: StateNode = {
    key: startKey,
    state: initialState,
    gCost: 0,
    fCost: computeManhattanDistance(initialState, size),
  }

  openSet.enqueue(startNode, startNode.fCost)
  let nodesEvaluated = 0

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()
    if (!current) break
    nodesEvaluated += 1

    if (current.key === goalKey) {
      const { moves, states } = reconstructMoves(cameFrom, statesByKey[goalKey] ?? goalState, size, statesByKey)
      return { solved: true, moves, states, nodesEvaluated, timeMs: elapsedSince(startTime) }
    }

    if (nodesEvaluated > maxNodes) {
      return { solved: false, moves: [], states: [], nodesEvaluated, reason: 'max-nodes-exceeded', timeMs: elapsedSince(startTime) }
    }

    const neighbors = getValidMoves(current.state, size)

    for (const moveIndex of neighbors) {
      const neighborState = applyMove(current.state, moveIndex)
      const neighborKey = serializeState(neighborState)
      const tentativeG = current.gCost + 1

      if (tentativeG >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
        continue
      }

      gScore.set(neighborKey, tentativeG)
      cameFrom[neighborKey] = { parentKey: current.key, moveIndex }
      statesByKey[neighborKey] = neighborState

      const hCost = computeManhattanDistance(neighborState, size)
      openSet.enqueue({ key: neighborKey, state: neighborState, gCost: tentativeG, fCost: tentativeG + hCost }, tentativeG + hCost)
    }
  }

  return { solved: false, moves: [], states: [], nodesEvaluated, reason: 'exhausted-open-set', timeMs: elapsedSince(startTime) }
}

interface ReconstructionResult {
  moves: number[]
  states: PuzzleState[]
}

export function reconstructMoves(
  cameFrom: Record<string, ParentInfo | null>,
  finalState: PuzzleState,
  size: PuzzleSize,
  statesByKey: Record<string, PuzzleState> = {}
): ReconstructionResult {
  const states: PuzzleState[] = []
  const moves: number[] = []
  let currentKey = serializeState(finalState)

  while (true) {
    const state = statesByKey[currentKey] ?? deserializeState(currentKey)
    states.unshift(state)
    const parentInfo = cameFrom[currentKey]

    if (!parentInfo || !parentInfo.parentKey) {
      break
    }

    if (parentInfo.moveIndex !== null && parentInfo.moveIndex !== undefined) {
      moves.unshift(parentInfo.moveIndex)
    }

    currentKey = parentInfo.parentKey
  }

  return { moves, states }
}

interface StateNode {
  key: string
  state: PuzzleState
  gCost: number
  fCost: number
}

class MinPriorityQueue<T extends { key: string }> {
  private heap: Array<{ priority: number; value: T }> = []

  enqueue(value: T, priority: number) {
    this.heap.push({ value, priority })
    this.bubbleUp()
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    const root = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0 && last) {
      this.heap[0] = last
      this.bubbleDown()
    }
    return root.value
  }

  isEmpty() {
    return this.heap.length === 0
  }

  private bubbleUp() {
    let index = this.heap.length - 1
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break
      ;[this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]]
      index = parentIndex
    }
  }

  private bubbleDown() {
    let index = 0
    const length = this.heap.length

    while (true) {
      const left = index * 2 + 1
      const right = index * 2 + 2
      let smallest = index

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left
      }

      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right
      }

      if (smallest === index) break
      ;[this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]]
      index = smallest
    }
  }
}

export function computeManhattanDistance(state: PuzzleState, size: PuzzleSize): number {
  let distance = 0

  for (let index = 0; index < state.length; index += 1) {
    const tile = state[index]
    if (tile === EMPTY_TILE_ID) continue

    const targetRow = Math.floor((tile - 1) / size)
    const targetCol = (tile - 1) % size
    const currentRow = Math.floor(index / size)
    const currentCol = index % size
    distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol)
  }

  return distance
}

function serializeState(state: PuzzleState): string {
  return state.join(',')
}

function deserializeState(key: string): PuzzleState {
  return key.split(',').map((value) => Number(value))
}

export interface SolutionFrame {
  step: number
  moveIndex: number | null
  state: PuzzleState
}

export function buildSolutionFrames(moves: number[], states: PuzzleState[]): SolutionFrame[] {
  return states.map((state, index) => ({
    step: index,
    moveIndex: index === 0 ? null : moves[index - 1] ?? null,
    state,
  }))
}

function elapsedSince(startTime: number): number {
  const end = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()
  return Math.max(0, end - startTime)
}
