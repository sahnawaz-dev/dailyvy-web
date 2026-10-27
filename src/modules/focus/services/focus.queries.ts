/**
 * React Query hooks for the focus module.
 * Cache keys all start with ['focus'] so one invalidation refreshes everything.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage, toAppError } from '@/shared/api/apiError'
import type { DateString } from '@/shared/types/api'
import { MIN_CREDIT_MINUTES } from '../constants'
import type { FocusSession, FocusSettings, StartFocusInput } from '../types/focus.types'
import { formatMinutes } from '../utils/time'
import { focusApi } from './focus.api'

export const focusKeys = {
  all: ['focus'] as const,
  settings: ['focus', 'settings'] as const,
  active: ['focus', 'active'] as const,
  sessions: (date: DateString) => ['focus', 'sessions', date] as const,
  summary: ['focus', 'summary'] as const,
  days: (from: DateString, to: DateString) => ['focus', 'days', from, to] as const,
}

// ---- Reads -----------------------------------------------------------------------

export function useFocusSettings() {
  return useQuery({ queryKey: focusKeys.settings, queryFn: focusApi.getSettings })
}

/**
 * The running / paused session. Re-checked every 30 s and whenever the Focus
 * page opens (staleTime 0), so changes made on another device show up.
 */
export function useActiveSession() {
  return useQuery({
    queryKey: focusKeys.active,
    queryFn: focusApi.getActive,
    staleTime: 0,
    refetchInterval: 30_000,
  })
}

export function useFocusSummary() {
  return useQuery({ queryKey: focusKeys.summary, queryFn: focusApi.summary })
}

export function useFocusDays(from: DateString, to: DateString) {
  return useQuery({ queryKey: focusKeys.days(from, to), queryFn: () => focusApi.days(from, to) })
}

export function useDaySessions(date: DateString | undefined) {
  return useQuery({
    queryKey: focusKeys.sessions(date ?? ''),
    queryFn: () => focusApi.listSessions(date!),
    enabled: Boolean(date),
  })
}

// ---- Sessions --------------------------------------------------------------------

/** Puts the session in the "active" cache (or clears it once it's finished). */
function useSetActive() {
  const queryClient = useQueryClient()
  return (session: FocusSession | null) =>
    queryClient.setQueryData(focusKeys.active, {
      session: session && (session.status === 'running' || session.status === 'paused') ? session : null,
    })
}

/** Refreshes totals, charts and session lists (not the active session). */
export function useRefreshFocusStats() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: focusKeys.all,
      predicate: (query) => query.queryKey[1] !== 'active',
    })
}

export function useStartSession() {
  const setActive = useSetActive()
  const refresh = useRefreshFocusStats()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StartFocusInput) => focusApi.start(input),
    onSuccess: (session) => {
      setActive(session)
      return refresh()
    },
    onError: (err) => {
      const error = toAppError(err)
      // Already running (e.g. started on another device): show that one instead.
      if (error.code === 'FOCUS_SESSION_ACTIVE') void queryClient.invalidateQueries({ queryKey: focusKeys.active })
      toast.error(getErrorMessage(err))
    },
  })
}

function useSessionAction(action: (sessionId: string) => Promise<FocusSession>) {
  const setActive = useSetActive()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: action,
    onSuccess: setActive,
    onError: (err) => {
      void queryClient.invalidateQueries({ queryKey: focusKeys.all })
      toast.error(getErrorMessage(err))
    },
  })
}

export const usePauseSession = () => useSessionAction(focusApi.pause)
export const useResumeSession = () => useSessionAction(focusApi.resume)

/** Ends early — counts the actual minutes if it lasted at least 5. */
export function useEndSession() {
  const setActive = useSetActive()
  const refresh = useRefreshFocusStats()
  return useMutation({
    mutationFn: focusApi.end,
    onSuccess: (session) => {
      setActive(null)
      if (session.creditedMinutes > 0) {
        toast.success(`Session ended — ${formatMinutes(session.creditedMinutes)} added to today`)
      } else {
        toast(`Session ended — under ${MIN_CREDIT_MINUTES} minutes isn't counted`)
      }
      return refresh()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

// ---- Settings --------------------------------------------------------------------

export function useUpdateFocusSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: Partial<FocusSettings>) => focusApi.updateSettings(changes),
    onSuccess: (settings) => {
      queryClient.setQueryData(focusKeys.settings, settings)
      toast.success('Focus settings saved')
      return queryClient.invalidateQueries({ queryKey: focusKeys.all })
    },
  })
}
