/**
 * focus module — focus sessions (15/30/45/60 min), daily focus goal, totals and streak.
 * The page is its own chunk, downloaded when it's first opened.
 */
import type { RouteObject } from 'react-router'

export const focusRoutes: RouteObject[] = [
  { path: 'focus', lazy: async () => ({ Component: (await import('./pages/FocusPage')).FocusPage }) },
]
