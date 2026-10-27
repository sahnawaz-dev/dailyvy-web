/**
 * Pure logic deciding how each grid cell looks and behaves.
 * Mirrors server/src/modules/habits/services/habitRules.js — the server is the
 * source of truth; this just keeps the UI honest.
 */
import type { DateString } from '@/shared/types/api'
import { weekdayIndex } from '@/shared/utils/date'
import type { Habit } from '../types/habits.types'

export type CellKind =
  | 'not-applicable' // weekday unchecked for this habit, or outside its tracking window
  | 'future' // applicable, but not reached yet
  | 'today' // applicable today → the only clickable cell
  | 'done' // past applicable day, completed
  | 'missed' // past applicable day, not completed
  | 'skipped' // past applicable day, skipped ("skip today") — not a miss
  | 'open' // "times per week" habit, past day not done — not a miss either

export interface CellState {
  kind: CellKind
  checked: boolean
  editable: boolean
  /** Today only: the habit was skipped today (the cell offers "mark done"). */
  skipped?: boolean
}

type HabitWindow = Pick<Habit, 'activeDays' | 'startDate' | 'endDate'> & Partial<Pick<Habit, 'frequency' | 'pauses'>>

export function isApplicableOn(habit: HabitWindow, date: DateString): boolean {
  if (date < habit.startDate) return false
  if (habit.endDate && date > habit.endDate) return false
  // Days it was archived (before being restored) aren't tracked
  if (habit.pauses?.some((pause) => date >= pause.from && date <= pause.to)) return false
  return Boolean(habit.activeDays[weekdayIndex(date)])
}

export function getCellState(
  habit: HabitWindow,
  date: DateString,
  today: DateString,
  completed: boolean,
  skipped = false,
): CellState {
  if (!isApplicableOn(habit, date)) return { kind: 'not-applicable', checked: false, editable: false }
  if (date > today) return { kind: 'future', checked: false, editable: false }
  if (date === today) {
    return { kind: 'today', checked: completed, editable: true, ...(skipped && !completed && { skipped: true }) }
  }
  if (skipped && !completed) return { kind: 'skipped', checked: false, editable: false }
  if (habit.frequency?.kind === 'weekly' && !completed) return { kind: 'open', checked: false, editable: false }
  return { kind: completed ? 'done' : 'missed', checked: completed, editable: false }
}

/** Screen-reader text for a cell. */
export function describeCell(state: CellState): string {
  switch (state.kind) {
    case 'not-applicable':
      return 'not tracked on this day'
    case 'future':
      return 'upcoming'
    case 'today':
      return state.checked ? 'done today' : state.skipped ? 'skipped today' : 'not done yet today'
    case 'done':
      return 'completed'
    case 'missed':
      return 'missed'
    case 'skipped':
      return 'skipped'
    case 'open':
      return 'not done (any days count toward the weekly goal)'
  }
}
