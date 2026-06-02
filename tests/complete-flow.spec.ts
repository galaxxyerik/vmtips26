import { test, expect, type Page } from '@playwright/test'

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const THIRD_PLACE_GROUPS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])

test.setTimeout(180_000)

async function randomizeGroup(page: Page, group: string) {
  // Click the group tab in the tab bar
  const tabBar = page.locator('.flex.flex-wrap.gap-1.mb-4')
  await tabBar.locator('button').filter({ hasText: group }).click()
  await expect(page.locator('h2', { hasText: `Grupp ${group}` })).toBeVisible()

  // Randomize all picks for this group
  await page.locator('button', { hasText: '↺ Slumpa grupp' }).click()

  // Wait for third-place + scorer section to appear (shows when allPicked)
  await expect(page.locator('text=Trea-laget')).toBeVisible({ timeout: 8_000 })
}

async function handleThirdPlace(page: Page, group: string) {
  const shouldCheck = THIRD_PLACE_GROUPS.has(group)
  const checkbox = page.locator('input[type="checkbox"]').first()
  const isDisabled = await checkbox.isDisabled()
  const isChecked = await checkbox.isChecked()

  if (shouldCheck && !isChecked && !isDisabled) {
    await checkbox.check()
  } else if (!shouldCheck && isChecked) {
    await checkbox.uncheck()
  }
}

async function randomizeScorer(page: Page, group: string) {
  await page.locator('button[title="Slumpa ett namnförslag"]').click()
  // Wait for scorer input to have a non-empty value
  const scorerInput = page.locator(`input[placeholder="Skyttekung grupp ${group}..."]`)
  await expect(scorerInput).not.toHaveValue('', { timeout: 3_000 })
}

async function pickAllBracketRounds(page: Page) {
  // Wait for the bracket to finish building (loading state disappears)
  await expect(page.locator('text=Bygger bracket...')).not.toBeVisible({ timeout: 8_000 })

  // The bracket page renders exactly 6 div.mb-6 containers in round order:
  // 0: Sextondelsfinal, 1: Åttondelsfinaler, 2: Kvartsfinaler,
  // 3: Semifinaler, 4: Bronsmatch, 5: Final
  // Using index-based selection avoids substring collisions ("Final" inside "Sextondelsfinal" etc.)
  const roundSections = page.locator('div.mb-6')
  await expect(roundSections).toHaveCount(6, { timeout: 8_000 })

  for (let roundIdx = 0; roundIdx < 6; roundIdx++) {
    const roundSection = roundSections.nth(roundIdx)

    // Each match row has a div.flex-1.flex.gap-1 containing the two team buttons
    const matchContainers = roundSection.locator('div.flex-1.flex.gap-1')
    const count = await matchContainers.count()

    for (let i = 0; i < count; i++) {
      const container = matchContainers.nth(i)
      const firstEnabled = container.locator('button:not([disabled])').first()
      // Wait for the button to be enabled (downstream buttons unlock after upstream picks)
      await expect(firstEnabled).toBeEnabled({ timeout: 5_000 })
      await firstEnabled.click()
    }
  }
}

test('complete onboarding flow — landing page through final-details', async ({ page }) => {
  const testEmail = `test+${Date.now()}@ee.se`

  // ── 1. Landing page ─────────────────────────────────────────────────
  await page.goto('/')
  await page.fill('[placeholder="Ditt namn"]', 'Playwright Test')
  await page.fill('[placeholder="Din e-post"]', testEmail)
  await page.locator('form').locator('button[type="submit"]').click()

  // ── 2. Group stage ───────────────────────────────────────────────────
  await expect(page).toHaveURL(/group-stage/, { timeout: 10_000 })
  await expect(page.locator('text=Tippa gruppspelet')).toBeVisible()

  // Wait for Supabase to load matches (spinner disappears)
  await expect(page.locator('text=Laddar matcher...')).not.toBeVisible({ timeout: 15_000 })
  await expect(page.locator('button', { hasText: '↺ Slumpa grupp' })).toBeVisible({ timeout: 10_000 })

  // Randomize all 12 groups, handle third-place, randomize scorers
  for (const group of GROUPS) {
    await randomizeGroup(page, group)
    await handleThirdPlace(page, group)
    await randomizeScorer(page, group)
  }

  // Verify "Nästa: Slutspel →" is enabled and navigate
  const nextBracketBtn = page.locator('button', { hasText: 'Nästa: Slutspel →' })
  await expect(nextBracketBtn).toBeEnabled({ timeout: 5_000 })
  await nextBracketBtn.click()

  // ── 3. Bracket ───────────────────────────────────────────────────────
  await expect(page).toHaveURL(/bracket/, { timeout: 10_000 })
  await expect(page.locator('text=Tippa slutspelet')).toBeVisible()

  await pickAllBracketRounds(page)

  // Verify "Nästa: Detaljer →" is enabled and navigate
  const nextDetailsBtn = page.locator('button', { hasText: 'Nästa: Detaljer →' })
  await expect(nextDetailsBtn).toBeEnabled({ timeout: 5_000 })
  await nextDetailsBtn.click()

  // ── 4. Final details ────────────────────────────────────────────────
  await expect(page).toHaveURL(/final-details/, { timeout: 10_000 })

  // Fill tournament scorer
  await page.fill('#tournament-scorer', 'Messi')

  // Fill optional password
  await page.fill('#new-password', 'abc123abc')

  // Check Swish payment confirmation
  const swishCheckbox = page.locator('input[type="checkbox"]').first()
  await swishCheckbox.check()

  // Submit button must be enabled — but do NOT click it (would pollute DB)
  const submitBtn = page.locator('button[type="submit"]')
  await expect(submitBtn).toBeEnabled({ timeout: 3_000 })
  await expect(submitBtn).toHaveText(/Skicka in/)
})
