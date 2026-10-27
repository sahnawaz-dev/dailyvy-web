import type { DateString } from '@/shared/types/api'
import { useLiveSession } from './useLiveSession'

/**
 * Minutes of the active session to add on top of the server's totals for
 * `today` (the server only counts finished sessions).
 */
export function useLiveFocusMinutes(today: DateString | undefined): number {
  const { session, elapsedSeconds } = useLiveSession()
  return session && session.date === today ? Math.floor(elapsedSeconds / 60) : 0
}
