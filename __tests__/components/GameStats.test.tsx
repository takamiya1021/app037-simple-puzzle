/**
 * GameStatsコンポーネントのテスト
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { GameStats } from '@/components/GameStats';

describe('GameStatsコンポーネント', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('フリープレイモード', () => {
    it('タイマーと手数カウンターが表示されること', () => {
      render(
        <GameStats
          mode="freePlay"
          moveCount={10}
          isRunning={true}
        />
      );

      // タイマー（カウントアップ）が表示される
      expect(screen.getByText('00:00')).toBeInTheDocument();

      // 手数カウンターが表示される
      expect(screen.getByText('10手')).toBeInTheDocument();
    });

    it('ゲームモード名が表示されること', () => {
      render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
        />
      );

      expect(screen.getByText(/フリープレイ/i)).toBeInTheDocument();
    });

    it('難易度が表示されること', () => {
      render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
          difficulty="intermediate"
        />
      );

      expect(screen.getByText(/中級|Intermediate/i)).toBeInTheDocument();
    });
  });

  describe('タイムアタックモード', () => {
    it('カウントダウンタイマーが表示されること', () => {
      render(
        <GameStats
          mode="timeAttack"
          moveCount={10}
          isRunning={true}
          initialTime={300}
        />
      );

      // 初期時間（5分 = 300秒）が表示される
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('ゲームモード名が表示されること', () => {
      render(
        <GameStats
          mode="timeAttack"
          moveCount={5}
          isRunning={true}
          initialTime={180}
        />
      );

      expect(screen.getByText(/タイムアタック|Time Attack/i)).toBeInTheDocument();
    });
  });

  describe('最小手数モード', () => {
    it('目標手数が表示されること', () => {
      render(
        <GameStats
          mode="minMoves"
          moveCount={15}
          isRunning={true}
          targetMoves={20}
        />
      );

      // 手数カウンターに目標が表示される
      expect(screen.getByText('15手')).toBeInTheDocument();
      expect(screen.getByText(/20/)).toBeInTheDocument();
    });

    it('最適手数が表示されること', () => {
      render(
        <GameStats
          mode="minMoves"
          moveCount={15}
          isRunning={true}
          optimalMoves={12}
        />
      );

      expect(screen.getByText(/最適.*12/)).toBeInTheDocument();
    });

    it('ゲームモード名が表示されること', () => {
      render(
        <GameStats
          mode="minMoves"
          moveCount={5}
          isRunning={true}
        />
      );

      expect(screen.getByText(/最小手数|Min Moves/i)).toBeInTheDocument();
    });
  });

  describe('タイマー動作', () => {
    it('フリープレイモードでタイマーが進むこと', () => {
      render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
        />
      );

      // 初期状態
      expect(screen.getByText('00:00')).toBeInTheDocument();

      // 1秒進める
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('00:01')).toBeInTheDocument();
    });

    it('タイムアタックモードでタイマーが減ること', () => {
      render(
        <GameStats
          mode="timeAttack"
          moveCount={5}
          isRunning={true}
          initialTime={60}
        />
      );

      // 初期状態（1分）
      expect(screen.getByText('01:00')).toBeInTheDocument();

      // 1秒進める
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('00:59')).toBeInTheDocument();
    });

    it('タイムアウト時にコールバックが呼ばれること', () => {
      const handleTimeout = jest.fn();

      render(
        <GameStats
          mode="timeAttack"
          moveCount={5}
          isRunning={true}
          initialTime={2}
          onTimeout={handleTimeout}
        />
      );

      // 2秒進める
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(handleTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('スタイリング', () => {
    it('コンパクトな表示ができること', () => {
      const { container } = render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
          compact={true}
        />
      );

      // コンパクトモードでは一部の情報が省略される
      expect(container.querySelector('[class*="compact"]')).toBeTruthy();
    });

    it('カスタムクラス名を適用できること', () => {
      const { container } = render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeTruthy();
    });
  });

  describe('手数変更', () => {
    it('手数が更新されると表示が変わること', () => {
      const { rerender } = render(
        <GameStats
          mode="freePlay"
          moveCount={5}
          isRunning={true}
        />
      );

      expect(screen.getByText('5手')).toBeInTheDocument();

      // 手数を更新
      rerender(
        <GameStats
          mode="freePlay"
          moveCount={10}
          isRunning={true}
        />
      );

      expect(screen.getByText('10手')).toBeInTheDocument();
    });
  });
});
