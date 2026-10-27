/** Must match server/src/modules/focus/constants.js */
export const FOCUS_DURATIONS = [15, 30, 45, 60] as const
export type FocusDuration = (typeof FOCUS_DURATIONS)[number]

/** A session ended early counts only if it lasted at least this long. */
export const MIN_CREDIT_MINUTES = 5

/** Daily goal: 15 min – 12 h, in steps of 15 minutes. */
export const GOAL_MIN_MINUTES = 15
export const GOAL_MAX_MINUTES = 12 * 60

/** Suggested break after a completed session (not counted as focus time). */
export const BREAK_MINUTES = 5
