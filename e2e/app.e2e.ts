import { expect, test } from '@playwright/test'
import { PASSWORD, signUpAndLogIn } from './helpers'

test.describe('around the app', () => {
  test('add a task for today and tick it off', async ({ page }) => {
    await signUpAndLogIn(page)
    await page.getByRole('button', { name: 'Add task' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('What do you want to do?').fill('Call the bank')
    await dialog.getByRole('button', { name: 'Add to my day' }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole('checkbox', { name: 'Call the bank' }).check()
    await expect(page.getByText('1/1 done')).toBeVisible()
  })

  test('Insights, Calendar and the sidebar mini calendar load', async ({ page }) => {
    await signUpAndLogIn(page, { path: '/insights' })
    await expect(page.getByRole('heading', { name: 'Weekly review' })).toBeVisible()
    await expect(page.getByText('Challenge trophies')).toBeVisible()
    await expect(page.getByText('Your shelf is waiting.', { exact: false })).toBeVisible()

    // Mini calendar: today is a button; it opens the Calendar page
    const miniToday = page.locator('[aria-label="This month"] button[class*="ring-primary"]')
    await expect(miniToday).toBeVisible()
    await miniToday.click()
    await expect(page).toHaveURL(/\/calendar\?month=.*&day=/)
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
  })

  test('delete my account: the password and DELETE are required, then it is gone', async ({ page }) => {
    const { email } = await signUpAndLogIn(page, { path: '/profile/security' })
    await page.getByRole('button', { name: 'Delete account' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Leaving us already?')).toBeVisible()

    const remove = dialog.getByRole('button', { name: 'Delete everything forever' })
    await dialog.getByLabel('Your password').fill(PASSWORD)
    await expect(remove).toBeDisabled() // still needs DELETE typed
    await dialog.getByLabel(/to confirm/).fill('DELETE')
    await remove.click()
    await expect(page).toHaveURL(/\/login$/)

    // The account no longer exists
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText('Incorrect email or password')).toBeVisible()
  })
})
