/**
 * OptimalSolutionViewerコンポーネントのテスト
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptimalSolutionViewer } from '@/components/OptimalSolutionViewer';
import { PuzzleState } from '@/lib/puzzle/types';

describe('OptimalSolutionViewerコンポーネント', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('最適解のステップ数が表示されること', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 8],
      ],
      emptyPos: { row: 2, col: 1 },
      moveCount: 0,
    };

    render(<OptimalSolutionViewer state={state} onClose={mockOnClose} />);

    // 解の計算を待つ（計算中からローディング完了まで）
    await waitFor(
      () => {
        const element = screen.queryByText(/計算中/);
        expect(element).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 最適解が表示されることを確認（複数あるのでgetAllByTextを使用）
    const elements = screen.getAllByText(/最適解/);
    expect(elements.length).toBeGreaterThan(0);

    // 移動手順のテキストが表示されることを確認
    const tiles = screen.getAllByText(/タイル/);
    expect(tiles.length).toBeGreaterThan(0);
  }, 15000);

  it('完成状態の場合は「既に完成しています」と表示されること', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ],
      emptyPos: { row: 2, col: 2 },
      moveCount: 0,
    };

    render(<OptimalSolutionViewer state={state} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/既に完成/)).toBeInTheDocument();
    });
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれること', async () => {
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
    render(<OptimalSolutionViewer state={state} onClose={mockOnClose} />);

    const closeButton = await screen.findByRole('button', { name: /閉じる/ });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ローディング中は「計算中...」と表示されること', () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 8],
      ],
      emptyPos: { row: 2, col: 1 },
      moveCount: 0,
    };

    render(<OptimalSolutionViewer state={state} onClose={mockOnClose} />);

    expect(screen.getByText(/計算中/)).toBeInTheDocument();
  });

  it('移動手順が順番に表示されること', async () => {
    const state: PuzzleState = {
      board: [
        [1, 2, 3],
        [4, 5, 6],
        [0, 7, 8],
      ],
      emptyPos: { row: 2, col: 0 },
      moveCount: 0,
    };

    render(<OptimalSolutionViewer state={state} onClose={mockOnClose} />);

    // 解の計算を待つ（計算中からローディング完了まで）
    await waitFor(
      () => {
        const element = screen.queryByText(/計算中/);
        expect(element).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 最適解が表示されることを確認（複数あるのでgetAllByTextを使用）
    const elements = screen.getAllByText(/最適解/);
    expect(elements.length).toBeGreaterThan(0);

    // 移動手順のテキストが表示されることを確認
    const tiles = screen.getAllByText(/タイル/);
    expect(tiles.length).toBeGreaterThan(0);
  }, 15000);
});
