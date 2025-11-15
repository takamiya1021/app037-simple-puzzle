/**
 * AnalysisReportコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalysisReport } from '@/components/AnalysisReport';
import { PlayStyleAnalysis } from '@/lib/ai/analyzePlay';

describe('AnalysisReportコンポーネント', () => {
  const mockAnalysis: PlayStyleAnalysis = {
    efficiency: 85.5,
    movePatterns: {
      up: 10,
      down: 8,
      left: 5,
      right: 7,
      total: 30,
      mostFrequent: 'up',
    },
    playTime: {
      minutes: 3,
      seconds: 45,
      formatted: '3分45秒',
    },
    hintsUsed: 1,
    completionRate: 100,
    rank: 'A',
  };

  const mockAdvice = '素晴らしいプレイです！かなり効率的に解けました。';

  it('分析レポートが表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText(/分析|結果/)).toBeInTheDocument();
  });

  it('ランクが表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText(/ランク|評価/)).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('効率性スコアが表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText('効率性')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('プレイ時間が表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText(/時間|タイム/)).toBeInTheDocument();
    expect(screen.getByText(/3分45秒/)).toBeInTheDocument();
  });

  it('総手数が表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText('総移動回数')).toBeInTheDocument();
    expect(screen.getByText('30手')).toBeInTheDocument();
  });

  it('ヒント使用回数が表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText('ヒント使用')).toBeInTheDocument();
    expect(screen.getByText('1回')).toBeInTheDocument();
  });

  it('アドバイスメッセージが表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText(mockAdvice)).toBeInTheDocument();
  });

  it('Sランクの場合、特別な表示になること', () => {
    const sRankAnalysis = { ...mockAnalysis, rank: 'S' as const };
    const { container } = render(
      <AnalysisReport analysis={sRankAnalysis} advice={mockAdvice} />
    );

    expect(screen.getByText('S')).toBeInTheDocument();
    // Sランク用の特別なスタイルやアイコンが適用されているかチェック
    expect(
      container.querySelector('[class*="gold"]') ||
        container.querySelector('[class*="yellow"]')
    ).toBeTruthy();
  });

  it('Dランクの場合も正しく表示されること', () => {
    const dRankAnalysis = { ...mockAnalysis, rank: 'D' as const };
    render(<AnalysisReport analysis={dRankAnalysis} advice={mockAdvice} />);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('移動パターンの統計が表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    // 移動パターンセクションが存在する
    expect(screen.getByText(/パターン|方向/)).toBeInTheDocument();
  });

  it('最も多い移動方向が強調表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    // 「上」が最も多い方向として表示される
    expect(screen.getByText(/上|UP/)).toBeInTheDocument();
  });

  it('アドバイスが空の場合でも表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice="" />);

    // コンポーネントが正常にレンダリングされる
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('コンパクトモードで表示できること', () => {
    const { container } = render(
      <AnalysisReport analysis={mockAnalysis} advice={mockAdvice} compact={true} />
    );

    expect(container.querySelector('[class*="compact"]')).toBeTruthy();
  });

  it('カスタムクラス名を適用できること', () => {
    const { container } = render(
      <AnalysisReport
        analysis={mockAnalysis}
        advice={mockAdvice}
        className="custom-report"
      />
    );

    expect(container.querySelector('.custom-report')).toBeTruthy();
  });

  it('完了率が100%の場合、完了バッジが表示されること', () => {
    render(<AnalysisReport analysis={mockAnalysis} advice={mockAdvice} />);

    expect(screen.getByText(/完了|クリア|Complete/)).toBeInTheDocument();
  });

  it('未完了の場合も正しく表示されること', () => {
    const incompleteAnalysis = { ...mockAnalysis, completionRate: 0 };
    render(<AnalysisReport analysis={incompleteAnalysis} advice={mockAdvice} />);

    // 未完了の表示があるか確認
    expect(screen.queryByText(/完了|クリア|Complete/)).not.toBeInTheDocument();
  });
});
