import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AuthCard } from '../components/AuthCard'
import { authApi } from '../services/auth.api'

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot password')
  const [email, setEmail] = useState('')
  const request = useMutation({ mutationFn: authApi.forgotPassword })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    request.mutate(email)
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to choose a new password."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {request.isSuccess ? (
        <Alert>
          <CheckCircle2 className="text-success" />
          <AlertDescription>
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {request.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(request.error)}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={!email || request.isPending}>
              {request.isPending && <Spinner />}
              Send reset link
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  )
}
