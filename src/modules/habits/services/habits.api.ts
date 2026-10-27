/** Raw calls to the habits module endpoints: /tabs, /habits, /views, /logs */
import { api } from '@/shared/api/httpClient'
import type { DateString, MessageResponse, MonthString } from '@/shared/types/api'
import type {
  GridView,
  Habit,
  HabitFormValues,
  HabitFrequency,
  HabitLogStatus,
  HabitStats,
  Tab,
  TabStats,
  TodayHabitsView,
  ToggleLogResult,
} from '../types/habits.types'

/** The server wants `{ kind: 'days' }` or `{ kind: 'weekly', timesPerWeek }` — nothing extra. */
const frequencyInput = (frequency: HabitFrequency) =>
  frequency.kind === 'weekly' ? { kind: 'weekly', timesPerWeek: frequency.timesPerWeek ?? 3 } : { kind: 'days' }

function toHabitInput<T extends Partial<HabitFormValues>>(values: T) {
  const { frequency, ...rest } = values
  return frequency ? { ...rest, frequency: frequencyInput(frequency) } : rest
}

export const habitsApi = {
  // Tabs
  listTabs: () => api.get<Tab[]>('/tabs'),
  createTab: (name: string) => api.post<Tab>('/tabs', { name }),
  updateTab: (tabId: string, changes: { name?: string; order?: number }) => api.patch<Tab>(`/tabs/${tabId}`, changes),
  deleteTab: (tabId: string) => api.delete<MessageResponse>(`/tabs/${tabId}`),
  /** Drag to reorder: every tab id, in the new order. */
  reorderTabs: (ids: string[]) => api.put<Tab[]>('/tabs/order', { ids }),

  // Habits
  createHabit: (tabId: string, values: HabitFormValues) => api.post<Habit>(`/tabs/${tabId}/habits`, toHabitInput(values)),
  updateHabit: (habitId: string, changes: Partial<HabitFormValues> & { order?: number; tabId?: string }) =>
    api.patch<Habit>(`/habits/${habitId}`, toHabitInput(changes)),
  deleteHabit: (habitId: string) => api.delete<MessageResponse>(`/habits/${habitId}`),
  /** Archive = pause: off the grid / Today from today, history kept, restorable. */
  archiveHabit: (habitId: string) => api.post<Habit>(`/habits/${habitId}/archive`),
  /** Tracked again from today; the archived days don't count as missed. */
  restoreHabit: (habitId: string) => api.post<Habit>(`/habits/${habitId}/restore`),
  archivedHabits: (tabId: string) => api.get<Habit[]>(`/tabs/${tabId}/habits/archived`),
  /** Drag to reorder: every habit id of the tab, in the new order. */
  reorderHabits: (tabId: string, ids: string[]) => api.put<Habit[]>(`/tabs/${tabId}/habits/order`, { ids }),

  // Views (one batched call per grid)
  weeklyView: (tabId: string, weekStart?: DateString) => api.get<GridView>('/views/weekly', { tabId, weekStart }),
  monthlyView: (tabId: string, month?: MonthString) => api.get<GridView>('/views/monthly', { tabId, month }),
  todayView: () => api.get<TodayHabitsView>('/views/today'),

  // Logs — server only accepts today's date on an applicable weekday
  // 'done' | 'skipped' ("skip today") | 'none'
  setLog: (habitId: string, date: DateString, status: HabitLogStatus) =>
    api.put<ToggleLogResult>(`/logs/${habitId}/${date}`, { status }),
  /** Today's note on a habit ("ran 5 km"); null clears it. Today only, like checking it off. */
  setNote: (habitId: string, date: DateString, note: string | null) =>
    api.put<{ habitId: string; date: DateString; note: string | null }>(`/logs/${habitId}/${date}/note`, { note }),

  // Stats
  habitStats: (habitId: string) => api.get<HabitStats>(`/habits/${habitId}/stats`),
  tabStats: (tabId: string) => api.get<TabStats>(`/tabs/${tabId}/stats`),
}
