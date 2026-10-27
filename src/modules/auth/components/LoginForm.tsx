import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { PasswordInput } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage, toAppError } from '@/shared/api/apiError'
import { authApi } from '../services/auth.api'
import type { DeviceLimitDetails, LoginPayload, SessionResponse } from '../types/auth.types'
import { DeviceLimitDialog } from './DeviceLimitDialog'

interface LoginFormProps {
  onSuccess: (session: SessionResponse) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [deviceLimit, setDeviceLimit] = useState<DeviceLimitDetails | null>(null)

  const login = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess,
    onError: (err) => {
      const appError = toAppError(err)
      if (appError.code === 'DEVICE_LIMIT') {
        setDeviceLimit(appError.details as DeviceLimitDetails)
        return
      }
      setDeviceLimit(null)
      // Right password, email not verified yet: the server emailed a code — go enter it
      if (appError.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email } })
        return
      }
      setError(getErrorMessage(err))
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    login.mutate({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Link to="/forgot-password" className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={!email || !password || login.isPending}>
          {login.isPending && !deviceLimit && <Spinner />}
          Log in
        </Button>
      </FieldGroup>

      <DeviceLimitDialog
        details={deviceLimit}
        pendingSessionId={login.isPending ? (login.variables?.revokeSessionId ?? null) : null}
        onChoose={(sessionId) => login.mutate({ email, password, revokeSessionId: sessionId })}
        onCancel={() => setDeviceLimit(null)}
      />
    </form>
  )
}
