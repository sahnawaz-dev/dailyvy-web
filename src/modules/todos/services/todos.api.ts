/** Raw calls to /api/v1/todos */
import { api } from '@/shared/api/httpClient'
import type { MessageResponse } from '@/shared/types/api'
import type { MissedHistory, MissedItemRef, MissedList, TodayTodos, Todo, TodoInput } from '../types/todos.types'

export const todosApi = {
  listToday: () => api.get<TodayTodos>('/todos/today'),
  create: (input: TodoInput) => api.post<Todo>('/todos', input),
  update: (todoId: string, changes: Partial<TodoInput> & { completed?: boolean }) =>
    api.patch<Todo>(`/todos/${todoId}`, changes),
  remove: (todoId: string) => api.delete<MessageResponse>(`/todos/${todoId}`),

  // Missed items (last 7 days)
  listMissed: () => api.get<MissedList>('/todos/missed'),
  /** Items already handled (added / dismissed), last 7 days. */
  listMissedHistory: () => api.get<MissedHistory>('/todos/missed/history'),
  addMissed: (item: MissedItemRef) => api.post<Todo>('/todos/missed/add', item),
  dismissMissed: (items: MissedItemRef[]) =>
    api.post<{ dismissed: number }>('/todos/missed/dismiss', { items }),
}
