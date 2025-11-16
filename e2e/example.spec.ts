import { test, expect } from '@playwright/test';

/**
 * サンプルE2Eテスト
 * E2Eテスト環境が正しく動作することを確認する
 */

test.describe('トップページ', () => {
  test('ページが正常に表示されること', async ({ page }) => {
    await page.goto('/');

    // ページタイトルが表示されることを確認
    await expect(page).toHaveTitle(/Next.js/);
  });

  test('ページに基本的なコンテンツが表示されること', async ({ page }) => {
    await page.goto('/');

    // ページが読み込まれることを確認
    await expect(page.locator('body')).toBeVisible();
  });
});
