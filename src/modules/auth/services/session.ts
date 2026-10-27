/**
 * Session lifecycle: restore on page load, refresh access token, log out.
 *
 * Refresh is "single-flight": concurrent callers (several 401s at once,
 * React StrictMode double effects...) share ONE request. The server rotates the
 * refresh cookie on every call, so parallel refreshes would otherwise collide.
 */
import { disablePush } from '@/shared/lib/webPush'
import { toAppError } from '@/shared/api/apiError'
import { authApi } from './auth.api'
import { useAuthStore } from '../store/authStore'

let inFlight: Promise<string | null> | null = null

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function doRefresh(): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const session = await authApi.refresh()
      useAuthStore.getState().setSession(session)
      return session.accessToken
    } catch (error) {
      // Another browser tab refreshed at the same moment; its new cookie is
      // already stored, so simply try again.
      if (toAppError(error).code === 'REFRESH_RACE' && attempt === 0) {
        await wait(300)
        continue
      }
      useAuthStore.getState().clear()
      return null
    }
  }
  return null
}

/** Returns a fresh access token, or null (and marks the user anonymous). */
export function refreshSession(): Promise<string | null> {
  inFlight ??= doRefresh().finally(() => {
    inFlight = null
  })
  return inFlight
}

/** Called once on app start to restore the session from the refresh cookie. */
export async function restoreSession(): Promise<void> {
  if (useAuthStore.getState().status !== 'checking') return
  await refreshSession()
}

export async function logout(): Promise<void> {
  try {
    // Stop reminder notifications on this browser (while we still have a token)
    await disablePush()
    await authApi.logout()
  } finally {
    useAuthStore.getState().clear()
  }
}
