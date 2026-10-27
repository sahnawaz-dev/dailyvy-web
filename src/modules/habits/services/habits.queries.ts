/**
 * React Query hooks for the habits module. Components use these, never habitsApi directly.
 *
 * Cache keys:
 *   ['tabs']
 *   ['views', tabId, 'weekly' | 'monthly', period]
 *   ['today-habits']            habits due today across all tabs (To-Dos page)
 *   ['stats', tabId]
 */
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/apiError'
import { toast } from 'sonner'
import type { DateString, MonthString } from '@/shared/types/api'
import { CELEBRATION_SCOPE } from '../constants'
import { useHabitsUiStore } from '../store/habitsUiStore'
import type {
  GridView,
  HabitFormValues,
  HabitLogStatus,
  Tab,
  TodayHabitsView,
  WeekProgress,
} from '../types/habits.types'
import { shouldCelebrate } from '../utils/celebration'
import { habitsApi } from './habits.api'

export const habitKeys = {
  tabs: ['tabs'] as const,
  viewsOfTab: (tabId: string) => ['views', tabId] as const,
  weekly: (tabId: string, weekStart?: DateString) => ['views', tabId, 'weekly', weekStart ?? 'current'] as const,
  monthly: (tabId: string, month?: MonthString) => ['views', tabId, 'monthly', month ?? 'current'] as const,
  today: ['today-habits'] as const,
  tabStats: (tabId: string) => ['stats', tabId] as const,
  archived: (tabId: string) => ['archived-habits', tabId] as const,
}

// ---- Queries ---------------------------------------------------------------------

export function useTabs() {
  return useQuery({ queryKey: habitKeys.tabs, queryFn: habitsApi.listTabs })
}

export function useWeeklyView(tabId: string, weekStart?: DateString) {
  return useQuery({
    queryKey: habitKeys.weekly(tabId, weekStart),
    queryFn: () => habitsApi.weeklyView(tabId, weekStart),
    placeholderData: (previous) => (previous?.tab.id === tabId ? previous : undefined),
  })
}

export function useMonthlyView(tabId: string, month?: MonthString) {
  return useQuery({
    queryKey: habitKeys.monthly(tabId, month),
    queryFn: () => habitsApi.monthlyView(tabId, month),
    placeholderData: (previous) => (previous?.tab.id === tabId ? previous : undefined),
  })
}

/** Habits due today, grouped by tab (tabs with nothing due are omitted). */
export function useTodayHabits() {
  return useQuery({ queryKey: habitKeys.today, queryFn: habitsApi.todayView })
}

export function useTabStats(tabId: string) {
  return useQuery({ queryKey: habitKeys.tabStats(tabId), queryFn: () => habitsApi.tabStats(tabId) })
}

// ---- Tab mutations -----------------------------------------------------------------

export function useCreateTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.createTab,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: habitKeys.tabs }),
  })
}

/** Puts `items` in the order of `ids` (items not listed keep their place at the end). */
function inOrder<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const position = new Map(ids.map((id, index) => [id, index]))
  return [...items].sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity))
}

/** Drag to reorder tabs: the tab bar updates instantly; rolled back with a toast on error. */
export function useReorderTabs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.reorderTabs,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: habitKeys.tabs })
      const previous = queryClient.getQueryData<Tab[]>(habitKeys.tabs)
      queryClient.setQueryData<Tab[]>(habitKeys.tabs, (tabs) => tabs && inOrder(tabs, ids))
      return { previous }
    },
    onError: (err, _ids, context) => {
      queryClient.setQueryData(habitKeys.tabs, context?.previous)
      toast.error(getErrorMessage(err))
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: habitKeys.tabs }),
        queryClient.invalidateQueries({ queryKey: habitKeys.today }),
      ]),
  })
}

/** Drag to reorder a tab's habits: every cached grid of the tab updates instantly. */
export function useReorderHabits(tabId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => habitsApi.reorderHabits(tabId, ids),
    onMutate: async (ids) => {
      const gridKey = habitKeys.viewsOfTab(tabId)
      await queryClient.cancelQueries({ queryKey: gridKey })
      const snapshot = queryClient.getQueriesData<GridView>({ queryKey: gridKey })
      queryClient.setQueriesData<GridView>(
        { queryKey: gridKey },
        (view) => view && { ...view, habits: inOrder(view.habits, ids) },
      )
      return { snapshot }
    },
    onError: (err, _ids, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(getErrorMessage(err))
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: habitKeys.viewsOfTab(tabId) }),
        queryClient.invalidateQueries({ queryKey: habitKeys.today }),
      ]),
  })
}

