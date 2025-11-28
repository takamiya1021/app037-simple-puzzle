'use client'

import { useMemo } from 'react'
import clsx from 'clsx'
import Tile from './Tile'
import { canMove } from '@/lib/puzzle/validator'
import { EMPTY_TILE_ID, type PuzzleSize, type PuzzleState, type PuzzleTileData } from '@/lib/puzzle/types'

interface PuzzleBoardProps {
  size: PuzzleSize
  state: PuzzleState
  onMove?: (tileIndex: number) => void
  disabled?: boolean
  tileRenderSize?: number
  tileImages?: Record<number, string | null>
}

const PuzzleBoard = ({ size, state, onMove, disabled = false, tileImages }: PuzzleBoardProps) => {
  const tiles = useMemo(() => stateToTileData(state, size, tileImages), [state, size, tileImages])

  const handleTileClick = (index: number) => {
    if (!onMove || disabled) return
    if (canMove(state, size, index)) {
      onMove(index)
    }
  }

  return (
    <div
      className={clsx(
        'relative mx-auto grid aspect-square w-full max-w-sm gap-1.5',
        disabled && 'opacity-70'
      )}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      aria-label={`${size} by ${size} puzzle board`}
    >
      {tiles.map((tile, index) => (
        <Tile
          key={tile.id === EMPTY_TILE_ID ? `empty-${index}` : tile.id}
          tile={tile}
          size={size}
          onClick={() => handleTileClick(index)}
          disabled={disabled || tile.isEmpty}
        />
      ))}
    </div>
  )
}

function stateToTileData(state: PuzzleState, size: PuzzleSize, tileImages: Record<number, string | null> = {}): PuzzleTileData[] {
  return state.map((id, index) => ({
    id,
    isEmpty: id === EMPTY_TILE_ID,
    position: {
      row: Math.floor(index / size),
      col: index % size,
    },
    imageFragment: tileImages[id] ?? null,
  }))
}

export default PuzzleBoard
