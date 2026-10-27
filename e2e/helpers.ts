/** Shared helpers for the end-to-end tests. */
import { expect, type APIRequestContext, type Page } from '@playwright/test'

export const API = 'http://localhost:4100/api/v1'
export const PASSWORD = 'Habits2026!'
/** The browser and the test user share the machine's timezone, so "today" matches. */
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

let counter = 0
/** A fresh email per test (tests run in parallel against one database). */
export const uniqueEmail = (prefix = 'user') =>
  `${prefix}.${Date.now()}.${process.pid}.${(counter += 1)}@e2e.dailyvy.test`

/** The 6-digit code in the newest verification email to `email` (waits for it). */
export async function verificationCode(request: APIRequestContext, email: string): Promise<string> {
  let code: string | undefined
  await expect
    .poll(async () => {
      const res = await request.get(`http://localhost:4100/__e2e/emails?to=${encodeURIComponent(email)}`)
      const emails = (await res.json()) as { subject: string; text: string }[]
      const last = emails.filter((e) => /verification code/.test(e.subject)).at(-1)
      code = last?.text.match(/code is: (\d{6})/)?.[1]
      return code
    }, { message: `a verification email to ${email}` })
    .toBeTruthy()
  return code!
}

/**
 * Creates a verified account through the API and logs this browser in (the
 * refresh cookie lands in the page's cookie jar), then opens `path`.
 */
export async function signUpAndLogIn(page: Page, { name = 'Alex Tester', path = '/today' } = {}) {
  const email = uniqueEmail()
  const signup = await page.request.post(`${API}/auth/signup`, {
    data: { name, email, password: PASSWORD, timezone: TIMEZONE },
  })
  expect(signup.status(), await signup.text()).toBe(201)
  const code = await verificationCode(page.request, email)
  const verified = await page.request.post(`${API}/auth/verify-email`, { data: { email, code } })
  expect(verified.status(), await verified.text()).toBe(200)

  await page.goto(path)
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
  return { email, name }
}

/** Closes the "🎉 all done" overlay if it popped up (it also hides itself after a few seconds). */
export async function dismissCelebration(page: Page) {
  const overlay = page.getByRole('status').filter({ hasText: /🎉|🏆/ })
  if (await overlay.isVisible().catch(() => false)) await page.keyboard.press('Escape')
}
