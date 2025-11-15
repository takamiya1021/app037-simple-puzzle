'use client';

/**
 * 画像アップローダーコンポーネント
 * 画像ファイルの選択、検証、プレビュー機能を提供
 */

import React, { useState, useCallback, useRef } from 'react';
import { validateImage, loadImageFromFile } from '@/lib/puzzle/imageProcessor';

interface ImageUploaderProps {
  onImageLoad: (image: HTMLImageElement) => void;
  className?: string;
}

export function ImageUploader({ onImageLoad, className = '' }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // ファイルタイプチェック
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。');
        setPreview(null);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        // 画像を読み込む
        const img = await loadImageFromFile(file);

        // 画像を検証
        const validation = validateImage(img);

        if (!validation.valid) {
          setError(validation.error || '画像の検証に失敗しました。');
          setPreview(null);
          setLoading(false);
          return;
        }

        // プレビュー表示
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            setPreview(e.target.result);
          }
        };
        reader.readAsDataURL(file);

        // コールバックを呼ぶ
        onImageLoad(img);
        setLoading(false);
      } catch (err) {
        setError('画像の読み込みに失敗しました。');
        setPreview(null);
        setLoading(false);
      }
    },
    [onImageLoad]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          dropzone
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${!loading ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
          aria-label="画像ファイルを選択"
        />

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
            <p className="text-gray-600">画像を読み込み中...</p>
          </div>
        ) : preview ? (
          <div className="text-center">
            <img
              src={preview}
              alt="画像プレビュー"
              className="max-w-full max-h-64 mx-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">
              別の画像を選択する場合はクリックしてください
            </p>
          </div>
        ) : (
          <label htmlFor="image-upload-input" className="block cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                画像をアップロード
              </p>
              <p className="text-sm text-gray-500">
                クリックまたはドラッグ&ドロップで画像を選択
              </p>
              <p className="text-xs text-gray-400 mt-2">
                正方形の画像（200px〜2000px）を選択してください
              </p>
            </div>
          </label>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-semibold flex items-center">
            <span className="mr-2">⚠️</span>
            エラー: {error}
          </p>
        </div>
      )}
    </div>
  );
}
