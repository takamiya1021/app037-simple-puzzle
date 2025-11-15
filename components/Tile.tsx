'use client';

/**
 * タイルコンポーネント
 * パズルの個別タイルを表示
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Position } from '@/lib/puzzle/types';

interface TileProps {
  number: number;
  position: Position;
  isMovable: boolean;
  onClick: () => void;
}

export function Tile({ number, position, isMovable, onClick }: TileProps) {
  // 空きマスの場合
  if (number === 0) {
    return (
      <div
        className="empty-tile w-full h-full bg-gray-700 rounded-md"
        data-testid={`tile-${position.row}-${position.col}`}
      />
    );
  }

  return (
    <motion.div
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileHover={isMovable ? { scale: 1.05 } : {}}
      whileTap={isMovable ? { scale: 0.95 } : {}}
      onClick={isMovable ? onClick : undefined}
      className={`
        w-full h-full rounded-md shadow-lg
        flex items-center justify-center
        bg-gradient-to-br from-white to-blue-100
        ${isMovable ? 'movable cursor-pointer hover:shadow-xl' : 'cursor-default'}
        transition-shadow duration-200
      `}
      data-testid={`tile-${position.row}-${position.col}`}
    >
      <span className="text-3xl font-bold text-blue-900">{number}</span>
    </motion.div>
  );
}
