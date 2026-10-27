/**
 * React Query hooks for the todos module.
 * Cache keys: ['todos', 'today'], ['todos', 'missed'], ['todos', 'missed-history']
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/apiError'
import type { MissedItemRef, MissedList, TodayTodos, TodoInput } from '../types/todos.types'
import { todosApi } from './todos.api'

export const todoKeys = {
  today: ['todos', 'today'] as const,
  missed: ['todos', 'missed'] as const,
  missedHistory: ['todos', 'missed-history'] as const,
}

const sameItem = (a: MissedItemRef, b: MissedItemRef) => a.kind === b.kind && a.refId === b.refId && a.date === b.date

// ---- Today's tasks ---------------------------------------------------------------

export function useTodayTodos() {
  return useQuery({ queryKey: todoKeys.today, queryFn: todosApi.listToday })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TodoInput) => todosApi.create(input),
    onSuccess: () => {
      toast.success('Task added for today')
      return queryClient.invalidateQueries({ queryKey: todoKeys.today })
    },
  })
}

/** Edit title and/or due time. */
export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ todoId, changes }: { todoId: string; changes: Partial<TodoInput> }) =>
      todosApi.update(todoId, changes),
    onSuccess: () => {
      toast.success('Task updated')
      return queryClient.invalidateQueries({ queryKey: todoKeys.today })
    },
  })
}

/** Optimistic check / uncheck with rollback on error. Can be toggled any number of times today. */
export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ todoId, completed }: { todoId: string; completed: boolean }) =>
      todosApi.update(todoId, { completed }),
    onMutate: async ({ todoId, completed }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.today })
      const previous = queryClient.getQueryData<TodayTodos>(todoKeys.today)
      queryClient.setQueryData<TodayTodos>(todoKeys.today, (data) =>
        data && { ...data, todos: data.todos.map((t) => (t.id === todoId ? { ...t, completed } : t)) },
      )
      return { previous }
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(todoKeys.today, context?.previous)
      toast.error(getErrorMessage(err))
    },
  })
}

/** Optimistic delete with rollback on error. */
export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: todosApi.remove,
    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.today })
      const previous = queryClient.getQueryData<TodayTodos>(todoKeys.today)
      queryClient.setQueryData<TodayTodos>(todoKeys.today, (data) =>
        data && { ...data, todos: data.todos.filter((t) => t.id !== todoId) },
      )
      return { previous }
    },
    onSuccess: () => toast.success('Task deleted'),
    onError: (err, _todoId, context) => {
      queryClient.setQueryData(todoKeys.today, context?.previous)
      toast.error(getErrorMessage(err))
    },
  })
}

// ---- Missed items ------------------------------------------------------------------

export function useMissedItems() {
  return useQuery({ queryKey: todoKeys.missed, queryFn: todosApi.listMissed, staleTime: 5 * 60_000 })
}

/** Handled missed items (History tab) — loaded when shown. */
export function useMissedHistory(enabled: boolean) {
  return useQuery({ queryKey: todoKeys.missedHistory, queryFn: todosApi.listMissedHistory, enabled })
}

/** Removes items from the cached missed list right away (restored on error). */
function useOptimisticMissedRemoval() {
  const queryClient = useQueryClient()
  return async (refs: MissedItemRef[]) => {
    await queryClient.cancelQueries({ queryKey: todoKeys.missed })
    const previous = queryClient.getQueryData<MissedList>(todoKeys.missed)
    queryClient.setQueryData<MissedList>(todoKeys.missed, (data) =>
      data && { ...data, items: data.items.filter((item) => !refs.some((ref) => sameItem(item, ref))) },
    )
    return { previous }
  }
}

/** "Add to task": turns a missed item into a task for today. */
export function useAddMissedToToday() {
  const queryClient = useQueryClient()
  const removeFromList = useOptimisticMissedRemoval()
  return useMutation({
    mutationFn: (item: MissedItemRef) => todosApi.addMissed(item),
    onMutate: (item) => removeFromList([item]),
    onSuccess: (todo) => {
      toast.success(`"${todo.title}" added to today`)
      queryClient.invalidateQueries({ queryKey: todoKeys.missedHistory })
      return queryClient.invalidateQueries({ queryKey: todoKeys.today })
    },
    onError: (err, _item, context) => {
      queryClient.setQueryData(todoKeys.missed, context?.previous)
      toast.error(getErrorMessage(err))
    },
  })
}

export function useDismissMissed() {
  const queryClient = useQueryClient()
  const removeFromList = useOptimisticMissedRemoval()
  return useMutation({
    mutationFn: (items: MissedItemRef[]) => todosApi.dismissMissed(items),
    onMutate: (items) => removeFromList(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.missedHistory }),
    onError: (err, _items, context) => {
      queryClient.setQueryData(todoKeys.missed, context?.previous)
      toast.error(getErrorMessage(err))
    },
  })
}
