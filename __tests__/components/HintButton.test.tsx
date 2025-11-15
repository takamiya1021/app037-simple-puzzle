/**
 * HintButtonコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HintButton } from '@/components/HintButton';
import { PuzzleState } from '@/lib/puzzle/types';

// generateHintのモック
jest.mock('@/app/actions/ai', () => ({
  generateHint: jest.fn(),
}));

import { generateHint } from '@/app/actions/ai';
const mockGenerateHint = generateHint as jest.MockedFunction<typeof generateHint>;

describe('HintButtonコンポーネント', () => {
  const mockState: PuzzleState = {
    board: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8],
    ],
    emptyPos: { row: 2, col: 1 },
    moveCount: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ヒントボタンが表示されること', () => {
    render(<HintButton state={mockState} />);

    expect(screen.getByRole('button', { name: /ヒント/i })).toBeInTheDocument();
  });

  it('残りヒント回数が表示されること', () => {
    render(<HintButton state={mockState} maxHints={3} />);

    expect(screen.getByText(/残り.*3/)).toBeInTheDocument();
  });

  it('ヒントボタンをクリックするとヒントが表示されること', async () => {
    mockGenerateHint.mockResolvedValue({
      success: true,
      hint: 'タイル8を右に移動してみましょう！',
      tileNumber: 8,
      direction: '右',
    });

    render(<HintButton state={mockState} />);

    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/タイル8を右に移動/)).toBeInTheDocument();
    });
  });

  it('ヒントを使用すると残り回数が減ること', async () => {
    mockGenerateHint.mockResolvedValue({
      success: true,
      hint: 'ヒントメッセージ',
      tileNumber: 8,
      direction: '右',
    });

    render(<HintButton state={mockState} maxHints={3} />);

    // 初期状態
    expect(screen.getByText(/残り.*3/)).toBeInTheDocument();

    // ヒントをクリック
    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/残り.*2/)).toBeInTheDocument();
    });
  });

  it('残りヒント回数が0の場合、ボタンが無効化されること', async () => {
    mockGenerateHint.mockResolvedValue({
      success: true,
      hint: 'ヒント1',
    });

    render(<HintButton state={mockState} maxHints={1} />);

    const button = screen.getByRole('button', { name: /ヒント/i });

    // 1回目のクリック
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('ローディング中はボタンが無効化されること', async () => {
    mockGenerateHint.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            hint: 'ヒント',
          });
        }, 100);
      });
    });

    render(<HintButton state={mockState} />);

    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    // ローディング中
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('エラー時にエラーメッセージが表示されること', async () => {
    mockGenerateHint.mockResolvedValue({
      success: false,
      error: 'ヒントを生成できませんでした',
    });

    render(<HintButton state={mockState} />);

    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/ヒントを生成できませんでした/)).toBeInTheDocument();
    });
  });

  it('ペナルティが設定されている場合、ペナルティ情報が表示されること', () => {
    render(<HintButton state={mockState} penaltyMoves={5} />);

    expect(screen.getByText(/ペナルティ|5手/)).toBeInTheDocument();
  });

  it('onHintUsedコールバックが呼ばれること', async () => {
    const handleHintUsed = jest.fn();

    mockGenerateHint.mockResolvedValue({
      success: true,
      hint: 'ヒント',
      tileNumber: 8,
      direction: '右',
    });

    render(<HintButton state={mockState} onHintUsed={handleHintUsed} />);

    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleHintUsed).toHaveBeenCalledWith({
        tileNumber: 8,
        direction: '右',
      });
    });
  });

  it('ヒント表示を閉じることができること', async () => {
    mockGenerateHint.mockResolvedValue({
      success: true,
      hint: 'タイル8を右に移動',
    });

    render(<HintButton state={mockState} />);

    const button = screen.getByRole('button', { name: /ヒント/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/タイル8を右に移動/)).toBeInTheDocument();
    });

    // 閉じるボタンをクリック
    const closeButton = screen.getByRole('button', { name: /閉じる|×/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/タイル8を右に移動/)).not.toBeInTheDocument();
  });

  it('コンパクトモードで表示できること', () => {
    const { container } = render(<HintButton state={mockState} compact={true} />);

    expect(container.querySelector('[class*="compact"]')).toBeTruthy();
  });

  it('カスタムクラス名を適用できること', () => {
    const { container } = render(
      <HintButton state={mockState} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeTruthy();
  });
});
