import type { RouteObject } from 'react-router'
import { CHOOSE_PASSWORD_PATH, RequireAuth } from '@/modules/auth'
import { ProfileNav } from './components/ProfileNav'

/** Temporary password → choose your own (full page, outside the app layout). */
export const choosePasswordRoute: RouteObject = {
  path: CHOOSE_PASSWORD_PATH,
  lazy: async () => {
    const { ChoosePasswordPage } = await import('./pages/ChoosePasswordPage')
    return {
      element: (
        <RequireAuth>
          <ChoosePasswordPage />
        </RequireAuth>
      ),
    }
  },
}

/** Authenticated routes of the profile module (mounted inside the app layout). Each page is its own chunk. */
export const profileRoutes: RouteObject[] = [
  { path: 'profile', lazy: async () => ({ Component: (await import('./pages/ProfilePage')).ProfilePage }) },
  {
    path: 'profile/security',
    lazy: async () => ({ Component: (await import('./pages/SecurityPage')).SecurityPage }),
  },
  // Reminder settings (reminders module), under the same Account tabs
  {
    path: 'profile/reminders',
    lazy: async () => {
      const { RemindersPage } = await import('@/modules/reminders/pages/RemindersPage')
      return { element: <RemindersPage nav={<ProfileNav />} /> }
    },
  },
]
