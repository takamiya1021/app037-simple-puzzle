/**
 * PuzzleBoardコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PuzzleBoard } from '@/components/PuzzleBoard';
import { PuzzleState } from '@/lib/puzzle/types';
import { createSolvedState } from '@/lib/puzzle/generator';

describe('PuzzleBoardコンポーネント', () => {
  const mockOnMove = jest.fn();

  beforeEach(() => {
    mockOnMove.mockClear();
  });

  it('パズルボードが正しく表示されること', () => {
    const state = createSolvedState(3);
    render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // タイル1〜8が表示されることを確認
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('正しいサイズのグリッドが生成されること', () => {
    const state = createSolvedState(4);
    const { container } = render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // 4x4 = 16個のタイル（空きマス含む）が存在することを確認
    const tiles = container.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles).toHaveLength(16);
  });

  it('空きマスが正しく表示されること', () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ],
      emptyPos: { row: 2, col: 2 },
      moveCount: 0,
    };

    const { container } = render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // 空きマス用のクラスが存在することを確認
    expect(container.querySelector('.empty-tile')).toBeInTheDocument();
  });

  it('移動可能なタイルをクリックするとonMoveが呼ばれること', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ],
      emptyPos: { row: 2, col: 2 },
      moveCount: 0,
    };

    const user = userEvent.setup();
    render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // タイル8（移動可能）をクリック
    const tile8 = screen.getByText('8').closest('div');
    if (tile8) {
      await user.click(tile8);
    }

    expect(mockOnMove).toHaveBeenCalledTimes(1);
    expect(mockOnMove).toHaveBeenCalledWith({ row: 2, col: 1 });
  });

  it('移動不可能なタイルをクリックしてもonMoveが呼ばれないこと', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ],
      emptyPos: { row: 2, col: 2 },
      moveCount: 0,
    };

    const user = userEvent.setup();
    render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // タイル1（移動不可能）をクリック
    const tile1 = screen.getByText('1').closest('div');
    if (tile1) {
      await user.click(tile1);
    }

    expect(mockOnMove).not.toHaveBeenCalled();
  });

  it('異なるサイズのパズルも正しく表示されること', () => {
    const state = createSolvedState(5);
    const { container } = render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // 5x5 = 25個のタイル
    const tiles = container.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles).toHaveLength(25);

    // タイル1〜24が表示されることを確認
    for (let i = 1; i <= 24; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('複数のタイルが移動可能な場合、それぞれクリック可能であること', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 0, 5],
        [6, 7, 8],
      ],
      emptyPos: { row: 1, col: 1 },
      moveCount: 0,
    };

    const user = userEvent.setup();
    render(<PuzzleBoard state={state} onMove={mockOnMove} />);

    // タイル2（上）をクリック
    const tile2 = screen.getByText('2').closest('div');
    if (tile2) {
      await user.click(tile2);
    }
    expect(mockOnMove).toHaveBeenCalledWith({ row: 0, col: 1 });

    mockOnMove.mockClear();

    // タイル4（左）をクリック
    const tile4 = screen.getByText('4').closest('div');
    if (tile4) {
      await user.click(tile4);
    }
    expect(mockOnMove).toHaveBeenCalledWith({ row: 1, col: 0 });
  });
});
