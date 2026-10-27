import { useTodayHabits } from '@/modules/habits'
import { useTodayTodos } from '@/modules/todos'
import type { FocusOption } from '../utils/focusChoice'

/** Today's unfinished tasks and habits, as "Focusing on…" options. */
export function useFocusOptions() {
  const todos = useTodayTodos()
  const habits = useTodayHabits()

  const tasks: FocusOption[] = (todos.data?.todos ?? [])
    .filter((todo) => !todo.completed)
    .map((todo) => ({ value: `task:${todo.id}`, label: todo.title }))

  const habitOptions: FocusOption[] = (habits.data?.tabs ?? []).flatMap(({ habits: list }) =>
    list
      .filter((habit) => !habit.completed)
      .map((habit) => ({ value: `habit:${habit.id}`, label: habit.icon ? `${habit.name} ${habit.icon}` : habit.name })),
  )

  return { tasks, habits: habitOptions }
}
