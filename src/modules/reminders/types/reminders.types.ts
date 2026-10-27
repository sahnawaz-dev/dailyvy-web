/** 'HH:mm' (24h) in the user's profile timezone. */
export type ReminderTime = string

export interface DailyReminder {
  enabled: boolean
  time: ReminderTime
}

/** Reminder settings — stored on the server, shared by the web and mobile apps. */
export interface ReminderSettings {
  /** A reminder `leadMinutes` before each of today's timed tasks. */
  task: { enabled: boolean; leadMinutes: number }
  /** At `time`, if any of today's habits are still unchecked. */
  habit: DailyReminder
  /** At `time`, if a habit-tab or focus streak would end at midnight. */
  streak: DailyReminder
  /** At `time` on focus days, if the daily focus goal isn't met yet. */
  focus: DailyReminder
  /** Sundays at `time`: a short summary of the week (Insights). */
  weekly: DailyReminder
  /** The active challenge: at `time` if today isn't ticked (+ a morning late-tick nudge). */
  challenge: DailyReminder
  /** "Pause all today" for the user's own reminders: the paused day, or null. */
  nudges: { pausedOn: string | null }
}

export type ReminderSettingsChanges = {
  [K in keyof ReminderSettings]?: Partial<ReminderSettings[K]>
}

// ---- The user's own reminders (water, meals, stretch…) ---------------------------

export type CustomSchedule =
  /** Every `everyMinutes` between `from` and `to` */
  | { kind: 'interval'; everyMinutes: number; from: ReminderTime; to: ReminderTime }
  /** At each of `times` */
  | { kind: 'times'; times: ReminderTime[] }

export interface CustomReminder {
  id: string
  icon: string
  title: string
  body: string
  schedule: CustomSchedule
  /** 7 booleans, index 0 = Monday */
  days: boolean[]
  enabled: boolean
  /** Linked habit: no more reminders once it's checked today (null = none). */
  habitId: string | null
  /** "Snooze 15 min" from a notification: quiet until then (ISO), or null. */
  snoozedUntil: string | null
  createdAt: string
}

export type CustomReminderInput = Omit<CustomReminder, 'id' | 'createdAt' | 'snoozedUntil'>

/** A habit a reminder can be linked to. */
export interface HabitOption {
  id: string
  name: string
  icon: string | null
  color: string | null
  tabName: string | null
}
