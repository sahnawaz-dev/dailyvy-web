import { Navigate, type RouteObject } from 'react-router'

/**
 * Authenticated routes of the habits module (mounted inside the app layout).
 * The pages (and the grid with its drag-and-drop) are downloaded when Habits is first opened.
 */
export const habitsRoutes: RouteObject[] = [
  {
    path: 'habits',
    lazy: async () => ({ Component: (await import('./pages/HabitsLayout')).HabitsLayout }),
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./pages/HabitsIndexPage')).HabitsIndexPage }),
      },
      { path: ':tabId', element: <Navigate to="weekly" replace /> },
      {
        path: ':tabId/weekly',
        lazy: async () => ({ Component: (await import('./pages/WeeklyViewPage')).WeeklyViewPage }),
      },
      {
        path: ':tabId/monthly',
        lazy: async () => ({ Component: (await import('./pages/MonthlyViewPage')).MonthlyViewPage }),
      },
    ],
  },
]
