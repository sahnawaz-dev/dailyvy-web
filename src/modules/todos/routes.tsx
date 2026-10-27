/**
 * todos module — the "Today" page (home): today's one-off tasks, today's
 * habits and today's focus, on one page. Its own chunk, like every page.
 */
import { Navigate, type RouteObject } from 'react-router'

export const todosRoutes: RouteObject[] = [
  { path: 'today', lazy: async () => ({ Component: (await import('./pages/TodosPage')).TodosPage }) },
  // Old address (the page used to be called "To-Dos")
  { path: 'todos', element: <Navigate to="/today" replace /> },
]
