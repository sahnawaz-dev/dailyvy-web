import type { DateString } from '@/shared/types/api'

export type ChallengeStatus = 'active' | 'completed' | 'abandoned'

/** A challenge as stored (history entries have only these fields). */
export interface ChallengeBase {
  id: string
  title: string
  icon: string | null
  /** Days to reach (can be extended). */
  lengthDays: number
  initialLengthDays: number
  status: ChallengeStatus
  /** Day it was taken. */
  startedOn: DateString
  /** Day 1 of the current attempt. */
  startDate: DateString
  /** Attempt number (1 = never restarted). */
  attempts: number
  /** Longest run of ticked days in any attempt. */
  bestDays: number
  /** Day the goal was reached (then: finish or extend), or null. */
  reachedOn: DateString | null
  endedAt: string | null
}

/** The active challenge, as the Today card shows it (rules already applied by the server). */
export interface ActiveChallenge extends ChallengeBase {
  status: 'active'
  today: DateString
  /** Yesterday can be ticked until this time ('HH:mm'). */
  lateTickUntil: string
  /** Ticked days in a row in this attempt. */
  doneCount: number
  /** Today is Day N of this attempt. */
  dayNumber: number
  daysLeft: number
  todayDone: boolean
  /** Yesterday isn't ticked but still can be (until `lateTickUntil`). */
  yesterdayOpen: boolean
  yesterday: DateString
  /** After reaching the goal: false once a day was missed (it can only be finished then). */
  canExtend: boolean
  /** It started again recently because of a missed day. */
  recentRestart: { missedOn: DateString; daysDone: number } | null
}

export interface StartChallengeValues {
  title: string
  icon: string | null
  lengthDays: number
}
