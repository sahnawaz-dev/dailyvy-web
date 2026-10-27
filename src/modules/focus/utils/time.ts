/** Time helpers for focus sessions (pure — see time.test.ts). */
import type { FocusSession } from '../types/focus.types'

/** 90 → '1h 30m', 45 → '45m', 0 → '0m' */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

/** 1499 → '24:59' (countdown display) */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Live elapsed / remaining seconds of a session. The server's numbers are as
 * of `fetchedAt` (ms); a running session keeps counting from there. Using the
 * time since the response — not the server's clock — avoids clock skew.
 */
export function liveTimes(session: FocusSession, fetchedAt: number, now: number) {
  const total = session.plannedMinutes * 60
  const drift = session.status === 'running' ? Math.max(0, (now - fetchedAt) / 1000) : 0
  const elapsed = Math.min(session.elapsedSeconds + drift, total)
  return { elapsed, remaining: total - elapsed }
}
