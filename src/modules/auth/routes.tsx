import { Navigate, type RouteObject } from 'react-router'
import { GuestOnly } from './components/RouteGuards'

/**
 * Public routes of the auth module (mounted at the root by app/router.tsx).
 * Each page is its own chunk, downloaded when it's first opened.
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('./pages/LoginPage')
      return { element: <GuestOnly><LoginPage /></GuestOnly> }
    },
  },
  {
    // Invite-only: people ask for an account instead of signing up
    path: '/request-access',
    lazy: async () => {
      const { RequestAccessPage } = await import('./pages/RequestAccessPage')
      return { element: <GuestOnly><RequestAccessPage /></GuestOnly> }
    },
  },
  { path: '/register', element: <Navigate to="/request-access" replace /> },
  {
    path: '/forgot-password',
    lazy: async () => ({ Component: (await import('./pages/ForgotPasswordPage')).ForgotPasswordPage }),
  },
  {
    path: '/reset-password',
    lazy: async () => ({ Component: (await import('./pages/ResetPasswordPage')).ResetPasswordPage }),
  },
  {
    path: '/verify-email',
    lazy: async () => {
      const { VerifyEmailPage } = await import('./pages/VerifyEmailPage')
      return { element: <GuestOnly><VerifyEmailPage /></GuestOnly> }
    },
  },
]
