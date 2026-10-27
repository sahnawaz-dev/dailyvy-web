/** habits module — public API. */
export { habitsRoutes } from './routes'

// Data
export { useCreateHabit, useSetHabitNote, useTabs, useTodayHabits, useToggleLog } from './services/habits.queries'
export type { Habit, HabitFormValues, Tab, TodayHabitsView } from './types/habits.types'

// UI reused by other modules (e.g. the To-Dos page)
export { CelebrationOverlay } from './components/CelebrationOverlay/CelebrationOverlay'
export { HabitGridCell as HabitCheckbox } from './components/HabitGrid/HabitGridCell'
export { HabitFormFields } from './components/HabitFormFields/HabitFormFields'
export { NEW_HABIT_FIELDS, hasActiveDay, type HabitFieldValues } from './utils/habitFields'
