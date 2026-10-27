import { expect, test } from '@playwright/test'
import { signUpAndLogIn } from './helpers'

test.describe('challenges', () => {
  test('take a challenge (rules first), tick today, undo', async ({ page }) => {
    await signUpAndLogIn(page)
    await page.getByRole('button', { name: 'Start a challenge' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /No sugar/ }).click() // one-click idea
    await dialog.getByRole('radio', { name: '45 days' }).click()
    await expect(dialog.getByText(/every single day for 45 days/)).toBeVisible()

    const start = dialog.getByRole('button', { name: /I'm in/ })
    await expect(start).toBeDisabled() // rules not accepted yet
    await dialog.getByLabel(/I'm committed/).check()
    await start.click()

    await expect(page.getByText('Day 1 of 45 · 45 days left')).toBeVisible()
    await page.getByRole('button', { name: 'Done today' }).click()
    await expect(page.getByText('Day 1 of 45 · 44 days left')).toBeVisible()
    await page.getByRole('button', { name: /Done for today/ }).click() // undo
    await expect(page.getByText('Day 1 of 45 · 45 days left')).toBeVisible()
  })

  test('giving up: "keep going" is the default; quitting moves it to past challenges', async ({ page }) => {
    await signUpAndLogIn(page)
    await page.getByRole('button', { name: 'Start a challenge' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Every day I will…').fill('Wake up at 6')
    await dialog.getByLabel(/I'm committed/).check()
    await dialog.getByRole('button', { name: /I'm in/ }).click()

    await page.getByRole('button', { name: 'Give up' }).click()
    const giveUp = page.getByRole('alertdialog')
    await expect(giveUp.getByText("Don't break your promise now")).toBeVisible()
    await expect(giveUp.getByRole('button', { name: /Keep going/ })).toBeFocused()
    await giveUp.getByRole('button', { name: /Keep going/ }).click()
    await expect(giveUp).toBeHidden()
    await expect(page.getByText('Wake up at 6', { exact: true })).toBeVisible() // still running

    await page.getByRole('button', { name: 'Give up' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'I give up on myself' }).click()
    await expect(page.getByRole('button', { name: 'Start a challenge' })).toBeVisible()

    await page.getByRole('button', { name: 'Past challenges' }).click()
    await expect(page.getByRole('dialog').getByText('Wake up at 6')).toBeVisible()
    await expect(page.getByRole('dialog').getByText(/Given up/)).toBeVisible()
  })
})
