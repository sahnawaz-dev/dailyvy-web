import type { DateString } from '@/shared/types/api'

export type FocusSessionStatus = 'running' | 'paused' | 'completed' | 'ended'

/** "Focusing on…" picked from today's tasks / habits. */
export interface FocusLink {
  kind: 'task' | 'habit'
  refId: string
}

export interface FocusSession {
  id: string
  /** The day it started (counts there even if it runs past midnight). */
  date: DateString
  plannedMinutes: number
  label: string | null
  link: FocusLink | null
  status: FocusSessionStatus
  startedAt: string
  endedAt: string | null
  /** As of when the server answered — see utils/time.ts `liveTimes`. */
  elapsedSeconds: number
  remainingSeconds: number
  /** Minutes added to the day once finished. */
  creditedMinutes: number
}

export interface StartFocusInput {
  plannedMinutes: number
  label: string | null
  link: FocusLink | null
}

export interface FocusSettings {
  dailyGoalMinutes: number
  /** Index 0 = Monday ... 6 = Sunday */
  focusDays: boolean[]
}

/**
 * rest: not a focus day · met: goal reached · in-progress: today, not yet ·
 * partial: some focus, under the goal · missed: none · none: before joining / future
 */
export type FocusDayStatus = 'rest' | 'met' | 'in-progress' | 'partial' | 'missed' | 'none'

export interface FocusDay {
  date: DateString
  minutes: number
  goalMinutes: number | null
  isFocusDay: boolean
  status: FocusDayStatus
}

export interface FocusDays {
  today: DateString
  days: FocusDay[]
}

export interface FocusSummary {
  today: DateString
  goal: { dailyGoalMinutes: number; isFocusDay: boolean; met: boolean }
  /** Minutes of finished sessions (the active one is added live on the client). */
  totals: { today: number; yesterday: number; week: number; month: number; allTime: number }
  currentStreak: number
  longestStreak: number
  bestDay: { date: DateString; minutes: number } | null
  averagePerFocusDay: number | null
}

export interface DaySessions {
  date: DateString
  sessions: FocusSession[]
}
