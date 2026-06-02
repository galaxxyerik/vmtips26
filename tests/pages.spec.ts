import { test, expect } from '@playwright/test'

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=TIPPA HELA VM')).toBeVisible()
})

test('regler page renders', async ({ page }) => {
  await page.goto('/regler')
  await expect(page.locator('h1', { hasText: 'Regler' })).toBeVisible()
})

test('worldcup-guide page renders', async ({ page }) => {
  await page.goto('/worldcup-guide')
  await expect(page.locator('text=GUIDEN')).toBeVisible()
})

test('dashboard page loads without error', async ({ page }) => {
  const response = await page.goto('/dashboard')
  expect(response?.status()).not.toBe(500)
  await expect(page).not.toHaveURL(/\/error/)
})
