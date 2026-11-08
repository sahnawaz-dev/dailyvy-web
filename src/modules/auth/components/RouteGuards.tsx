/**
 * Route guards (used by app/router.tsx).
 *  - <RequireAuth>: only logged-in users, otherwise → /login (remembers where you were going).
 *                   A temporary password (from the admin) → /choose-password first.
 *  - <GuestOnly>:   only logged-out users (login/register), otherwise → /habits
 */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { PageLoader } from '@/shared/components'
import { useAuthStore } from '../store/authStore'

export const CHOOSE_PASSWORD_PATH = '/choose-password'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  const mustChangePassword = useAuthStore((state) => state.user?.mustChangePassword)
  const location = useLocation()

  if (status === 'checking') return <PageLoader label="Restoring session" />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (mustChangePassword && location.pathname !== CHOOSE_PASSWORD_PATH) {
    return <Navigate to={CHOOSE_PASSWORD_PATH} replace />
  }
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)

  if (status === 'checking') return <PageLoader label="Restoring session" />
  if (status === 'authenticated') return <Navigate to="/today" replace />
  return children
}
