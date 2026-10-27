import type { RouteObject } from 'react-router'
import { ProfileNav } from './components/ProfileNav'

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
