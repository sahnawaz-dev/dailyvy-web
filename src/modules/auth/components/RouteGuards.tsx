/**
 * Route guards (used by app/router.tsx).
 *  - <RequireAuth>: only logged-in users, otherwise → /login (remembers where you were going)
 *  - <GuestOnly>:   only logged-out users (login/register), otherwise → /habits
 */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { PageLoader } from '@/shared/components'
import { useAuthStore } from '../store/authStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status === 'checking') return <PageLoader label="Restoring session" />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)

  if (status === 'checking') return <PageLoader label="Restoring session" />
  if (status === 'authenticated') return <Navigate to="/today" replace />
  return children
}
