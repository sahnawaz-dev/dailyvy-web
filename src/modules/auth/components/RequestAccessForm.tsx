import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { Textarea } from '@/shared/components/ui/textarea'
import { getErrorMessage } from '@/shared/api/apiError'
import { authApi } from '../services/auth.api'

const SOURCE_MAX = 300

interface RequestAccessFormProps {
  /** The request was sent; the admin will email `name` once it's approved. */
  onSuccess: (name: string) => void
}

export function RequestAccessForm({ onSuccess }: RequestAccessFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('')

  const send = useMutation({
    mutationFn: () => authApi.requestAccess({ name: name.trim(), email: email.trim(), source: source.trim() }),
    onSuccess: () => onSuccess(name.trim()),
  })

  const canSubmit = name.trim() && email.trim() && source.trim().length >= 2

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (canSubmit) send.mutate()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        {send.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(send.error)}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="access-name">Name</FieldLabel>
          <Input
            id="access-name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="access-email">Email</FieldLabel>
          <Input
            id="access-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="access-source">How do you know about Dailyvy?</FieldLabel>
          <Textarea
            id="access-source"
            required
            rows={3}
            maxLength={SOURCE_MAX}
            placeholder="e.g. Rohit shared it with me"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <FieldDescription>Helps the admin know who's asking.</FieldDescription>
        </Field>

        <Button type="submit" className="w-full" disabled={!canSubmit || send.isPending}>
          {send.isPending && <Spinner />}
          Request access
        </Button>
      </FieldGroup>
    </form>
  )
}
