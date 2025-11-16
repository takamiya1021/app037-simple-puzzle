'use client';

/**
 * タイマーコンポーネント
 * タイムアタックモード（カウントダウン）とフリープレイモード（カウントアップ）に対応
 */

import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  mode: 'timeAttack' | 'freePlay';
  initialTime?: number; // タイムアタックモードの初期時間（秒）
  isRunning: boolean;
  onTimeout?: () => void; // タイムアウト時のコールバック
  onTick?: (currentTime: number) => void; // 毎秒のコールバック
}

export function Timer({ mode, initialTime = 0, isRunning, onTimeout, onTick }: TimerProps) {
  const [time, setTime] = useState<number>(mode === 'timeAttack' ? initialTime : 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // モードが変わった場合、時間をリセット
    setTime(mode === 'timeAttack' ? initialTime : 0);
  }, [mode, initialTime]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime((prevTime) => {
        let newTime: number;

        if (mode === 'timeAttack') {
          // カウントダウン
          newTime = Math.max(0, prevTime - 1);

          // タイムアウト判定
          if (newTime === 0 && prevTime > 0) {
            onTimeout?.();
          }
        } else {
          // カウントアップ
          newTime = prevTime + 1;
        }

        // onTickコールバック
        onTick?.(newTime);

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, onTimeout, onTick]);

  /**
   * 秒をMM:SS形式にフォーマット
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-2xl font-bold text-gray-800 font-mono">
        {formatTime(time)}
      </span>
    </div>
  );
}
