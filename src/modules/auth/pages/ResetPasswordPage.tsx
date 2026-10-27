import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { PasswordInput } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AuthCard } from '../components/AuthCard'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { authApi } from '../services/auth.api'
import { isPasswordValid } from '../utils/password'

export function ResetPasswordPage() {
  useDocumentTitle('Choose a new password')
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const reset = useMutation({ mutationFn: () => authApi.resetPassword(token, password) })

  const confirmError = confirm && confirm !== password ? 'Passwords do not match' : undefined
  const canSubmit = token && isPasswordValid(password) && password === confirm

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (canSubmit) reset.mutate()
  }

  return (
    <AuthCard title="Choose a new password" footer={<Link to="/login">Back to log in</Link>}>
      {!token && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>This reset link is missing its token.</AlertDescription>
        </Alert>
      )}

      {reset.isSuccess ? (
        <Alert>
          <CheckCircle2 className="text-success" />
          <AlertDescription>
            Password updated. All devices were logged out — <Link to="/login">log in</Link> with your new
            password.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {reset.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(reset.error)}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="reset-password">New password</FieldLabel>
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={password} />
            </Field>
            <Field data-invalid={Boolean(confirmError)}>
              <FieldLabel htmlFor="reset-confirm">Confirm new password</FieldLabel>
              <PasswordInput
                id="reset-confirm"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmError)}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirmError && <FieldError>{confirmError}</FieldError>}
            </Field>
            <Button type="submit" className="w-full" disabled={!canSubmit || reset.isPending}>
              {reset.isPending && <Spinner />}
              Update password
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  )
}
