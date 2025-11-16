/**
 * Timerコンポーネントのテスト
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Timer } from '@/components/Timer';

describe('Timerコンポーネント', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('初期状態で00:00が表示されること', () => {
    render(<Timer mode="freePlay" isRunning={false} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('カウントアップモード（フリープレイ）で時間が増加すること', () => {
    render(<Timer mode="freePlay" isRunning={true} />);

    // 1秒進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01')).toBeInTheDocument();

    // さらに59秒進める（合計60秒）
    act(() => {
      jest.advanceTimersByTime(59000);
    });
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('カウントダウンモード（タイムアタック）で時間が減少すること', () => {
    render(<Timer mode="timeAttack" initialTime={300} isRunning={true} />);

    // 初期値は5分（300秒）
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // 1秒進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('04:59')).toBeInTheDocument();
  });

  it('タイムアウト時にonTimeoutが呼ばれること', () => {
    const handleTimeout = jest.fn();
    render(<Timer mode="timeAttack" initialTime={2} isRunning={true} onTimeout={handleTimeout} />);

    // 2秒進める
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(handleTimeout).toHaveBeenCalledTimes(1);
  });

  it('isRunning=falseの場合、タイマーが停止すること', () => {
    const { rerender } = render(<Timer mode="freePlay" isRunning={true} />);

    // 1秒進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01')).toBeInTheDocument();

    // タイマーを停止
    rerender(<Timer mode="freePlay" isRunning={false} />);

    // さらに1秒進めても時間は変わらない
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01')).toBeInTheDocument();
  });

  it('MM:SS形式で正しく表示されること', () => {
    render(<Timer mode="freePlay" isRunning={true} />);

    // 125秒（2分5秒）
    act(() => {
      jest.advanceTimersByTime(125000);
    });
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('タイムアタックモードで残り時間が0になったら00:00と表示されること', () => {
    const handleTimeout = jest.fn();
    render(<Timer mode="timeAttack" initialTime={1} isRunning={true} onTimeout={handleTimeout} />);

    // 1秒進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('onTickが1秒ごとに呼ばれること', () => {
    const handleTick = jest.fn();
    render(<Timer mode="freePlay" isRunning={true} onTick={handleTick} />);

    // 3秒進める
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(handleTick).toHaveBeenCalledTimes(3);
  });
});
