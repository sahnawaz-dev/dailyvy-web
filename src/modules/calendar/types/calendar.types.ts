import type { DateString, MonthString } from '@/shared/types/api'

export type CalendarScope = 'tab' | 'all'

/**
 * complete — every applicable habit in scope was done
 * partial  — some were done
 * missed   — none were done
 * n/a      — before registration, in the future, or nothing to track that day
 */
export type DayStatus = 'complete' | 'partial' | 'missed' | 'n/a'

export interface CalendarDay {
  date: DateString
  status: DayStatus
  applicable: number
  completed: number
}

export interface CalendarResponse {
  scope: CalendarScope
  tabId: string | null
  registeredOn: DateString
  today: DateString
  month: MonthString | null
  days: CalendarDay[]
}

export interface DayDetailHabit {
  id: string
  tabId: string
  name: string
  color: string | null
  icon: string | null
  completed: boolean
  /** Skipped that day ("skip today") — not counted. */
  skipped: boolean
  /** A "times per week" habit — listed only on days it was done. */
  weekly?: boolean
  /** The note written that day ("ran 5 km"), or null. */
  note?: string | null
}

export interface DayDetail extends CalendarDay {
  habits: DayDetailHabit[]
}

export interface CalendarFilter {
  scope: CalendarScope
  tabId?: string
}
