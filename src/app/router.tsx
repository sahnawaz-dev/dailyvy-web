/**
 * All routes. Each module exports its own route list; adding a module =
 * one import + one spread below (and a nav entry in navigation.ts).
 *
 * Pages are code-split (each module's routes use `lazy`): the first load only
 * downloads the app shell + the page being opened; other pages download on
 * first visit. A spinner shows while the very first page's code arrives.
 */
import { createBrowserRouter, Navigate } from 'react-router'
import { authRoutes, RequireAuth } from '@/modules/auth'
import { calendarRoutes } from '@/modules/calendar'
import { focusRoutes } from '@/modules/focus'
import { habitsRoutes } from '@/modules/habits'
import { insightsRoutes } from '@/modules/insights'
import { choosePasswordRoute, profileRoutes } from '@/modules/profile'
import { todosRoutes } from '@/modules/todos'
import { PageLoader } from '@/shared/components'
import { NotFoundPage } from './components/NotFoundPage'
import { RouteErrorPage } from './components/RouteErrorPage'
import { AppLayout } from './layouts/AppLayout'

export const router = createBrowserRouter([
  // Public (login, register, password reset, email verification)
  ...authRoutes.map((route) => ({ ...route, hydrateFallbackElement: <PageLoader /> })),

  // Temporary password from the admin → choose your own first
  { ...choosePasswordRoute, hydrateFallbackElement: <PageLoader /> },

  // Authenticated app
  {
    path: '/',
    // A crash on any page shows a friendly error page instead of a blank screen
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      ...habitsRoutes,
      ...calendarRoutes,
      ...profileRoutes,
      ...todosRoutes,
      ...focusRoutes,
      ...insightsRoutes,
    ],
  },

  { path: '*', element: <NotFoundPage /> },
], {
  // GitHub Pages serves the site from /dailyvy-web/ (VITE_BASE)
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})
