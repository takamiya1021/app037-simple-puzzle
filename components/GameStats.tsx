'use client';

/**
 * ゲーム統計表示コンポーネント
 * タイマー、手数カウンター、モード、難易度を統合して表示
 */

import React from 'react';
import { Timer } from './Timer';
import { MoveCounter } from './MoveCounter';
import type { GameMode, Difficulty } from '@/lib/puzzle/types';

interface GameStatsProps {
  mode: GameMode;
  moveCount: number;
  isRunning: boolean;
  initialTime?: number; // タイムアタックモードの初期時間（秒）
  targetMoves?: number; // 最小手数モードの目標手数
  optimalMoves?: number; // 最適解の手数
  difficulty?: Difficulty;
  compact?: boolean; // コンパクト表示モード
  className?: string;
  onTimeout?: () => void;
}

// ゲームモード名のマッピング
const GAME_MODE_LABELS: Record<GameMode, string> = {
  freePlay: 'フリープレイ',
  timeAttack: 'タイムアタック',
  minMoves: '最小手数',
};

// 難易度名のマッピング
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  custom: 'カスタム',
};

export function GameStats({
  mode,
  moveCount,
  isRunning,
  initialTime,
  targetMoves,
  optimalMoves,
  difficulty,
  compact = false,
  className = '',
  onTimeout,
}: GameStatsProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 ${
        compact ? 'compact' : ''
      } ${className}`}
    >
      {/* ゲーム情報ヘッダー */}
      {!compact && (
        <div className="mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {GAME_MODE_LABELS[mode]}
            </h2>
            {difficulty && (
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 統計情報 */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* タイマー */}
        <div className={compact ? '' : 'pb-3 border-b border-gray-100'}>
          <Timer
            mode={mode === 'timeAttack' ? 'timeAttack' : 'freePlay'}
            initialTime={initialTime}
            isRunning={isRunning}
            onTimeout={onTimeout}
          />
        </div>

        {/* 手数カウンター */}
        <div>
          <MoveCounter
            count={moveCount}
            targetCount={mode === 'minMoves' ? targetMoves : undefined}
            optimalCount={mode === 'minMoves' ? optimalMoves : undefined}
          />
        </div>
      </div>
    </div>
  );
}
