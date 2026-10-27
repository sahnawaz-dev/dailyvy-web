/**
 * Full-width banner: turn reminder notifications on / off for THIS browser
 * (Web Push — they arrive even when no tab is open). Each browser / device is
 * separate; the reminder settings below are shared everywhere.
 * Icon + status on the left, actions on the right (stacked on small screens).
 */
import { useEffect, useState } from 'react'
import { Bell, BellOff, BellRing, Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'
import { getErrorMessage } from '@/shared/api/apiError'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { disablePush, enablePush, getPushState, sendTestPush, type PushState } from '@/shared/lib/webPush'

const MESSAGES: Record<PushState, string> = {
  on: 'Reminders will pop up on this browser, even when Dailyvy isn’t open.',
  off: 'Turn them on to get your reminders here, even when Dailyvy isn’t open.',
  unsupported: "This browser can't show notifications from websites (or the page isn't on https).",
  unavailable: "Notifications aren't set up on the server yet.",
  blocked: 'Notifications are blocked for this site. Allow them in your browser’s site settings, then reload.',
}

export function BrowserNotificationsCard() {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getPushState().then(setState, () => setState('unsupported'))
  }, [])

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const turnOn = () =>
    run(async () => {
      const next = await enablePush()
      setState(next)
      if (next === 'on') toast.success('Notifications are on for this browser')
    })

  const turnOff = () =>
    run(async () => {
      await disablePush()
      setState('off')
      toast.success('Notifications are off for this browser')
    })

  const test = () =>
    run(async () => {
      const { sent } = await sendTestPush()
      if (sent === 0) toast.error('No browser received it — try turning notifications off and on again.')
    })

  const on = state === 'on'
  const Icon = on ? BellRing : state === 'off' || state === null ? Bell : BellOff

  return (
    <Card
      className={cn(
        'relative mb-4 flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:gap-5',
        on && 'ring-primary/40',
      )}
    >
      {/* Soft theme-colored glow behind the icon */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-16 size-48 rounded-full bg-primary/15 blur-3xl"
      />

      <div
        className={cn(
          'relative grid size-12 shrink-0 place-items-center rounded-2xl',
          on ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-6" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-base font-semibold">Browser notifications</h2>
          {state !== null && (
            <Badge variant={on ? 'default' : 'outline'}>{on ? 'On' : state === 'off' ? 'Off' : 'Unavailable'}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {state === null ? 'Checking this browser…' : MESSAGES[state]} Your phone uses the Dailyvy app’s own
          notifications.
        </p>
      </div>

      <div className="relative flex shrink-0 flex-wrap gap-2">
        {state === null && <Spinner />}
        {state === 'off' && (
          <Button onClick={turnOn} disabled={busy}>
            {busy ? <Spinner /> : <Bell />}
            Turn on notifications
          </Button>
        )}
        {on && (
          <>
            <Button variant="outline" onClick={test} disabled={busy}>
              {busy ? <Spinner /> : <Send />}
              Send a test
            </Button>
            <Button variant="ghost" onClick={turnOff} disabled={busy}>
              <BellOff />
              Turn off
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
