/**
 * "Enter the 6-digit code" — after signing up, or after logging in to an account
 * that isn't verified yet (the server emails the code in both cases).
 * The right code logs the user straight in. The email arrives in router state;
 * if the page was opened directly, the user types it.
 */
import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router'
import { AlertCircle, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage, toAppError } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AuthCard } from '../components/AuthCard'
import { authApi } from '../services/auth.api'
import { useAuthStore } from '../store/authStore'

const CODE_LENGTH = 6
/** Matches the server: one new code a minute. */
const RESEND_AFTER_SECONDS = 60

export function VerifyEmailPage() {
  useDocumentTitle('Verify email')
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const knownEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(knownEmail)
  const [code, setCode] = useState('')
  const resendIn = useCountdown(knownEmail ? RESEND_AFTER_SECONDS : 0)

  const verify = useMutation({
    mutationFn: (value: string) => authApi.verifyEmail({ email, code: value }),
    onSuccess: (result) => {
      if ('accessToken' in result) {
        setSession(result)
        toast.success('Email verified. Welcome to Dailyvy!')
        navigate('/today', { replace: true })
      } else {
        // Already logged in on the maximum number of devices: log in normally to pick one
        toast.success('Email verified. Please log in.')
        navigate('/login', { replace: true })
      }
    },
    onError: (err) => {
      if (toAppError(err).code === 'ALREADY_VERIFIED') {
        toast.info('This email is already verified. Please log in.')
        navigate('/login', { replace: true })
      }
    },
  })

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(email),
    onSuccess: () => {
      resendIn.restart(RESEND_AFTER_SECONDS)
      verify.reset()
      setCode('')
      toast.success('A new code is on its way.')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const changeCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(digits)
    // Submit as soon as the last digit is in (typed or pasted)
    if (digits.length === CODE_LENGTH && email && !verify.isPending) verify.mutate(digits)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (code.length === CODE_LENGTH && email) verify.mutate(code)
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        knownEmail ? (
          <>
            We sent a 6-digit code to <strong className="text-foreground">{knownEmail}</strong>.
          </>
        ) : (
          'Enter your email and the 6-digit code we sent you.'
        )
      }
      footer={<Link to="/login">Back to log in</Link>}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          {verify.isError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{getErrorMessage(verify.error)}</AlertDescription>
            </Alert>
          )}

          {!knownEmail && (
            <Field>
              <FieldLabel htmlFor="verify-email">Email</FieldLabel>
              <Input
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="verify-code">Verification code</FieldLabel>
            <Input
              id="verify-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) => changeCode(e.target.value)}
              aria-invalid={verify.isError}
              className="h-14 text-center font-mono text-2xl font-semibold tracking-[0.5em] placeholder:text-muted-foreground/30 md:text-2xl"
            />
            <FieldDescription>The code expires in 10 minutes. Check your spam folder if you can't find it.</FieldDescription>
          </Field>

          <Button type="submit" className="w-full" disabled={code.length !== CODE_LENGTH || !email || verify.isPending}>
            {verify.isPending ? <Spinner /> : <MailCheck />}
            Verify and continue
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn't get it?{' '}
            {resendIn.seconds > 0 ? (
              <span className="tabular-nums">Send a new code in {resendIn.seconds}s</span>
            ) : (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                disabled={!email || resend.isPending}
                onClick={() => resend.mutate()}
              >
                Send a new code
              </Button>
            )}
          </p>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

/** Seconds left until `restart(n)` runs out (ticks once a second). */
function useCountdown(initialSeconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + initialSeconds * 1000)
  const [now, setNow] = useState(() => Date.now())
  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000))

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  return {
    seconds,
    restart: (next: number) => {
      setNow(Date.now())
      setEndsAt(Date.now() + next * 1000)
    },
  }
}
