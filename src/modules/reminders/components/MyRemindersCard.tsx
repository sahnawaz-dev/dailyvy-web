/**
 * "My reminders" — the user's own gentle nudges (drink water, eat healthy…).
 * One list: icon · title · schedule · on/off switch; click a row to edit
 * (delete is in the dialog). "Pause all today" silences them for the day.
 * With no reminders yet, presets get the first one set up in one click.
 */
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import { cn } from '@/shared/lib/utils'
import { todayInTimezone } from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { REMINDER_PRESETS } from '../constants'
import {
  useCustomReminders,
  useHabitOptions,
  useReminderSettings,
  useUpdateCustomReminder,
  useUpdateReminderSettings,
} from '../services/reminders.queries'
import type { CustomReminder, CustomReminderInput } from '../types/reminders.types'
import { describeReminder, formatTime } from '../utils/schedule'
import { CustomReminderDialog } from './CustomReminderDialog'

type DialogState = { reminder?: CustomReminder; initial?: CustomReminderInput } | null

export function MyRemindersCard() {
  const user = useCurrentUser()
  const today = todayInTimezone(user.timezone)
  const { data: reminders } = useCustomReminders()
  const { data: settings } = useReminderSettings()
  const updateSettings = useUpdateReminderSettings()
  const updateReminder = useUpdateCustomReminder()
  const habits = useHabitOptions()
  const habitName = (id: string | null) => habits.data?.find((h) => h.id === id)?.name
  // When the card opened — enough to hide snoozes that already ended
  const [openedAt] = useState(() => Date.now())
  /** 'Snoozed until 10:15 AM' while a notification's snooze is running. */
  const snoozeText = (until: string | null) => {
    if (!until || new Date(until).getTime() <= openedAt) return null
    const at = new Date(until)
    return `Snoozed until ${formatTime(`${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`)}`
  }
  const [dialog, setDialog] = useState<DialogState>(null)

  const pausedToday = settings?.nudges.pausedOn === today
  const hasReminders = Boolean(reminders && reminders.length > 0)

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>My reminders</CardTitle>
        <CardDescription>
          Gentle, silent nudges for things like water or meals — held back while you focus.
        </CardDescription>
        {hasReminders && (
          <CardAction>
            <Button size="sm" onClick={() => setDialog({})}>
              <Plus />
              Add reminder
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {!reminders && (
          <div className="flex flex-col gap-2" aria-busy aria-label="Loading reminders">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        )}

        {reminders && !hasReminders && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">Start with one of these — you can change everything.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {REMINDER_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setDialog({ initial: preset.reminder })}
                >
                  <span aria-hidden="true">{preset.reminder.icon}</span>
                  {preset.label}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDialog({})}>
              <Plus />
              Make my own
            </Button>
          </div>
        )}

        {hasReminders && (
          <>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
              <Label htmlFor="pause-reminders" className="text-sm font-normal">
                {pausedToday ? 'Paused for today — they’ll be back tomorrow.' : 'Pause all for today'}
              </Label>
              <Switch
                id="pause-reminders"
                checked={pausedToday}
                onCheckedChange={(paused) => updateSettings.mutate({ nudges: { pausedOn: paused ? today : null } })}
              />
            </div>

            <ul className={cn('flex flex-col gap-2', pausedToday && 'opacity-60')}>
              {reminders!.map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/40"
                >
                  <button
                    type="button"
                    onClick={() => setDialog({ reminder })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md"
                    aria-label={`Edit ${reminder.title}`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-lg" aria-hidden="true">
                      {reminder.icon}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className={cn('truncate font-medium', !reminder.enabled && 'text-muted-foreground')}>
                        {reminder.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {describeReminder(reminder, habitName(reminder.habitId))}
                      </span>
                      {snoozeText(reminder.snoozedUntil) && (
                        <span className="text-xs text-primary">{snoozeText(reminder.snoozedUntil)}</span>
                      )}
                    </span>
                  </button>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(enabled) => updateReminder.mutate({ id: reminder.id, changes: { enabled } })}
                    aria-label={`${reminder.title} on or off`}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>

      {dialog && (
        <CustomReminderDialog
          key={dialog.reminder?.id ?? 'new'}
          reminder={dialog.reminder}
          initial={dialog.initial}
          onClose={() => setDialog(null)}
        />
      )}
    </Card>
  )
}
