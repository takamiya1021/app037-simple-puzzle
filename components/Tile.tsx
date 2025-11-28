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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Tile = ({ tile, size: _size, onClick, disabled }: TileProps) => {
  if (tile.isEmpty) {
    return (
      <span
        data-testid="puzzle-tile"
        className="rounded-lg bg-white/5"
        aria-label="empty slot"
      />
    )
  }

  const hasImage = !!tile.imageFragment
  const inlineStyle = hasImage
    ? { backgroundImage: `url(${tile.imageFragment})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      data-testid="puzzle-tile"
      aria-label={`Tile ${tile.id}`}
      className={clsx(
        'relative flex aspect-square items-center justify-center rounded-lg font-bold transition-all',
        hasImage
          ? 'border border-white/20 shadow-lg'
          : 'bg-gradient-to-br from-[#3a3a5c] to-[#2a2a45] border border-white/10 shadow-lg',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_0_10px_var(--accent-glow)]'
      )}
      style={inlineStyle}
      onClick={onClick}
    >
      {/* 画像がない場合のみ数字を表示 */}
      {!hasImage && (
        <span className="text-lg font-bold text-white/90 drop-shadow-md">
          {tile.id}
        </span>
      )}
    </motion.button>
  )
}

export default Tile
