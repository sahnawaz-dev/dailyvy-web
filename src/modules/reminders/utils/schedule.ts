/** Plain-words descriptions of a custom reminder's schedule. */
import type { CustomReminder, CustomSchedule } from '../types/reminders.types'

/** '20:00' → '8:00 PM' (or '20:00', depending on the browser's locale). */
export function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, h, m))
}

/** 30 → '30 min', 60 → '1 hour', 90 → '1.5 hours' */
export function formatEvery(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = minutes / 60
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** 'Every day', 'Weekdays', 'Weekends' or 'Mon, Wed, Fri' */
export function formatDays(days: boolean[]) {
  const key = days.map(Number).join('')
  if (key === '1111111') return 'Every day'
  if (key === '1111100') return 'Weekdays'
  if (key === '0000011') return 'Weekends'
  return DAY_NAMES.filter((_, i) => days[i]).join(', ')
}

/** 'Every 1 hour · 9:00 AM – 9:00 PM' or '8:00 AM, 1:00 PM, 7:00 PM' */
export function formatSchedule(schedule: CustomSchedule) {
  if (schedule.kind === 'interval') {
    return `Every ${formatEvery(schedule.everyMinutes)} · ${formatTime(schedule.from)} – ${formatTime(schedule.to)}`
  }
  return [...schedule.times].sort().map(formatTime).join(', ')
}

export function describeReminder(reminder: Pick<CustomReminder, 'schedule' | 'days'>, habitName?: string) {
  const text = `${formatSchedule(reminder.schedule)} · ${formatDays(reminder.days)}`
  return habitName ? `${text} · until “${habitName}” is checked` : text
}
