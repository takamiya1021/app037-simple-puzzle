'use client';

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントのエラーをキャッチしてフォールバックUIを表示
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログを記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // カスタムエラーハンドラを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = (): void => {
    // ページをリロード
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">
              申し訳ございません。問題が発生しました。
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-red-800 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              ページをリロード
            </button>

            <p className="text-sm text-gray-500 mt-4">
              問題が解決しない場合は、ブラウザのキャッシュをクリアしてください。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
