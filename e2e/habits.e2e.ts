import { expect, test, type Page } from '@playwright/test'
import { dismissCelebration, signUpAndLogIn } from './helpers'

/** Creates a habit from the Habits page ("New habit" or the empty-tab button). */
async function createHabit(page: Page, name: string, { timesPerWeek }: { timesPerWeek?: number } = {}) {
  const newHabit = page.getByRole('button', { name: /^(New habit|Start your first habit)$/ }).first()
  await newHabit.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Start a new habit')).toBeVisible()
  await dialog.getByLabel('Name').fill(name)
  if (timesPerWeek) {
    await dialog.getByRole('radio', { name: 'Times per week' }).click()
    await dialog.getByRole('radio', { name: `${timesPerWeek} times a week` }).click()
  }
  await dialog.getByRole('button', { name: /Start this habit/ }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('row', { name: new RegExp(name, 'i') })).toBeVisible()
}

test.describe('habits', () => {
  test('create a habit, check it off today, see it on the Today page', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/habits' })
    await createHabit(page, 'Morning run')

    await page.getByRole('checkbox', { name: /Morning run, .*: not done yet today/ }).click()
    await expect(page.getByRole('checkbox', { name: /Morning run, .*: done today/ })).toBeChecked()
    await dismissCelebration(page)

    await page.getByRole('link', { name: 'Today' }).first().click()
    await expect(page.getByRole('checkbox', { name: /Morning run: done today/ })).toBeChecked()
  })

  test('a note on today’s habit shows on Today and in the calendar', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/habits' })
    await createHabit(page, 'Read 10 min')

    await page.goto('/today')
    await page.getByRole('button', { name: 'Add a note to Read 10 min' }).click()
    await page.getByLabel('Note for Read 10 min').fill('Finished chapter 3')
    await page.getByRole('button', { name: 'Save note' }).click()
    await expect(page.getByText('Finished chapter 3')).toBeVisible()

    // Reload: it was saved on the server
    await page.reload()
    await expect(page.getByText('Finished chapter 3')).toBeVisible()

    // The calendar's day details show it too
    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
    await page.goto(`/calendar?day=${today}`)
    await expect(page.getByText('Finished chapter 3')).toBeVisible()
  })

  test('archive pauses a habit, restore brings it back', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/habits' })
    await createHabit(page, 'Meditate')

    const row = page.getByRole('row', { name: /meditate/i })
    await row.hover()
    await page.getByRole('button', { name: 'Archive Meditate' }).click()
    await expect(page.getByText('"Meditate" archived')).toBeVisible()
    await expect(page.getByRole('row', { name: /meditate/i })).toBeHidden()

    await page.getByRole('button', { name: /Archived \(1\)/ }).click()
    const archive = page.getByRole('dialog', { name: 'Archived habits' })
    await archive.getByRole('button', { name: 'Restore' }).click()
    await expect(page.getByText('"Meditate" is back')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('row', { name: /meditate/i })).toBeVisible()
  })

  test('the delete dialog nudges to keep the habit; deleting still works', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/habits' })
    await createHabit(page, 'Stretch')

    await page.getByRole('row', { name: /stretch/i }).hover()
    await page.getByRole('button', { name: 'Delete Stretch' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog.getByText('Let go of “Stretch”?')).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Keep my habit/ })).toBeFocused()
    await dialog.getByRole('button', { name: /Keep my habit/ }).click()
    await expect(page.getByRole('row', { name: /stretch/i })).toBeVisible()

    await page.getByRole('row', { name: /stretch/i }).hover()
    await page.getByRole('button', { name: 'Delete Stretch' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete it anyway' }).click()
    await expect(page.getByRole('row', { name: /stretch/i })).toBeHidden()
  })

  test('a times-per-week habit shows its weekly counter and no Skip', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/habits' })
    await createHabit(page, 'Gym', { timesPerWeek: 3 })
    await expect(page.getByLabel('0 of 3 this week')).toBeVisible()
    await page.getByRole('checkbox', { name: /Gym, .*: not done yet today/ }).click()
    await expect(page.getByLabel('1 of 3 this week')).toBeVisible()
    await dismissCelebration(page)
    await page.getByRole('row', { name: /gym/i }).hover()
    await expect(page.getByRole('button', { name: 'Skip Gym today' })).toHaveCount(0)
  })
})
