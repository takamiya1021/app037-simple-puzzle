import { test, expect } from '@playwright/test'

test('should render main UI components', async ({ page }) => {
    await page.goto('/')

    // Check for Title
    await expect(page.getByRole('heading', { name: 'Simple Puzzle' })).toBeVisible()

    // Check for StatusHUD
    await expect(page.getByText('Time')).toBeVisible()
    await expect(page.getByText('Moves')).toBeVisible()
    await expect(page.getByText('Size')).toBeVisible()

    // Check for ModeChips
    await expect(page.getByRole('button', { name: 'フリープレイ' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'タイムアタック' })).toBeVisible()
    await expect(page.getByRole('button', { name: '手数チャレンジ' })).toBeVisible()

    // Check for CustomSizeSlider
    await expect(page.getByRole('slider')).toBeVisible()
    await expect(page.getByText('Grid Size')).toBeVisible()
})
