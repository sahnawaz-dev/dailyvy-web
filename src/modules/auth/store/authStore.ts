/**
 * Who is logged in. The access token lives only in memory (never localStorage);
 * on page load it's recovered from the httpOnly refresh cookie (see session.ts).
 */
import { create } from 'zustand'
import type { AuthStatus, AuthUser, SessionResponse } from '../types/auth.types'

interface AuthState {
  status: AuthStatus
  accessToken: string | null
  sessionId: string | null
  user: AuthUser | null
  setSession: (session: SessionResponse) => void
  setUser: (user: AuthUser) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  accessToken: null,
  sessionId: null,
  user: null,
  setSession: ({ accessToken, user, sessionId }) =>
    set({ status: 'authenticated', accessToken, user, sessionId }),
  setUser: (user) => set({ user }),
  clear: () => set({ status: 'anonymous', accessToken: null, sessionId: null, user: null }),
}))

/** The logged-in user. Only use inside authenticated pages. */
export function useCurrentUser(): AuthUser {
  const user = useAuthStore((state) => state.user)
  if (!user) throw new Error('useCurrentUser() used outside an authenticated route')
  return user
}
