/**
 * 画像処理ロジックのテスト
 */

import {
  ImageTileData,
  createImageTiles,
  validateImage,
} from '@/lib/puzzle/imageProcessor';

// Canvas APIのモック
const createMockCanvas = () => {
  const canvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => ({
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      getImageData: jest.fn((x: number, y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      })),
    })),
  };
  return canvas as any;
};

// HTMLImageElement のモック
const createMockImage = (width: number, height: number) => {
  return {
    width,
    height,
    src: '',
    onload: null,
    onerror: null,
  } as any;
};

describe('Image Processor', () => {
  beforeEach(() => {
    // Canvas API をモック
    global.document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return createMockCanvas();
      }
      return {} as any;
    });
  });

  describe('validateImage', () => {
    it('正方形の画像を受け入れること', () => {
      const img = createMockImage(300, 300);
      const result = validateImage(img);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('正方形でない画像を拒否すること', () => {
      const img = createMockImage(400, 300);
      const result = validateImage(img);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('正方形');
    });

    it('最小サイズ未満の画像を拒否すること', () => {
      const img = createMockImage(100, 100);
      const result = validateImage(img, { minSize: 200 });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('200');
    });

    it('最大サイズ超過の画像を拒否すること', () => {
      const img = createMockImage(3000, 3000);
      const result = validateImage(img, { maxSize: 2000 });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('2000');
    });

    it('適切なサイズの画像を受け入れること', () => {
      const img = createMockImage(600, 600);
      const result = validateImage(img, { minSize: 200, maxSize: 1000 });

      expect(result.valid).toBe(true);
    });
  });

  describe('createImageTiles', () => {
    it('3x3のタイルデータを生成すること', () => {
      const img = createMockImage(300, 300);
      const tiles = createImageTiles(img, 3);

      expect(tiles).toHaveLength(9);
      expect(tiles[0]).toHaveProperty('index');
      expect(tiles[0]).toHaveProperty('position');
      expect(tiles[0]).toHaveProperty('imageData');
    });

    it('4x4のタイルデータを生成すること', () => {
      const img = createMockImage(400, 400);
      const tiles = createImageTiles(img, 4);

      expect(tiles).toHaveLength(16);
    });

    it('各タイルに正しい位置情報が含まれること', () => {
      const img = createMockImage(300, 300);
      const tiles = createImageTiles(img, 3);

      // 最初のタイル (0,0)
      expect(tiles[0].position).toEqual({ row: 0, col: 0 });
      expect(tiles[0].index).toBe(0);

      // 真ん中のタイル (1,1)
      expect(tiles[4].position).toEqual({ row: 1, col: 1 });
      expect(tiles[4].index).toBe(4);

      // 最後のタイル (2,2)
      expect(tiles[8].position).toEqual({ row: 2, col: 2 });
      expect(tiles[8].index).toBe(8);
    });

    it('空のタイル（最後）にはimageDataがnullであること', () => {
      const img = createMockImage(300, 300);
      const tiles = createImageTiles(img, 3);

      // 最後のタイルは空
      expect(tiles[8].imageData).toBeNull();
    });

    it('空でないタイルにはimageDataが含まれること', () => {
      const img = createMockImage(300, 300);
      const tiles = createImageTiles(img, 3);

      // 最初のタイル（空でない）
      expect(tiles[0].imageData).not.toBeNull();
      expect(tiles[0].imageData).toHaveProperty('data');
    });

    it('タイルサイズが正しく計算されること', () => {
      const img = createMockImage(300, 300);
      const tiles = createImageTiles(img, 3);

      // 各タイルは 100x100 になるはず
      tiles.forEach((tile) => {
        if (tile.imageData) {
          expect(tile.imageData.width).toBe(100);
          expect(tile.imageData.height).toBe(100);
        }
      });
    });

    it('異なるサイズでも正しく分割されること', () => {
      const img = createMockImage(400, 400);
      const tiles = createImageTiles(img, 4);

      // 各タイルは 100x100 になるはず
      tiles.forEach((tile) => {
        if (tile.imageData) {
          expect(tile.imageData.width).toBe(100);
          expect(tile.imageData.height).toBe(100);
        }
      });
    });
  });

  describe('ImageTileData型', () => {
    it('必要なプロパティを持つこと', () => {
      const tile: ImageTileData = {
        index: 0,
        position: { row: 0, col: 0 },
        imageData: null,
      };

      expect(tile.index).toBeDefined();
      expect(tile.position).toBeDefined();
      expect(tile.imageData).toBeDefined();
    });
  });
});
