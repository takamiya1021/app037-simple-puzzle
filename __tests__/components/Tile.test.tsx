/**
 * Tileコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tile } from '@/components/Tile';

describe('Tileコンポーネント', () => {
  it('タイル番号が正しく表示されること', () => {
    render(<Tile number={5} position={{ row: 1, col: 1 }} isMovable={false} onClick={() => {}} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('空きマス（0）の場合は数字が表示されないこと', () => {
    const { container } = render(
      <Tile number={0} position={{ row: 2, col: 2 }} isMovable={false} onClick={() => {}} />
    );

    // 0という文字が表示されていないことを確認
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    // 空きマス用のクラスが適用されていることを確認
    expect(container.querySelector('.empty-tile')).toBeInTheDocument();
  });

  it('クリック時にonClickハンドラーが呼ばれること', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Tile number={3} position={{ row: 0, col: 1 }} isMovable={true} onClick={handleClick} />);

    const tile = screen.getByText('3').closest('div');
    if (tile) {
      await user.click(tile);
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('移動可能なタイルにはmovableクラスが適用されること', () => {
    const { container } = render(
      <Tile number={7} position={{ row: 2, col: 1 }} isMovable={true} onClick={() => {}} />
    );

    expect(container.querySelector('.movable')).toBeInTheDocument();
  });

  it('移動不可能なタイルにはmovableクラスが適用されないこと', () => {
    const { container } = render(
      <Tile number={7} position={{ row: 0, col: 0 }} isMovable={false} onClick={() => {}} />
    );

    expect(container.querySelector('.movable')).not.toBeInTheDocument();
  });

  it('空きマスはクリックできないこと', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Tile number={0} position={{ row: 2, col: 2 }} isMovable={false} onClick={handleClick} />
    );

    const emptyTile = container.querySelector('.empty-tile');
    if (emptyTile) {
      await user.click(emptyTile);
    }

    // 空きマスはクリックできないため、ハンドラーは呼ばれない
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('異なる数字がそれぞれ正しく表示されること', () => {
    const { rerender } = render(
      <Tile number={1} position={{ row: 0, col: 0 }} isMovable={false} onClick={() => {}} />
    );
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<Tile number={15} position={{ row: 3, col: 2 }} isMovable={false} onClick={() => {}} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
