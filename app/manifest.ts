import { MetadataRoute } from 'next';

/**
 * PWA Manifest
 * アプリをインストール可能にするための設定
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'スライドパズル - Slide Puzzle Game',
    short_name: 'スライドパズル',
    description:
      'AI搭載のスライドパズルゲーム。最適解を計算し、プレイスタイルを分析します。オフラインでもプレイ可能。',
    start_url: '/',
    display: 'standalone',
    background_color: '#1f2937',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    categories: ['games', 'puzzle', 'entertainment'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
    ],
  };
}
