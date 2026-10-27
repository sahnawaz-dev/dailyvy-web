/** Due-time helpers. Times are 'HH:mm' (24h) in the user's timezone. */
import type { TimeString } from '../types/todos.types'

/** Current time 'HH:mm' in an IANA timezone. */
export function nowInTimezone(timeZone: string, now = new Date()): TimeString {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
      now,
    )
  } catch {
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }
}

/** '18:30' → '6:30 PM' (or '18:30', depending on the user's locale). */
export function formatTime(time: TimeString): string {
  const [h, m] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, h, m))
}

/** A task is overdue when its due time has passed today and it isn't done. */
export function isOverdue(dueTime: TimeString | null, completed: boolean, now: TimeString): boolean {
  return Boolean(dueTime) && !completed && dueTime! < now
}
