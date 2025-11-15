'use client';

/**
 * ヒントボタンコンポーネント
 * ユーザーに次の最適な一手をヒントとして表示
 */

import React, { useState } from 'react';
import { PuzzleState } from '@/lib/puzzle/types';
import { generateHint, HintResponse } from '@/app/actions/ai';

interface HintButtonProps {
  state: PuzzleState;
  maxHints?: number; // 最大ヒント使用回数（デフォルト: 3）
  penaltyMoves?: number; // ヒント使用時のペナルティ手数
  compact?: boolean; // コンパクト表示
  className?: string;
  onHintUsed?: (hint: { tileNumber?: number; direction?: string }) => void;
}

export function HintButton({
  state,
  maxHints = 3,
  penaltyMoves = 0,
  compact = false,
  className = '',
  onHintUsed,
}: HintButtonProps) {
  const [hintsRemaining, setHintsRemaining] = useState(maxHints);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHint, setCurrentHint] = useState<HintResponse | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleGetHint = async () => {
    if (hintsRemaining <= 0 || isLoading) return;

    setIsLoading(true);
    try {
      const hint = await generateHint(state);
      setCurrentHint(hint);
      setShowHint(true);

      if (hint.success) {
        setHintsRemaining((prev) => prev - 1);
        onHintUsed?.({
          tileNumber: hint.tileNumber,
          direction: hint.direction,
        });
      }
    } catch (error) {
      setCurrentHint({
        success: false,
        error: 'ヒントの取得中にエラーが発生しました',
      });
      setShowHint(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseHint = () => {
    setShowHint(false);
  };

  const isDisabled = hintsRemaining <= 0 || isLoading;

  return (
    <div className={`${compact ? 'compact' : ''} ${className}`}>
      {/* ヒントボタン */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleGetHint}
          disabled={isDisabled}
          className={`
            px-4 py-2 rounded-lg font-semibold transition-colors
            ${
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            flex items-center justify-center space-x-2
          `}
        >
          {/* アイコン */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span>{isLoading ? '生成中...' : 'ヒント'}</span>
        </button>

        {/* 残り回数とペナルティ情報 */}
        <div className="text-xs text-gray-600 text-center">
          <div>残り: {hintsRemaining}回</div>
          {penaltyMoves > 0 && (
            <div className="text-orange-600">ペナルティ: +{penaltyMoves}手</div>
          )}
        </div>
      </div>

      {/* ヒント表示モーダル */}
      {showHint && currentHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            {currentHint.success ? (
              <>
                {/* 成功時 */}
                <div className="text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    ヒント
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    {currentHint.hint}
                  </p>
                  {penaltyMoves > 0 && (
                    <p className="text-sm text-orange-600 mb-4">
                      ペナルティ: +{penaltyMoves}手が追加されます
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* エラー時 */}
                <div className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-red-600 mb-3">
                    エラー
                  </h3>
                  <p className="text-gray-700 mb-4">{currentHint.error}</p>
                </div>
              </>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={handleCloseHint}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
