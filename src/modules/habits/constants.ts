/** Must match server/src/modules/habits/constants.js */
export const MAX_TABS = 10
export const MAX_HABITS_PER_TAB = 15

export { WEEKDAY_LONG, WEEKDAY_SHORT } from '@/shared/utils/date'

/** New habits apply to every day until the user unchecks some. */
export const DEFAULT_ACTIVE_DAYS = [true, true, true, true, true, true, true]

export const HABIT_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#db2777', '#7c3aed']

/**
 * When does the "Hoorah!" celebration fire?
 *  'tab' — all of today's habits in the current tab are done
 *  'all' — all of today's habits across every tab are done
 * (Open question in the PRD — change here.)
 */
export const CELEBRATION_SCOPE: 'tab' | 'all' = 'tab'

/** Suggestion chips stay visible until a tab has this many habits. */
export const SUGGESTIONS_UNTIL_HABITS = 3

/**
 * One-click starters shown while a tab is (nearly) empty (HabitSuggestions). Each becomes an
 * every-day habit; the user can edit days, color and icon afterwards.
 */
export const HABIT_SUGGESTIONS = [
  { name: 'Drink water', icon: '💧', color: '#0891b2' },
  { name: 'Read 10 min', icon: '📖', color: '#4f46e5' },
  { name: 'Exercise', icon: '💪', color: '#ea580c' },
  { name: 'Meditate', icon: '🧘', color: '#7c3aed' },
  { name: 'Sleep by 11', icon: '🌙', color: '#ca8a04' },
  { name: 'Journal', icon: '✍️', color: '#16a34a' },
] as const
