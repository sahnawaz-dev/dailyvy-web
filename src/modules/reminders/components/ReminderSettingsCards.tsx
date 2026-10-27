/**
 * The four reminders (task, habit, streak at risk, focus) — settings live on
 * the server, so changing them here changes them on the phone too.
 */
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useReminderSettings, useUpdateReminderSettings } from '../services/reminders.queries'

import { ReminderCard } from './ReminderCard'

const TASK_LEADS = [0, 5, 10, 15, 30] as const
const HABIT_TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00'] as const
const STREAK_TIMES = ['20:00', '21:00', '22:00', '23:00'] as const
const FOCUS_TIMES = ['09:00', '11:00', '14:00', '17:00', '19:00'] as const
const WEEKLY_TIMES = ['17:00', '18:00', '19:00', '20:00', '21:00'] as const
const CHALLENGE_TIMES = ['19:00', '20:00', '21:00', '22:00', '23:00'] as const

/** '20:00' → '8:00 PM' (or '20:00', depending on the browser's locale). */
const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, h, m))
}
const formatLead = (minutes: number) => (minutes === 0 ? 'At due time' : `${minutes} min before`)

export function ReminderSettingsCards() {
  const { data: settings } = useReminderSettings()
  const update = useUpdateReminderSettings()

  if (!settings) {
    return (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </>
    )
  }

  const subtitle = 'Synced with the mobile app.'

  return (
    <>
      <ReminderCard
        title="Task reminders"
        subtitle={subtitle}
        enabled={settings.task.enabled}
        value={settings.task.leadMinutes}
        options={TASK_LEADS}
        formatOption={formatLead}
        describe={(label) =>
          settings.task.leadMinutes === 0
            ? 'You’ll get a notification when a task with a due time is due.'
            : `You’ll get a notification ${label.toLowerCase()} a task with a due time is due.`
        }
        onEnabledChange={(enabled) => update.mutate({ task: { enabled } })}
        onValueChange={(leadMinutes) => update.mutate({ task: { leadMinutes } })}
      />
      <ReminderCard
        title="Habit reminders"
        subtitle={subtitle}
        enabled={settings.habit.enabled}
        value={settings.habit.time}
        options={HABIT_TIMES}
        formatOption={formatTime}
        describe={(label) => `At ${label}, if any of today’s habits are still unchecked, you’ll get a reminder.`}
        onEnabledChange={(enabled) => update.mutate({ habit: { enabled } })}
        onValueChange={(time) => update.mutate({ habit: { time } })}
      />
      <ReminderCard
        title="Streak at risk"
        subtitle={subtitle}
        enabled={settings.streak.enabled}
        value={settings.streak.time}
        options={STREAK_TIMES}
        formatOption={formatTime}
        describe={(label) => `At ${label}, if a habit or focus streak would end at midnight, you’ll get an alert.`}
        onEnabledChange={(enabled) => update.mutate({ streak: { enabled } })}
        onValueChange={(time) => update.mutate({ streak: { time } })}
      />
      <ReminderCard
        title="Focus reminders"
        subtitle={subtitle}
        enabled={settings.focus.enabled}
        value={settings.focus.time}
        options={FOCUS_TIMES}
        formatOption={formatTime}
        describe={(label) =>
          `At ${label} on your focus days, if you haven’t reached your daily goal yet, you’ll get a reminder.`
        }
        onEnabledChange={(enabled) => update.mutate({ focus: { enabled } })}
        onValueChange={(time) => update.mutate({ focus: { time } })}
      />
      <ReminderCard
        title="Sunday summary"
        subtitle={subtitle}
        enabled={settings.weekly.enabled}
        value={settings.weekly.time}
        options={WEEKLY_TIMES}
        formatOption={formatTime}
        describe={(label) =>
          `Every Sunday at ${label}, a short look at your week — habits done, focus time and your best habit.`
        }
        onEnabledChange={(enabled) => update.mutate({ weekly: { enabled } })}
        onValueChange={(time) => update.mutate({ weekly: { time } })}
      />
      <ReminderCard
        title="Challenge"
        subtitle={subtitle}
        enabled={settings.challenge.enabled}
        value={settings.challenge.time}
        options={CHALLENGE_TIMES}
        formatOption={formatTime}
        describe={(label) =>
          `At ${label}, if today isn’t ticked in your challenge yet. Plus a morning reminder if yesterday isn’t ticked — you have until 10 AM.`
        }
        onEnabledChange={(enabled) => update.mutate({ challenge: { enabled } })}
        onValueChange={(time) => update.mutate({ challenge: { time } })}
      />
    </>
  )
}
