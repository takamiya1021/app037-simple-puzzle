/**
 * MoveCounterコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MoveCounter } from '@/components/MoveCounter';

describe('MoveCounterコンポーネント', () => {
  it('初期状態で0手が表示されること', () => {
    render(<MoveCounter count={0} />);
    expect(screen.getByText('0手')).toBeInTheDocument();
  });

  it('移動回数が正しく表示されること', () => {
    render(<MoveCounter count={15} />);
    expect(screen.getByText('15手')).toBeInTheDocument();
  });

  it('大きな数値も正しく表示されること', () => {
    render(<MoveCounter count={999} />);
    expect(screen.getByText('999手')).toBeInTheDocument();
  });

  it('目標手数が指定された場合、表示されること', () => {
    render(<MoveCounter count={10} targetCount={20} />);

    expect(screen.getByText('10手')).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it('目標手数を超えた場合、警告スタイルが適用されること', () => {
    const { container } = render(<MoveCounter count={25} targetCount={20} />);

    expect(screen.getByText('25手')).toBeInTheDocument();
    // 警告を示す要素が存在するか確認（テキストまたはスタイル）
    expect(container.querySelector('[class*="red"]') || container.querySelector('[class*="warning"]')).toBeTruthy();
  });

  it('目標手数以内の場合、通常スタイルが適用されること', () => {
    const { container } = render(<MoveCounter count={15} targetCount={20} />);

    expect(screen.getByText('15手')).toBeInTheDocument();
    // 通常スタイル（青や緑など）の要素が存在するか確認
    expect(container.querySelector('[class*="blue"]') || container.querySelector('[class*="green"]')).toBeTruthy();
  });

  it('最適手数との比較が表示されること', () => {
    render(<MoveCounter count={15} optimalCount={10} />);

    expect(screen.getByText('15手')).toBeInTheDocument();
    expect(screen.getByText(/最適.*10/)).toBeInTheDocument();
  });

  it('最適手数と同じ場合、完璧を示すメッセージが表示されること', () => {
    render(<MoveCounter count={10} optimalCount={10} />);

    expect(screen.getByText('10手')).toBeInTheDocument();
    expect(screen.getByText(/完璧|最適/) || screen.getByText('✓')).toBeTruthy();
  });

  it('アイコンが表示されること', () => {
    const { container } = render(<MoveCounter count={5} />);

    // SVGアイコンが存在することを確認
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('showLabelがfalseの場合、ラベルが非表示になること', () => {
    render(<MoveCounter count={10} showLabel={false} />);

    // 「手」という文字が含まれていないことを確認
    expect(screen.queryByText(/手$/)).not.toBeInTheDocument();
    // 数値のみ表示されることを確認
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('カスタムラベルが指定できること', () => {
    render(<MoveCounter count={5} label="moves" />);

    // 数値とラベルが両方含まれていることを確認
    expect(screen.getByText(/5moves/)).toBeInTheDocument();
  });
});
