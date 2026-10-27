/**
 * "Your data" (Account → Security):
 *  - Export my data: everything Dailyvy stores about you, as a JSON file
 *  - Delete account: permanent — asks for the password and typing DELETE
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PasswordInput } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { disablePush } from '@/shared/lib/webPush'
import { useAuthStore } from '@/modules/auth'
import { profileApi } from '../services/profile.api'

/** Saves `data` as a pretty-printed JSON file. */
function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
  link.click()
  URL.revokeObjectURL(url)
}

export function AccountDataCard() {
  const [deleting, setDeleting] = useState(false)

  const exportData = useMutation({
    mutationFn: profileApi.exportData,
    onSuccess: (data) => {
      downloadJson(data, `dailyvy-export-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Your data was downloaded')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your data</CardTitle>
        <CardDescription>Take a copy of everything, or leave for good.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-sm text-muted-foreground">
            Download your profile, habits and check-ins, tasks, focus sessions and reminders as a JSON file.
          </p>
          <Button variant="outline" onClick={() => exportData.mutate()} disabled={exportData.isPending}>
            {exportData.isPending ? <Spinner /> : <Download />}
            Export my data
          </Button>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="max-w-sm">
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently deletes your account and all its data on every device. This can't be undone.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDeleting(true)}>
            <Trash2 />
            Delete account
          </Button>
        </div>
      </CardContent>

      {deleting && <DeleteAccountDialog onClose={() => setDeleting(false)} />}
    </Card>
  )
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const remove = useMutation({
    mutationFn: async () => {
      await disablePush() // stop this browser's notifications first (best effort)
      return profileApi.deleteAccount(password)
    },
    onSuccess: () => {
      useAuthStore.getState().clear()
      toast.success('Your account and all its data were deleted.')
      navigate('/login', { replace: true })
    },
  })

  const canDelete = password.length > 0 && confirm === 'DELETE' && !remove.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (canDelete) remove.mutate()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Leaving us already?</DialogTitle>
            <DialogDescription>
              Every habit, streak, check-in, task, focus session and challenge you've built will be gone for good, on
              every device. Just need a break? Switch off your reminders and come back whenever you're ready. If you
              still want to go, export your data first.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {remove.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(remove.error)}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="delete-password">Your password</FieldLabel>
              <PasswordInput
                id="delete-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="delete-confirm">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </FieldLabel>
              <Input
                id="delete-confirm"
                autoComplete="off"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Keep my account</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!canDelete}>
              {remove.isPending && <Spinner />}
              Delete everything forever
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
