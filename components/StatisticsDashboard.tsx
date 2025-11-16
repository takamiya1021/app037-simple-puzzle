'use client';

/**
 * 統計ダッシュボードコンポーネント
 * プレイ履歴の統計情報を表示
 */

import React from 'react';
import type { GameStatistics } from '@/lib/storage/historyStore';

interface StatisticsDashboardProps {
  statistics: GameStatistics;
  className?: string;
}

export function StatisticsDashboard({ statistics, className = '' }: StatisticsDashboardProps) {
  // データがない場合
  if (statistics.totalGames === 0) {
    return (
      <div className={`text-center p-8 ${className}`} data-testid="statistics-dashboard">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600 text-lg">まだプレイ記録がありません</p>
        <p className="text-gray-500 text-sm mt-2">
          ゲームをプレイすると統計が表示されます
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  const rankColors: Record<string, string> = {
    S: 'bg-yellow-100 text-yellow-800',
    A: 'bg-blue-100 text-blue-800',
    B: 'bg-green-100 text-green-800',
    C: 'bg-orange-100 text-orange-800',
    D: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid="statistics-dashboard">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">総ゲーム数</div>
          <div className="text-3xl font-bold text-gray-900">{statistics.totalGames}</div>
        </div>

        <div className="stat-card bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">完了</div>
          <div className="text-3xl font-bold text-green-600">{statistics.completedGames}</div>
        </div>

        <div className="stat-card bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">平均効率</div>
          <div className="text-3xl font-bold text-blue-600">
            {statistics.averageEfficiency.toFixed(1)}%
          </div>
        </div>

        <div className="stat-card bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">平均時間</div>
          <div className="text-3xl font-bold text-purple-600">
            {Math.floor(statistics.averageTime / 60)}分{Math.floor(statistics.averageTime % 60)}秒
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ベスト記録 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🏆 ベスト記録</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ベストタイム</span>
              <span className="font-bold text-lg text-purple-600">
                {Math.floor(statistics.bestTime / 60)}分{Math.floor(statistics.bestTime % 60)}秒
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ベスト手数</span>
              <span className="font-bold text-lg text-blue-600">{statistics.bestMoves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均手数</span>
              <span className="font-bold text-lg text-gray-700">
                {statistics.averageMoves.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* ランク分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🎖 ランク分布</h3>
          <div className="space-y-2">
            {Object.entries(statistics.rankDistribution)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([rank, count]) => (
                <div key={rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full font-bold text-sm bg-gray-100 text-gray-800"
                    >
                      {rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: String((count / statistics.completedGames) * 100) + '%' }}
                      />
                    </div>
                    <span className="font-semibold text-gray-700 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
