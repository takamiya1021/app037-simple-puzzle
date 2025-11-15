'use client';

/**
 * 分析レポートコンポーネント
 * プレイスタイルの分析結果とアドバイスを表示
 */

import React from 'react';
import { PlayStyleAnalysis } from '@/lib/ai/analyzePlay';

interface AnalysisReportProps {
  analysis: PlayStyleAnalysis;
  advice: string;
  compact?: boolean;
  className?: string;
}

export function AnalysisReport({
  analysis,
  advice,
  compact = false,
  className = '',
}: AnalysisReportProps) {
  const {
    efficiency,
    movePatterns,
    playTime,
    hintsUsed,
    completionRate,
    rank,
  } = analysis;

  // ランクに応じた色とアイコンを決定
  const getRankStyle = () => {
    switch (rank) {
      case 'S':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-500',
          border: 'border-yellow-500',
          icon: '👑',
        };
      case 'A':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-600',
          icon: '🎉',
        };
      case 'B':
        return {
          bg: 'bg-green-600',
          text: 'text-green-600',
          border: 'border-green-600',
          icon: '👍',
        };
      case 'C':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-500',
          border: 'border-orange-500',
          icon: '💪',
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-500',
          border: 'border-gray-500',
          icon: '📊',
        };
    }
  };

  const rankStyle = getRankStyle();

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 ${
        compact ? 'compact' : ''
      } ${className}`}
    >
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          プレイ結果分析
        </h2>
        {completionRate === 100 && (
          <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ✓ 完了
          </span>
        )}
      </div>

      {/* ランク表示 */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-6xl mb-2">{rankStyle.icon}</div>
        <div
          className={`text-6xl font-bold ${rankStyle.text} mb-2 border-4 ${rankStyle.border} rounded-full w-24 h-24 flex items-center justify-center`}
        >
          {rank}
        </div>
        <p className="text-sm text-gray-600">ランク評価</p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 効率性 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {efficiency.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">効率性</div>
        </div>

        {/* プレイ時間 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {playTime.formatted}
          </div>
          <div className="text-sm text-gray-600 mt-1">プレイ時間</div>
        </div>

        {/* 総手数 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {movePatterns.total}手
          </div>
          <div className="text-sm text-gray-600 mt-1">総移動回数</div>
        </div>

        {/* ヒント使用 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {hintsUsed}回
          </div>
          <div className="text-sm text-gray-600 mt-1">ヒント使用</div>
        </div>
      </div>

      {/* 移動パターン */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          移動パターン
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <div
            className={`text-center p-3 rounded ${
              movePatterns.mostFrequent === 'up'
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="text-xl">⬆️</div>
            <div className="text-sm font-semibold">{movePatterns.up}</div>
            <div className="text-xs text-gray-600">上</div>
          </div>
          <div
            className={`text-center p-3 rounded ${
              movePatterns.mostFrequent === 'down'
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="text-xl">⬇️</div>
            <div className="text-sm font-semibold">{movePatterns.down}</div>
            <div className="text-xs text-gray-600">下</div>
          </div>
          <div
            className={`text-center p-3 rounded ${
              movePatterns.mostFrequent === 'left'
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="text-xl">⬅️</div>
            <div className="text-sm font-semibold">{movePatterns.left}</div>
            <div className="text-xs text-gray-600">左</div>
          </div>
          <div
            className={`text-center p-3 rounded ${
              movePatterns.mostFrequent === 'right'
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="text-xl">➡️</div>
            <div className="text-sm font-semibold">{movePatterns.right}</div>
            <div className="text-xs text-gray-600">右</div>
          </div>
        </div>
      </div>

      {/* アドバイス */}
      {advice && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            AIアドバイス
          </h3>
          <p className="text-gray-700 whitespace-pre-line">{advice}</p>
        </div>
      )}
    </div>
  );
}
