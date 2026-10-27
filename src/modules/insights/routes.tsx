/** insights module — the weekly review (its own chunk, downloaded when first opened). */
import type { RouteObject } from 'react-router'

export const insightsRoutes: RouteObject[] = [
  { path: 'insights', lazy: async () => ({ Component: (await import('./pages/InsightsPage')).InsightsPage }) },
]
