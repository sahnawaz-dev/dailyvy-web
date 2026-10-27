import { Link, useLocation, useNavigate } from 'react-router'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AuthCard } from '../components/AuthCard'
import { LoginForm } from '../components/LoginForm'
import { useAuthStore } from '../store/authStore'
import type { SessionResponse } from '../types/auth.types'

export function LoginPage() {
  useDocumentTitle('Log in')
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/today'

  const handleSuccess = (session: SessionResponse) => {
    setSession(session)
    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to check off today's habits."
      footer={
        <>
          New here? <Link to="/request-access">Request access</Link>
        </>
      }
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthCard>
  )
}
