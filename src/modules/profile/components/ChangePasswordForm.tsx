import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { PasswordInput } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { PasswordStrengthMeter, isPasswordValid } from '@/modules/auth'
import { useChangePassword } from '../services/profile.queries'

interface ChangePasswordFormProps {
  /** e.g. "Temporary password (from the email)" */
  currentLabel?: string
  submitLabel?: string
  onChanged?: () => void
}

export function ChangePasswordForm({
  currentLabel = 'Current password',
  submitLabel = 'Change password',
  onChanged,
}: ChangePasswordFormProps = {}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const change = useChangePassword()

  const confirmError = confirm && confirm !== newPassword ? 'Passwords do not match' : undefined
  const canSubmit = currentPassword && isPasswordValid(newPassword) && newPassword === confirm

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirm('')
          onChanged?.()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {change.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(change.error)}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="current-password">{currentLabel}</FieldLabel>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={newPassword} />
        </Field>
        <Field data-invalid={Boolean(confirmError)}>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            aria-invalid={Boolean(confirmError)}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirmError && <FieldError>{confirmError}</FieldError>}
        </Field>
        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={!canSubmit || change.isPending}>
            {change.isPending && <Spinner />}
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
