import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../types/auth.types'
import { CHOOSE_PASSWORD_PATH, RequireAuth } from './RouteGuards'

const user: AuthUser = {
  id: 'u1',
  email: 'sam@example.com',
  name: 'Sam',
  bio: '',
  avatarUrl: null,
  emailVerified: true,
  timezone: 'UTC',
  registeredAt: '2026-11-01T00:00:00.000Z',
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>login page</p> },
      { path: CHOOSE_PASSWORD_PATH, element: <RequireAuth><p>choose password page</p></RequireAuth> },
      { path: '/today', element: <RequireAuth><p>today page</p></RequireAuth> },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
}

describe('RequireAuth', () => {
  afterEach(() => useAuthStore.getState().clear())

  it('a temporary password sends every page to "choose your password" first', () => {
    useAuthStore.getState().setSession({ accessToken: 't', sessionId: 's', user: { ...user, mustChangePassword: true } })
    renderAt('/today')
    expect(screen.getByText('choose password page')).toBeInTheDocument()
  })

  it('once the password is changed, pages open normally', () => {
    useAuthStore.getState().setSession({ accessToken: 't', sessionId: 's', user })
    renderAt('/today')
    expect(screen.getByText('today page')).toBeInTheDocument()
  })

  it('logged out → login', () => {
    useAuthStore.getState().clear()
    renderAt('/today')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
