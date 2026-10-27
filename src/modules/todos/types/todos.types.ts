import type { DateString } from '@/shared/types/api'

/** 'HH:mm' (24h) in the user's timezone. */
export type TimeString = string

/** A one-off task that belongs to a single day ("For today only"). */
export interface Todo {
  id: string
  title: string
  date: DateString
  /** Optional due time today. Habits never have one. */
  dueTime: TimeString | null
  completed: boolean
  completedAt: string | null
  order: number
  createdAt: string
}

/** Response of GET /todos/today (sorted: due time first, then order added). */
export interface TodayTodos {
  today: DateString
  todos: Todo[]
}

export interface TodoInput {
  title: string
  dueTime: TimeString | null
}

/** Identifies a missed item: a task or a habit, on a given past day. */
export interface MissedItemRef {
  kind: 'task' | 'habit'
  refId: string
  date: DateString
}

export interface MissedItem extends MissedItemRef {
  title: string
  dueTime?: TimeString | null
  tabId?: string
  tabName?: string | null
  color?: string | null
}

/** Response of GET /todos/missed (newest first). */
export interface MissedList {
  items: MissedItem[]
  windowDays: number
}

/** A missed item the user already handled ("Add to task" / dismiss). */
export interface MissedHistoryItem extends MissedItemRef {
  action: 'added' | 'dismissed'
  /** When it was handled (ISO). */
  handledAt: string
  title: string
  tabName?: string | null
  color?: string | null
}

/** Response of GET /todos/missed/history (newest first). */
export interface MissedHistory {
  items: MissedHistoryItem[]
  historyDays: number
}
