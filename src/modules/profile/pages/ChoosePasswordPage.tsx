import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { publicUrl } from '@/shared/lib/publicUrl'
import { logout, useCurrentUser } from '@/modules/auth'
import { ChangePasswordForm } from '../components/ChangePasswordForm'

/**
 * Logged in with a temporary password (emailed by the admin): choose your own
 * before using Dailyvy. RequireAuth sends every page here until it's done.
 */
export function ChoosePasswordPage() {
  useDocumentTitle('Choose your password')
  const user = useCurrentUser()
  const navigate = useNavigate()

  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 p-4">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-heading font-semibold">
          <img src={publicUrl('icons/icon-192.png')} alt="" width={36} height={36} className="size-9" />
          <span className="text-lg">Dailyvy</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="size-5 text-primary" />
              Choose your own password
            </CardTitle>
            <CardDescription>
              Welcome, {user.name}! You logged in with a temporary password. Pick one only you know to keep your
              account safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm
              currentLabel="Temporary password (from the email)"
              submitLabel="Save and continue"
              onChanged={() => navigate('/today', { replace: true })}
            />
          </CardContent>
        </Card>
        <Button variant="ghost" className="self-center" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    </main>
  )
}
