/**
 * 画像処理ロジック
 * 画像をパズル用のタイルに分割
 */

import { Position } from './types';

/**
 * 画像タイルのデータ
 */
export interface ImageTileData {
  index: number; // タイル番号
  position: Position; // グリッド上の位置
  imageData: ImageData | null; // 画像データ（空タイルはnull）
}

/**
 * 画像検証の結果
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 画像検証オプション
 */
export interface ValidationOptions {
  minSize?: number;
  maxSize?: number;
}

/**
 * 画像を検証
 * @param img HTMLImageElement
 * @param options 検証オプション
 * @returns 検証結果
 */
export function validateImage(
  img: HTMLImageElement,
  options: ValidationOptions = {}
): ValidationResult {
  const { minSize = 200, maxSize = 2000 } = options;

  // 正方形チェック
  if (img.width !== img.height) {
    return {
      valid: false,
      error: '画像は正方形である必要があります。',
    };
  }

  // 最小サイズチェック
  if (img.width < minSize || img.height < minSize) {
    return {
      valid: false,
      error: `画像サイズは${minSize}px以上である必要があります。`,
    };
  }

  // 最大サイズチェック
  if (img.width > maxSize || img.height > maxSize) {
    return {
      valid: false,
      error: `画像サイズは${maxSize}px以下である必要があります。`,
    };
  }

  return { valid: true };
}

/**
 * 画像をグリッドに分割してタイルデータを生成
 * @param img HTMLImageElement
 * @param gridSize グリッドサイズ（3 = 3x3, 4 = 4x4）
 * @returns 画像タイルデータの配列
 */
export function createImageTiles(
  img: HTMLImageElement,
  gridSize: number
): ImageTileData[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context could not be created');
  }

  const tileSize = Math.floor(img.width / gridSize);
  const tiles: ImageTileData[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const position: Position = { row, col };

      // 最後のタイルは空タイル
      if (index === gridSize * gridSize - 1) {
        tiles.push({
          index,
          position,
          imageData: null,
        });
        continue;
      }

      // Canvasに画像の一部を描画
      canvas.width = tileSize;
      canvas.height = tileSize;

      ctx.clearRect(0, 0, tileSize, tileSize);
      ctx.drawImage(
        img,
        col * tileSize,
        row * tileSize,
        tileSize,
        tileSize,
        0,
        0,
        tileSize,
        tileSize
      );

      // ImageDataを取得
      const imageData = ctx.getImageData(0, 0, tileSize, tileSize);

      tiles.push({
        index,
        position,
        imageData,
      });
    }
  }

  return tiles;
}

/**
 * 画像ファイルをHTMLImageElementとして読み込む
 * @param file File object
 * @returns Promise<HTMLImageElement>
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('画像データの読み込みに失敗しました'));
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };

    reader.readAsDataURL(file);
  });
}
