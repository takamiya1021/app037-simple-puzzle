/**
 * エラーバウンダリコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// エラーをスローするテストコンポーネント
const ThrowError = ({ error }: { error?: Error }) => {
  if (error) {
    throw error;
  }
  return <div>正常なコンポーネント</div>;
};

// コンソールエラーをモック（エラー境界のテスト時にログが出るのを防ぐ）
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundaryコンポーネント', () => {
  it('エラーがない場合は子コンポーネントを表示すること', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('エラーが発生した場合はエラーUIを表示すること', () => {
    const error = new Error('テストエラー');

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText(/問題が発生/i)).toBeInTheDocument();
  });

  it('リロードボタンが表示されること', () => {
    const error = new Error('テストエラー');

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /リロード|Reload|再読み込み/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it('エラーメッセージが表示されること', () => {
    const error = new Error('カスタムエラーメッセージ');

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/カスタムエラーメッセージ/)).toBeInTheDocument();
  });

  it('カスタムフォールバックUIを使用できること', () => {
    const error = new Error('テストエラー');
    const customFallback = <div>カスタムエラー表示</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(screen.getByText('カスタムエラー表示')).toBeInTheDocument();
  });

  it('onError コールバックが呼ばれること', () => {
    const error = new Error('テストエラー');
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('複数の子コンポーネントを持てること', () => {
    render(
      <ErrorBoundary>
        <div>子1</div>
        <div>子2</div>
        <div>子3</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('子1')).toBeInTheDocument();
    expect(screen.getByText('子2')).toBeInTheDocument();
    expect(screen.getByText('子3')).toBeInTheDocument();
  });

  it('ネストしたErrorBoundaryが独立して動作すること', () => {
    const error = new Error('内部エラー');

    render(
      <ErrorBoundary>
        <div>外側の正常なコンテンツ</div>
        <ErrorBoundary>
          <ThrowError error={error} />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // 外側は正常
    expect(screen.getByText('外側の正常なコンテンツ')).toBeInTheDocument();
    // 内側はエラーUI
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('内部エラー')).toBeInTheDocument();
  });
});
