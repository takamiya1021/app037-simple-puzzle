/**
 * Phase 3: A* Solver (TDD - Green)
 *
 * A* algorithm implementation for solving sliding puzzles
 */

import { PuzzleState, Move, indexToPosition } from './types'
import { getValidMoves, applyMove } from './generator'
import { isComplete } from './validator'

/**
 * Priority Queue Node
 */
interface PQNode {
  state: PuzzleState
  priority: number
  pathCost: number
}

/**
 * Simple Priority Queue implementation
 */
class PriorityQueue {
  private items: PQNode[] = []

  enqueue(node: PQNode): void {
    this.items.push(node)
    this.items.sort((a, b) => a.priority - b.priority)
  }

  dequeue(): PQNode | undefined {
    return this.items.shift()
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }
}

/**
 * Solution result
 */
export interface SolverResult {
  found: boolean
  moves: Move[]
  nodesExplored: number
  timeElapsed: number
}

/**
 * Calculates Manhattan distance heuristic for a puzzle state
 * @param state - Puzzle state
 * @returns Manhattan distance
 */
export function calculateManhattanDistance(state: PuzzleState): number {
  let distance = 0

  for (const tile of state.tiles) {
    // Skip empty tile in Manhattan distance calculation
    if (tile.isEmpty) {
      continue
    }

    // Calculate where this tile should be
    const goalPos = indexToPosition(tile.id, state.size)

    // Add Manhattan distance
    distance += Math.abs(tile.position.x - goalPos.x) + Math.abs(tile.position.y - goalPos.y)
  }

  return distance
}

/**
 * Generates a unique hash for a puzzle state
 * @param state - Puzzle state
 * @returns Hash string
 */
export function getPuzzleHash(state: PuzzleState): string {
  // Create a string representation of tile positions
  const positions = state.tiles
    .map(tile => {
      const index = tile.position.y * state.size + tile.position.x
      return `${tile.id}:${index}`
    })
    .sort()
    .join(',')

  return positions
}

/**
 * Reconstructs the path from start to goal
 */
function reconstructPath(
  cameFrom: Map<string, { state: PuzzleState; move: Move | null }>,
  currentHash: string
): Move[] {
  const path: Move[] = []
  let hash = currentHash

  while (cameFrom.has(hash)) {
    const entry = cameFrom.get(hash)!
    if (entry.move) {
      path.unshift(entry.move)
    }
    if (!entry.move) {
      break
    }
    const prevState = entry.state
    hash = getPuzzleHash(prevState)
  }

  return path
}

/**
 * Solves a puzzle using A* algorithm
 * @param initialState - Starting puzzle state
 * @param timeout - Maximum time in milliseconds (default: 30000)
 * @returns Solution result
 */
export function solvePuzzle(
  initialState: PuzzleState,
  timeout: number = 30000
): SolverResult {
  const startTime = Date.now()
  let nodesExplored = 0

  // Check if already solved
  if (isComplete(initialState)) {
    return {
      found: true,
      moves: [],
      nodesExplored: 0,
      timeElapsed: Date.now() - startTime,
    }
  }

  const openSet = new PriorityQueue()
  const closedSet = new Set<string>()
  const cameFrom = new Map<string, { state: PuzzleState; move: Move | null }>()
  const gScore = new Map<string, number>()

  const initialHash = getPuzzleHash(initialState)
  gScore.set(initialHash, 0)
  cameFrom.set(initialHash, { state: initialState, move: null })

  openSet.enqueue({
    state: initialState,
    priority: calculateManhattanDistance(initialState),
    pathCost: 0,
  })

  while (!openSet.isEmpty()) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      return {
        found: false,
        moves: [],
        nodesExplored,
        timeElapsed: Date.now() - startTime,
      }
    }

    const current = openSet.dequeue()!
    const currentHash = getPuzzleHash(current.state)
    nodesExplored++

    // Check if we've reached the goal
    if (isComplete(current.state)) {
      const path = reconstructPath(cameFrom, currentHash)
      return {
        found: true,
        moves: path,
        nodesExplored,
        timeElapsed: Date.now() - startTime,
      }
    }

    closedSet.add(currentHash)

    // Explore neighbors
    const validMoves = getValidMoves(current.state)

    for (const move of validMoves) {
      const neighbor = applyMove(current.state, move)
      const neighborHash = getPuzzleHash(neighbor)

      // Skip if already evaluated
      if (closedSet.has(neighborHash)) {
        continue
      }

      const tentativeGScore = current.pathCost + 1

      // Check if this is a better path
      const existingGScore = gScore.get(neighborHash) ?? Infinity

      if (tentativeGScore < existingGScore) {
        // This path is better
        cameFrom.set(neighborHash, { state: current.state, move })
        gScore.set(neighborHash, tentativeGScore)

        const hScore = calculateManhattanDistance(neighbor)
        const fScore = tentativeGScore + hScore

        openSet.enqueue({
          state: neighbor,
          priority: fScore,
          pathCost: tentativeGScore,
        })
      }
    }
  }

  // No solution found
  return {
    found: false,
    moves: [],
    nodesExplored,
    timeElapsed: Date.now() - startTime,
  }
}
