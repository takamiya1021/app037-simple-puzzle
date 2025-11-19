'use client'

import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { PuzzleTileData } from '@/lib/puzzle/types'

interface TileProps {
  tile: PuzzleTileData
  size: number
  onClick?: () => void
  disabled?: boolean
}

const Tile = ({ tile, size, onClick, disabled }: TileProps) => {
  if (tile.isEmpty) {
    return <span data-testid="puzzle-tile" className="sr-only">empty slot</span>
  }

  const inlineStyle = tile.imageFragment
    ? { backgroundImage: `url(${tile.imageFragment})`, backgroundSize: `${size * 100}%` }
    : undefined

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      data-testid="puzzle-tile"
      aria-label={`Tile ${tile.id}`}
      className={clsx(
        'flex items-center justify-center rounded-xl border-2 border-white font-semibold text-slate-700 shadow-lg transition-colors',
        disabled ? 'cursor-not-allowed bg-slate-200 text-slate-400' : 'bg-pink-100 hover:bg-pink-200'
      )}
      style={inlineStyle}
      onClick={onClick}
    >
      <span className="drop-shadow-md">{tile.id}</span>
    </motion.button>
  )
}

export default Tile
