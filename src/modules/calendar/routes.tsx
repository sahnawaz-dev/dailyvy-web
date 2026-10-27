import type { RouteObject } from 'react-router'

/** Authenticated routes of the calendar module (mounted inside the app layout). The page is its own chunk. */
export const calendarRoutes: RouteObject[] = [
  {
    path: 'calendar',
    lazy: async () => ({ Component: (await import('./pages/CalendarPage')).CalendarPage }),
  },
]
