/** Value + helpers for the habit form fields (HabitFormFields component). */
import { DEFAULT_ACTIVE_DAYS, HABIT_COLORS } from '../constants'
import type { HabitFormValues } from '../types/habits.types'

export type HabitFieldValues = Omit<HabitFormValues, 'name'>

/** Defaults for a new habit: every day, first color, no icon. */
export const NEW_HABIT_FIELDS: HabitFieldValues = {
  activeDays: DEFAULT_ACTIVE_DAYS,
  frequency: { kind: 'days', timesPerWeek: null },
  color: HABIT_COLORS[0],
  icon: null,
}

export const isWeeklyHabit = (habit: { frequency?: { kind: string } | null }) => habit.frequency?.kind === 'weekly'

/** Specific days need at least one day checked; "times per week" can use any day. */
export function hasActiveDay(values: HabitFieldValues) {
  return isWeeklyHabit(values) || values.activeDays.some(Boolean)
}
