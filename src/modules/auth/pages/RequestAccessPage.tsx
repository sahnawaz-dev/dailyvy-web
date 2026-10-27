import { useState } from 'react'
import { Link } from 'react-router'
import { MailCheck } from 'lucide-react'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AuthCard } from '../components/AuthCard'
import { RequestAccessForm } from '../components/RequestAccessForm'

/**
 * Dailyvy is invite-only: instead of signing up, people ask for an account.
 * Once the admin approves it, they get an email with a temporary password.
 */
export function RequestAccessPage() {
  useDocumentTitle('Request access')
  const [sentFor, setSentFor] = useState<string | null>(null)

  return (
    <AuthCard
      title={sentFor ? 'Request sent' : 'Request access'}
      subtitle={
        sentFor ? undefined : "Dailyvy is invite-only for now. Tell us who you are and we'll get back to you."
      }
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      {sentFor ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center" role="status">
          <MailCheck className="size-10 text-primary" aria-hidden />
          <p className="font-medium">Thanks, {sentFor}!</p>
          <p className="text-sm text-muted-foreground">
            Once your request is approved, you'll get an email with a temporary password to log in.
          </p>
        </div>
      ) : (
        <RequestAccessForm onSuccess={setSentFor} />
      )}
    </AuthCard>
  )
}
