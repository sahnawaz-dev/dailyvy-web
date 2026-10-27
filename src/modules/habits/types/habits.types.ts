import type { DateString, MonthString } from '@/shared/types/api'

/** 7 booleans, index 0 = Monday ... 6 = Sunday. */
export type ActiveDays = boolean[]

export type ViewMode = 'weekly' | 'monthly'

/**
 * How often a habit is due:
 *  'days'   — on the checked weekdays (activeDays)
 *  'weekly' — any days, `timesPerWeek` times each Mon–Sun week (e.g. gym 3× a week)
 */
export interface HabitFrequency {
  kind: 'days' | 'weekly'
  /** 1–6 for 'weekly'; null for 'days'. */
  timesPerWeek: number | null
}

/** A weekly habit's progress this week, e.g. { done: 2, target: 3 }. */
export interface WeekProgress {
  done: number
  target: number
}

export interface Tab {
  id: string
  name: string
  order: number
  createdAt: string
}

export interface Habit {
  id: string
  tabId: string
  name: string
  activeDays: ActiveDays
  frequency: HabitFrequency
  color: string | null
  icon: string | null
  order: number
  /** First tracked day (creation day in the user's timezone). */
  startDate: DateString
  /** Last tracked day, set when the habit is deleted or archived. */
  endDate: DateString | null
  /** Stretches it was archived and later restored: not tracked, never missed. */
  pauses: { from: DateString; to: DateString }[]
  isActive: boolean
  /** Archived (paused): hidden from the grid and Today, can be restored. */
  isArchived: boolean
}

/** A habit row inside a weekly/monthly view, with its completed / skipped days in that range. */
export interface GridHabit extends Habit {
  completedDates: DateString[]
  /** "Skip today" days — count like days the habit isn't scheduled (no streak break). */
  skippedDates: DateString[]
  /** Weekly habits only: this week's progress (always the current week). */
  week: WeekProgress | null
}

/** A habit's mark for a day. */
export type HabitLogStatus = 'done' | 'skipped' | 'none'

export interface GridDay {
  date: DateString
  weekday: number
}

/** Response of GET /views/weekly and /views/monthly. */
export interface GridView {
  tab: Tab
  timezone: string
  /** Today in the user's timezone — the ONLY day that can be toggled. */
  today: DateString
  days: GridDay[]
  habits: GridHabit[]
  weekStart?: DateString
  weekEnd?: DateString
  month?: MonthString
}

/** Response of GET /views/today: habits due today, grouped by tab. */
export interface TodayHabitsView {
  today: DateString
  tabs: { tab: Tab; habits: TodayHabit[] }[]
}

export type TodayHabit = Habit & {
  completed: boolean
  skipped: boolean
  week: WeekProgress | null
  /** Today's note ("ran 5 km"), or null. */
  note: string | null
}

export interface HabitStats {
  habitId: string
  trackedDays: number
  completedDays: number
  /** 0..1, null when nothing has been tracked yet. */
  completionRate: number | null
  currentStreak: number
  longestStreak: number
  /** Weekly habits count streaks in weeks (target met), others in days. */
  streakUnit: 'day' | 'week'
}

export interface TabStats {
  tabId: string
  habitCount: number
  averageCompletionRate: number | null
  /** Consecutive days on which EVERY habit in the tab was done. */
  currentStreak: number
  longestStreak: number
  habits: HabitStats[]
}

/** Response of PUT /logs/:habitId/:date */
export interface ToggleLogResult {
  habitId: string
  tabId: string
  date: DateString
  completed: boolean
  skipped: boolean
  /** All applicable habits in this tab are done today. */
  dayComplete: boolean
  /** All applicable habits across all tabs are done today. */
  allTabsComplete: boolean
}

export interface HabitFormValues {
  name: string
  activeDays: ActiveDays
  /** Leave out to keep the habit's current frequency (new habits: specific days). */
  frequency?: HabitFrequency
  color: string | null
  icon: string | null
}
