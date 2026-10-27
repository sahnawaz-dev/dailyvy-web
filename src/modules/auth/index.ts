/**
 * auth module — public API. Other modules and app/ import ONLY from here.
 */
export { authRoutes } from './routes'
export { setupAuth } from './setup'
export { RequireAuth } from './components/RouteGuards'
export { PasswordStrengthMeter } from './components/PasswordStrengthMeter'
export { useAuthStore, useCurrentUser } from './store/authStore'
export { authApi } from './services/auth.api'
export { logout, restoreSession } from './services/session'
export { isPasswordValid } from './utils/password'
export type { AuthUser, Device } from './types/auth.types'