export function useRenameTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tabId, name }: { tabId: string; name: string }) => habitsApi.updateTab(tabId, { name }),
    onSuccess: (_tab, { tabId }) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.tabs })
      queryClient.invalidateQueries({ queryKey: habitKeys.viewsOfTab(tabId) })
      queryClient.invalidateQueries({ queryKey: habitKeys.today })
    },
  })
}

export function useDeleteTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.deleteTab,
    onSuccess: () => {
      toast.success('Tab deleted')
      queryClient.invalidateQueries({ queryKey: habitKeys.today })
      return queryClient.invalidateQueries({ queryKey: habitKeys.tabs })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

// ---- Habit mutations ---------------------------------------------------------------

/** After any habit change, refresh that tab's grids and stats, and the today view. */
function useInvalidateTab() {
  const queryClient = useQueryClient()
  return (tabId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: habitKeys.viewsOfTab(tabId) }),
      queryClient.invalidateQueries({ queryKey: habitKeys.tabStats(tabId) }),
      queryClient.invalidateQueries({ queryKey: habitKeys.today }),
      queryClient.invalidateQueries({ queryKey: habitKeys.archived(tabId) }),
    ])
}

/** The tab's archived habits (newest first). */
export function useArchivedHabits(tabId: string) {
  return useQuery({ queryKey: habitKeys.archived(tabId), queryFn: () => habitsApi.archivedHabits(tabId) })
}

