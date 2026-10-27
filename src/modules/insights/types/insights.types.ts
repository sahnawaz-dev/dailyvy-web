import type { DateString } from '@/shared/types/api'

export interface HabitInsight {
  id: string
  name: string
  icon: string | null
  color: string | null
  tabName: string | null
  due: number
  done: number
  /** 0..1 */
  rate: number | null
}

export interface HabitDay {
  date: DateString
  due: number
  done: number
  skipped: number
  future: boolean
}

export interface FocusDay {
  date: DateString
  minutes: number
  status: 'rest' | 'met' | 'in-progress' | 'partial' | 'missed' | 'none'
}

/** Response of GET /insights/weekly */
export interface WeeklyInsights {
  weekStart: DateString
  weekEnd: DateString
  today: DateString
  isCurrentWeek: boolean
  firstWeekStart: DateString
  habits: {
    /** done / due (skipped and future days left out); null when nothing was due */
    rate: number | null
    done: number
    due: number
    daily: HabitDay[]
    best: HabitInsight[]
    attention: HabitInsight[]
  }
  focus: { minutes: number; goalDaysMet: number; focusDays: number; daily: FocusDay[] }
  tasks: { total: number; completed: number }
  bestDay: { date: DateString; done: number; due: number; focusMinutes: number } | null
  previous: {
    weekStart: DateString
    habitRate: number | null
    focusMinutes: number
    tasksCompleted: number
  }
}
