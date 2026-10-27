/**
 * Date helpers mirroring server/src/common/utils/dateUtils.js.
 *
 * - Dates are 'YYYY-MM-DD' strings; they compare correctly with < > ===.
 * - Weekday index: 0 = Monday ... 6 = Sunday.
 * - Arithmetic is done in UTC so the browser's timezone/DST never shifts a day.
 * - "Today" should come from the server (views return `today`), not the browser clock.
 */
import type { DateString, MonthString } from '@/shared/types/api'

const pad = (n: number) => String(n).padStart(2, '0')

/** Index 0 = Monday ... 6 = Sunday */
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const WEEKDAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export function parseDate(date: DateString): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function formatDate(date: Date): DateString {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function addDays(date: DateString, days: number): DateString {
  const d = parseDate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return formatDate(d)
}

/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(date: DateString): number {
  return (parseDate(date).getUTCDay() + 6) % 7
}

export function startOfWeek(date: DateString): DateString {
  return addDays(date, -weekdayIndex(date))
}

export function monthOf(date: DateString): MonthString {
  return date.slice(0, 7)
}

export function addMonths(month: MonthString, months: number): MonthString {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + months, 1))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

/** All dates of a month. */
export function monthDays(month: MonthString): DateString[] {
  const [y, m] = month.split('-').map(Number)
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`)
}

export function dayOfMonth(date: DateString): number {
  return Number(date.slice(8, 10))
}

/** Formats a date string for display, e.g. formatDisplay('2026-10-05', { weekday: 'short' }). */
export function formatDisplay(date: DateString, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(parseDate(date))
}

export function formatMonth(month: MonthString): string {
  return formatDisplay(`${month}-01`, { month: 'long', year: 'numeric' })
}

/** "5 – 11 Oct 2026" */
export function formatWeekRange(weekStart: DateString): string {
  const end = addDays(weekStart, 6)
  const startLabel = formatDisplay(weekStart, { day: 'numeric', month: 'short' })
  const endLabel = formatDisplay(end, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

/** The browser's IANA timezone, sent at signup. */
export function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/** Fallback "today" from the browser clock — prefer the server's `today`. */
export function browserToday(): DateString {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function formatRelativeTime(isoDate: string): string {
  const seconds = Math.round((new Date(isoDate).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

/** Today's date in an IANA timezone (e.g. the user's profile timezone). */
export function todayInTimezone(timeZone: string): DateString {
  return dateInTimezone(new Date(), timeZone)
}

/** The calendar day an instant falls on in an IANA timezone. */
export function dateInTimezone(instant: Date, timeZone: string): DateString {
  try {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      instant,
    )
  } catch {
    return browserToday()
  }
}
