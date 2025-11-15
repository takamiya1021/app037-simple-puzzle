/**
 * ImageUploaderコンポーネントのテスト（簡略版）
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageUploader } from '@/components/ImageUploader';

describe('ImageUploaderコンポーネント', () => {
  it('ファイル選択ボタンが表示されること', () => {
    render(<ImageUploader onImageLoad={() => {}} />);

    const fileInput = screen.getByLabelText(/画像|ファイル|選択|アップロード/i);
    expect(fileInput).toBeInTheDocument();
  });

  it('ドラッグ&ドロップ領域が表示されること', () => {
    const { container } = render(<ImageUploader onImageLoad={() => {}} />);

    const dropzone = container.querySelector('[class*="dropzone"]');
    expect(dropzone).toBeInTheDocument();
  });

  it('初期状態ではアップロード指示が表示されること', () => {
    render(<ImageUploader onImageLoad={() => {}} />);

    expect(screen.getByText(/画像をアップロード/)).toBeInTheDocument();
    expect(screen.getByText(/クリックまたはドラッグ/)).toBeInTheDocument();
  });

  it('正方形の画像要件が表示されること', () => {
    render(<ImageUploader onImageLoad={() => {}} />);

    expect(screen.getByText(/正方形/)).toBeInTheDocument();
    expect(screen.getByText(/200px.*2000px/)).toBeInTheDocument();
  });

  it('カスタムクラス名を適用できること', () => {
    const { container } = render(
      <ImageUploader onImageLoad={() => {}} className="custom-uploader" />
    );

    expect(container.querySelector('.custom-uploader')).toBeInTheDocument();
  });

  it('ファイル入力がimage/*のみ受け付けること', () => {
    render(<ImageUploader onImageLoad={() => {}} />);

    const fileInput = screen.getByLabelText(/画像|ファイル|選択|アップロード/i) as HTMLInputElement;
    expect(fileInput.accept).toBe('image/*');
  });

  it('エラー表示領域が条件付きでレンダリングされること', () => {
    const { container } = render(<ImageUploader onImageLoad={() => {}} />);

    // 初期状態ではエラーは表示されない
    const errorDiv = container.querySelector('.bg-red-50');
    expect(errorDiv).not.toBeInTheDocument();
  });

  it('dropzone要素がクリック可能であること', () => {
    const { container } = render(<ImageUploader onImageLoad={() => {}} />);

    const dropzone = container.querySelector('.dropzone');
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveClass('cursor-pointer');
  });

  it('コンポーネントが正しくマウントされること', () => {
    const { container } = render(<ImageUploader onImageLoad={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('アイコンが表示されること', () => {
    render(<ImageUploader onImageLoad={() => {}} />);

    expect(screen.getByText('📷')).toBeInTheDocument();
  });
});
