'use client';

/**
 * パズルボードコンポーネント
 * パズル全体を表示し、タイルの移動を管理
 */

import React, { useMemo } from 'react';
import { Tile } from './Tile';
import { PuzzleState, Position } from '@/lib/puzzle/types';
import { isMovable } from '@/lib/puzzle/validator';

interface PuzzleBoardProps {
  state: PuzzleState;
  onMove: (position: Position) => void;
}

export function PuzzleBoard({ state, onMove }: PuzzleBoardProps) {
  const { board, emptyPos } = state;
  const size = board.length;

  // タイルのサイズを計算（レスポンシブ対応）
  const tileSize = useMemo(() => {
    // サイズに応じてタイルの大きさを調整
    if (size <= 4) return 'h-20 w-20 sm:h-24 sm:w-24';
    if (size <= 5) return 'h-16 w-16 sm:h-20 sm:w-20';
    return 'h-12 w-12 sm:h-14 sm:w-14';
  }, [size]);

  // グリッドのギャップを計算
  const gridGap = useMemo(() => {
    if (size <= 4) return 'gap-2';
    if (size <= 5) return 'gap-1.5';
    return 'gap-1';
  }, [size]);

  const handleTileClick = (row: number, col: number) => {
    const position: Position = { row, col };
    if (isMovable(state, position)) {
      onMove(position);
    }
  };

  return (
    <div
      className={`
        grid
        ${gridGap}
        bg-gradient-to-br from-blue-900 to-purple-900
        p-4 rounded-lg shadow-2xl
      `}
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((number, colIndex) => {
          const position: Position = { row: rowIndex, col: colIndex };
          const movable = isMovable(state, position);

          return (
            <div key={`${rowIndex}-${colIndex}`} className={tileSize}>
              <Tile
                number={number}
                position={position}
                isMovable={movable}
                onClick={() => handleTileClick(rowIndex, colIndex)}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
