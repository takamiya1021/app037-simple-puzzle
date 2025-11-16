'use client';

/**
 * 最適解表示コンポーネント
 * A*アルゴリズムで計算した最適解をステップバイステップで表示
 */

import React, { useState, useEffect } from 'react';
import { PuzzleState, Position } from '@/lib/puzzle/types';
import { solvePuzzle, isGoalState } from '@/lib/puzzle/solver';

interface OptimalSolutionViewerProps {
  state: PuzzleState;
  onClose: () => void;
}

export function OptimalSolutionViewer({ state, onClose }: OptimalSolutionViewerProps) {
  const [solution, setSolution] = useState<Position[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 解を計算
    const calculateSolution = async () => {
      setIsLoading(true);

      // 非同期処理でUIをブロックしないようにする
      setTimeout(() => {
        const result = solvePuzzle(state);
        setSolution(result);
        setIsLoading(false);
      }, 100);
    };

    calculateSolution();
  }, [state]);

  const getMoveDescription = (move: Position, index: number): string => {
    const { row, col } = move;
    const tileNumber = state.board[row][col];

    // 移動方向を判定
    const { emptyPos } = state;
    let direction = '';

    if (row < emptyPos.row) direction = '下';
    else if (row > emptyPos.row) direction = '上';
    else if (col < emptyPos.col) direction = '右';
    else if (col > emptyPos.col) direction = '左';

    return `タイル${tileNumber}を${direction}に移動`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">最適解表示</h2>
          <p className="text-sm mt-1 opacity-90">A*アルゴリズムによる最短手順</p>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">計算中...</p>
            </div>
          ) : isGoalState(state) ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl font-bold text-green-600">既に完成しています！</p>
              <p className="text-gray-600 mt-2">パズルは既に解かれています。</p>
            </div>
          ) : solution && solution.length > 0 ? (
            <div>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold text-blue-900">
                  最適解: <span className="text-2xl text-blue-600">{solution.length}</span> 手
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  この手順で最短でパズルを完成できます
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">移動手順：</h3>
                {solution.map((move, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <p className="text-gray-800">{getMoveDescription(move, index)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-red-600">解が見つかりませんでした</p>
              <p className="text-gray-600 mt-2">このパズルは解けない可能性があります。</p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
