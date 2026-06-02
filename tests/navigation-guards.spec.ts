import { test, expect } from '@playwright/test'

// These tests rely on a clean localStorage (default in a fresh browser context).

test('bracket page redirects to group-stage when draft is incomplete', async ({ page }) => {
  // With no localStorage draft, thirdPlaceSelected.length = 0 ≠ 8 → redirect
  await page.goto('/onboarding/bracket')
  await expect(page).toHaveURL(/group-stage/, { timeout: 5_000 })
})

test('final-details page redirects away when no complete draft exists', async ({ page }) => {
  // final-details → bracket (no bracketPicks) → group-stage (no thirdPlaceSelected)
  await page.goto('/onboarding/final-details')
  await expect(page).toHaveURL(/group-stage/, { timeout: 5_000 })
})
