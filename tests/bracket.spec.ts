import { test, expect } from '@playwright/test'
import { TEST_DRAFT } from './fixtures/draft'

const STORAGE_KEY = 'vmtips26_draft'

test.beforeEach(async ({ page }) => {
  // Inject the test draft into localStorage before the page loads
  await page.addInitScript(({ key, draft }) => {
    localStorage.setItem(key, JSON.stringify(draft))
  }, { key: STORAGE_KEY, draft: TEST_DRAFT })
})

test('bracket buttons are clickable — R32', async ({ page }) => {
  await page.goto('/onboarding/bracket')

  // Wait for the bracket to render (not the loading state)
  await expect(page.locator('text=Tippa slutspelet')).toBeVisible()

  // R32: pick the first R32 match — click one of the teams
  const r32Section = page.locator('text=Sextondelsfinal').locator('..')
  const firstButton = r32Section.locator('button').first()
  await firstButton.click()

  // After clicking, the button should get the "undo" title (= it was registered as selected)
  await expect(firstButton).toHaveAttribute('title', 'Klicka för att avmarkera')
})

test('bracket R16 buttons are clickable when all R32 are picked', async ({ page }) => {
  await page.goto('/onboarding/bracket')
  await expect(page.locator('text=Tippa slutspelet')).toBeVisible()

  // R16 teams come from our pre-filled bracketPicks[73-88].
  // 'Brasilien' is picks[73] → team1 of M89
  const brasilien = page.locator('button', { hasText: 'Brasilien' }).first()
  await brasilien.click()

  // Verify the click registered (not blocked by FloatingReturnToTips or anything else)
  await expect(brasilien).toHaveAttribute('title', 'Klicka för att avmarkera')
})

test('FloatingReturnToTips is hidden on the bracket page', async ({ page }) => {
  await page.goto('/onboarding/bracket')
  await expect(page.locator('text=Tippa slutspelet')).toBeVisible()

  // "Fortsätt tippa!" button must NOT be visible on any /onboarding page
  await expect(page.locator('text=Fortsätt tippa!')).not.toBeVisible()
})

test('"Nästa"-knappen är inaktiv tills alla matcher är tippade', async ({ page }) => {
  await page.goto('/onboarding/bracket')
  await expect(page.locator('text=Tippa slutspelet')).toBeVisible()

  // With only R32 picks pre-filled, the "next" button should be disabled
  // because R16–Final are not yet picked
  const nextBtn = page.locator('button', { hasText: 'Nästa: Detaljer' })
  await expect(nextBtn).toBeDisabled()
})