/** Restore an archived habit (also used by the "Undo" on the archive toast). */
export function useRestoreHabit(tabId: string) {
  const invalidateTab = useInvalidateTab()
  return useMutation({
    mutationFn: habitsApi.restoreHabit,
    onSuccess: (habit) => {
      toast.success(`"${habit.name}" is back`)
      return invalidateTab(tabId)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

/** Archive (pause) a habit. No confirmation needed: the toast offers Undo. */
export function useArchiveHabit(tabId: string) {
  const invalidateTab = useInvalidateTab()
  const restore = useRestoreHabit(tabId)
  return useMutation({
    mutationFn: habitsApi.archiveHabit,
    onSuccess: (habit) => {
      toast.success(`"${habit.name}" archived`, {
        description: 'Find it under Archived to restore it.',
        action: { label: 'Undo', onClick: () => restore.mutate(habit.id) },
      })
      return invalidateTab(tabId)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

/** `mutate({ tabId, values })` — the tab is chosen at save time (e.g. on the To-Dos page). */
export function useCreateHabit() {
  const invalidateTab = useInvalidateTab()
  return useMutation({
    mutationFn: ({ tabId, values }: { tabId: string; values: HabitFormValues }) => habitsApi.createHabit(tabId, values),
    onSuccess: (_habit, { tabId }) => {
      toast.success('New habit started. Day 1 begins now! 🌱')
      return invalidateTab(tabId)
    },
  })
}

export function useUpdateHabit(tabId: string) {
  const invalidateTab = useInvalidateTab()
  return useMutation({
    mutationFn: ({ habitId, values }: { habitId: string; values: Partial<HabitFormValues> }) =>
      habitsApi.updateHabit(habitId, values),
    onSuccess: () => {
      toast.success('Habit updated')
      return invalidateTab(tabId)
    },
  })
}

export function useDeleteHabit(tabId: string) {
  const invalidateTab = useInvalidateTab()
  return useMutation({
    mutationFn: habitsApi.deleteHabit,
    onSuccess: () => {
      toast.success('Habit deleted. Its past check-ins stay in your calendar.')
      return invalidateTab(tabId)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

// ---- Today's mark: done / skipped ("skip today") / none -----------------------------------

interface ToggleVariables {
  tabId: string
  habitId: string
  date: DateString
  status: HabitLogStatus
}

const withDate = (dates: DateString[], date: DateString, on: boolean) => {
  const others = dates.filter((d) => d !== date)
  return on ? [...others, date].sort() : others
}

/** A weekly habit's "done this week" count after today's check-in changes (only today can change). */
function withWeekDone<T extends { week?: WeekProgress | null }>(habit: T, wasDone: boolean, nowDone: boolean): T {
  if (!habit.week || wasDone === nowDone) return habit
  return { ...habit, week: { ...habit.week, done: Math.max(0, habit.week.done + (nowDone ? 1 : -1)) } }
}

function applyToGrid(view: GridView | undefined, { habitId, date, status }: ToggleVariables) {
  if (!view) return view
  return {
    ...view,
    habits: view.habits.map((habit) =>
      habit.id !== habitId
        ? habit
        : withWeekDone(
            {
              ...habit,
              completedDates: withDate(habit.completedDates, date, status === 'done'),
              skippedDates: withDate(habit.skippedDates ?? [], date, status === 'skipped'),
            },
            habit.completedDates.includes(date),
            status === 'done',
          ),
    ),
  }
}

function applyToToday(view: TodayHabitsView | undefined, { habitId, status }: ToggleVariables) {
  if (!view) return view
  return {
    ...view,
    tabs: view.tabs.map((group) => ({
      ...group,
      habits: group.habits.map((habit) =>
        habit.id === habitId
          ? withWeekDone(
              { ...habit, completed: status === 'done', skipped: status === 'skipped' },
              habit.completed,
              status === 'done',
            )
          : habit,
      ),
    })),
  }
}

/** Today's note on a habit: shown right away on the Today page, rolled back on error. */
export function useSetHabitNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ habitId, date, note }: { habitId: string; date: DateString; note: string | null }) =>
      habitsApi.setNote(habitId, date, note),
    onMutate: async ({ habitId, note }) => {
      await queryClient.cancelQueries({ queryKey: habitKeys.today })
      const previous = queryClient.getQueryData<TodayHabitsView>(habitKeys.today)
      queryClient.setQueryData<TodayHabitsView>(habitKeys.today, (view) =>
        view
          ? {
              ...view,
              tabs: view.tabs.map((group) => ({
                ...group,
                habits: group.habits.map((h) => (h.id === habitId ? { ...h, note: note?.trim() || null } : h)),
              })),
            }
          : view,
      )
      return { previous }
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(habitKeys.today, context?.previous)
      toast.error(getErrorMessage(err))
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: habitKeys.today }),
        // The calendar's day details show notes too
        queryClient.invalidateQueries({ queryKey: ['calendar'] }),
      ]),
  })
}

type Snapshot = [QueryKey, unknown][]

/**
 * Optimistic toggle: the checkbox flips instantly (in the habit grids AND the
 * To-Dos page), the server confirms, and on error we roll back and show a toast.
 * Triggers the celebration when the server says the day is complete.
 */
export function useToggleLog() {
  const queryClient = useQueryClient()
  const showCelebration = useHabitsUiStore((state) => state.showCelebration)

  return useMutation({
    mutationFn: ({ habitId, date, status }: ToggleVariables) => habitsApi.setLog(habitId, date, status),

    onMutate: async (variables) => {
      const gridKey = habitKeys.viewsOfTab(variables.tabId)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: gridKey }),
        queryClient.cancelQueries({ queryKey: habitKeys.today }),
      ])
      const snapshot: Snapshot = [
        ...queryClient.getQueriesData<GridView>({ queryKey: gridKey }),
        ...queryClient.getQueriesData<TodayHabitsView>({ queryKey: habitKeys.today }),
      ]
      queryClient.setQueriesData<GridView>({ queryKey: gridKey }, (view) => applyToGrid(view, variables))
      queryClient.setQueriesData<TodayHabitsView>({ queryKey: habitKeys.today }, (view) =>
        applyToToday(view, variables),
      )
      return { snapshot }
    },

    onError: (err, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(getErrorMessage(err))
    },

    onSuccess: (result) => {
      if (shouldCelebrate(result, CELEBRATION_SCOPE)) showCelebration()
    },

    // Re-sync with the server. Needed because the optimistic write above also
    // marks a cached grid "fresh" — e.g. a grid cached before a habit was added
    // elsewhere (To-Dos page) would otherwise keep showing the old list.
    // Only on-screen queries refetch now; the others are marked stale.
    onSettled: (_result, _err, { tabId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: habitKeys.tabStats(tabId) }),
        queryClient.invalidateQueries({ queryKey: habitKeys.viewsOfTab(tabId) }),
        queryClient.invalidateQueries({ queryKey: habitKeys.today }),
      ]),
  })
}
