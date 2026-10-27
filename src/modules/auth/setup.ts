/**
 * Plugs the auth module into the shared HTTP client (called once in main.tsx).
 * shared/ never imports modules, so the dependency points this way.
 */
import { configureAuthBridge } from '@/shared/api/httpClient'
import { toast } from 'sonner'
import { useAuthStore } from './store/authStore'
import { refreshSession } from './services/session'

export function setupAuth() {
  configureAuthBridge({
    getAccessToken: () => useAuthStore.getState().accessToken,
    refreshAccessToken: refreshSession,
    onSessionLost: () => {
      if (useAuthStore.getState().status === 'authenticated') {
        toast.info('You were logged out. Please log in again.')
      }
      useAuthStore.getState().clear()
    },
  })
}
