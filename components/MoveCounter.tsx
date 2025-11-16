'use client';

/**
 * 手数カウンターコンポーネント
 * 現在の移動回数を表示し、目標手数や最適手数との比較も可能
 */

import React from 'react';

interface MoveCounterProps {
  count: number;
  targetCount?: number; // 目標手数（制限モード用）
  optimalCount?: number; // 最適解の手数
  showLabel?: boolean; // ラベルを表示するか（デフォルト: true）
  label?: string; // カスタムラベル（デフォルト: "手"）
}

export function MoveCounter({
  count,
  targetCount,
  optimalCount,
  showLabel = true,
  label = '手',
}: MoveCounterProps) {
  // 目標手数を超えているかチェック
  const isOverTarget = targetCount !== undefined && count > targetCount;

  // 最適手数と同じかチェック
  const isOptimal = optimalCount !== undefined && count === optimalCount;

  // 表示するテキストの色を決定
  const getCountColor = () => {
    if (isOverTarget) return 'text-red-600';
    if (isOptimal) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        {/* アイコン */}
        <svg
          className={`w-5 h-5 ${getCountColor()}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>

        {/* 手数表示 */}
        <span className={`text-2xl font-bold ${getCountColor()} font-mono`}>
          {count}
          {showLabel && label}
        </span>

        {/* 最適手数と同じ場合の表示 */}
        {isOptimal && (
          <span className="text-green-600 font-semibold text-sm">✓ 最適</span>
        )}
      </div>

      {/* 目標手数の表示 */}
      {targetCount !== undefined && (
        <div className="text-xs text-gray-600 ml-7">
          目標: {targetCount}手
          {isOverTarget && (
            <span className="text-red-600 ml-2">(超過)</span>
          )}
        </div>
      )}

      {/* 最適手数の表示 */}
      {optimalCount !== undefined && !isOptimal && (
        <div className="text-xs text-gray-600 ml-7">
          最適解: {optimalCount}手 (+{count - optimalCount})
        </div>
      )}
    </div>
  );
}
