import { useActiveSession } from '../services/focus.queries'
import { liveTimes } from '../utils/time'
import { useNow } from './useNow'

/**
 * The active focus session with live elapsed / remaining seconds
 * (re-renders every second while it's running).
 */
export function useLiveSession() {
  const query = useActiveSession()
  const session = query.data?.session ?? null
  const now = useNow(session?.status === 'running')
  const times = session ? liveTimes(session, query.dataUpdatedAt, now || query.dataUpdatedAt) : null

  return {
    session,
    elapsedSeconds: times?.elapsed ?? 0,
    remainingSeconds: times?.remaining ?? 0,
    /** When the running session will finish (epoch ms), or null. */
    endsAt: session?.status === 'running' ? query.dataUpdatedAt + session.remainingSeconds * 1000 : null,
  }
}
