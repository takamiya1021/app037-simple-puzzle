/**
 * 統計ダッシュボードコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatisticsDashboard } from '@/components/StatisticsDashboard';
import type { GameStatistics } from '@/lib/storage/historyStore';

describe('StatisticsDashboardコンポーネント', () => {
  const mockStatistics: GameStatistics = {
    totalGames: 10,
    completedGames: 8,
    averageTime: 125.5,
    averageMoves: 35.2,
    averageEfficiency: 82.5,
    bestTime: 90,
    bestMoves: 25,
    rankDistribution: {
      S: 2,
      A: 3,
      B: 2,
      C: 1,
      D: 0,
    },
  };

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    const dashboard = screen.getByTestId('statistics-dashboard');
    expect(dashboard).toBeInTheDocument();
  });

  it('総ゲーム数が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/総ゲーム数|Total Games/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('完了ゲーム数が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/完了|Completed/i)).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('平均時間が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/平均時間|Average Time/i)).toBeInTheDocument();
    // 125.5秒は2分5秒として表示される
    const container = screen.getByTestId('statistics-dashboard');
    expect(container.textContent).toContain('2分');
  });

  it('平均手数が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/平均手数|Average Moves/i)).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
  });

  it('平均効率が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/効率|Efficiency/i)).toBeInTheDocument();
    expect(screen.getByText(/82/)).toBeInTheDocument();
  });

  it('ベストタイムが表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/ベストタイム|Best Time/i)).toBeInTheDocument();
    // 90秒は1分30秒として表示される
    const container = screen.getByTestId('statistics-dashboard');
    expect(container.textContent).toContain('1分30秒');
  });

  it('ベスト手数が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/ベスト手数|Best Moves/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('ランク分布が表示されること', () => {
    render(<StatisticsDashboard statistics={mockStatistics} />);

    expect(screen.getByText(/ランク|Rank/i)).toBeInTheDocument();
    // S: 2, A: 3, B: 2, C: 1
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('データがない場合の表示が正しいこと', () => {
    const emptyStats: GameStatistics = {
      totalGames: 0,
      completedGames: 0,
      averageTime: 0,
      averageMoves: 0,
      averageEfficiency: 0,
      bestTime: 0,
      bestMoves: 0,
      rankDistribution: {},
    };

    render(<StatisticsDashboard statistics={emptyStats} />);

    expect(screen.getByText(/データなし|No Data|まだプレイ記録がありません/i)).toBeInTheDocument();
  });

  it('カスタムクラス名を適用できること', () => {
    const { container } = render(
      <StatisticsDashboard statistics={mockStatistics} className="custom-dashboard" />
    );

    expect(container.querySelector('.custom-dashboard')).toBeInTheDocument();
  });

  it('統計カードが適切にレイアウトされていること', () => {
    const { container } = render(<StatisticsDashboard statistics={mockStatistics} />);

    const statCards = container.querySelectorAll('[class*="stat-card"]');
    expect(statCards.length).toBeGreaterThan(0);
  });
});
