import { expect, test } from '@playwright/test'
import { API, PASSWORD, TIMEZONE, uniqueEmail, verificationCode } from './helpers'

test.describe('request access, verify, log in', () => {
  test('invite-only: "Create an account" became a request-access form', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Request access' }).click()
    await expect(page).toHaveURL(/\/request-access$/)

    const send = page.getByRole('button', { name: 'Request access' })
    await page.getByLabel('Name').fill('Sam Newcomer')
    await page.getByLabel('Email').fill(uniqueEmail('access'))
    await expect(send).toBeDisabled() // still needs how they know about Dailyvy
    await page.getByLabel('How do you know about Dailyvy?').fill('A friend shared it')
    await send.click()

    await expect(page.getByText('Thanks, Sam Newcomer!')).toBeVisible()
    await expect(page.getByText(/temporary password/)).toBeVisible()

    // The old sign-up address leads here too
    await page.goto('/register')
    await expect(page).toHaveURL(/\/request-access$/)
  })

  test('logging in before verifying leads to the code screen', async ({ page }) => {
    const email = uniqueEmail('unverified')
    const res = await page.request.post(`${API}/auth/signup`, {
      data: { name: 'Later Verifier', email, password: PASSWORD, timezone: TIMEZONE },
    })
    expect(res.status()).toBe(201)

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/verify-email$/)

    await page.getByLabel('Verification code').fill(await verificationCode(page.request, email))
    await expect(page).toHaveURL(/\/today$/)
  })

  test('log out, wrong password, log back in', async ({ page }) => {
    const email = uniqueEmail('relogin')
    await page.request.post(`${API}/auth/signup`, {
      data: { name: 'Back Again', email, password: PASSWORD, timezone: TIMEZONE },
    })
    const code = await verificationCode(page.request, email)
    await page.request.post(`${API}/auth/verify-email`, { data: { email, code } })
    await page.goto('/today')
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill('Wrong-password-1')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText('Incorrect email or password')).toBeVisible()

    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/today$/)
  })
})
