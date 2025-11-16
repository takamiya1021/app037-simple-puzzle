/**
 * PWA Manifest テスト
 */

import { describe, it, expect } from '@jest/globals';

describe('PWA Manifest', () => {
  it('manifest関数がエクスポートされていること', async () => {
    const manifestModule = await import('@/app/manifest');
    expect(manifestModule.default).toBeDefined();
  });

  it('manifest関数がMetadataRoute.Manifestを返すこと', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('description');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('background_color');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('icons');
  });

  it('アプリ名が正しく設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.name).toBe('スライドパズル - Slide Puzzle Game');
    expect(manifest.short_name).toBe('スライドパズル');
  });

  it('説明が設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.description).toBeDefined();
    expect(manifest.description.length).toBeGreaterThan(10);
  });

  it('start_urlが設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.start_url).toBe('/');
  });

  it('displayモードがstandaloneであること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.display).toBe('standalone');
  });

  it('テーマカラーが設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.theme_color).toBeDefined();
    expect(manifest.background_color).toBeDefined();
    expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('アイコンが複数サイズで設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    // 必須サイズのアイコンが含まれているか
    const sizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('各アイコンが必要なプロパティを持っていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    manifest.icons.forEach((icon: any) => {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');
      expect(icon.type).toBe('image/png');
    });
  });

  it('orientationが設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.orientation).toBeDefined();
    expect(['any', 'portrait', 'landscape']).toContain(manifest.orientation);
  });

  it('categoriesが設定されていること', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(Array.isArray(manifest.categories)).toBe(true);
    expect(manifest.categories).toContain('games');
  });
});
