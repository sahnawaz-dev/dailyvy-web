/** Calls to /api/v1/challenges and their React Query hooks. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/httpClient'
import { getErrorMessage } from '@/shared/api/apiError'
import type { DateString } from '@/shared/types/api'
import type { ActiveChallenge, ChallengeBase, StartChallengeValues } from '../types/challenges.types'

export const challengesApi = {
  current: () => api.get<ActiveChallenge | null>('/challenges/current'),
  start: (values: StartChallengeValues) => api.post<ActiveChallenge>('/challenges', values),
  tick: (date: DateString) => api.put<ActiveChallenge>(`/challenges/current/days/${date}`),
  untick: (date: DateString) => api.delete<ActiveChallenge>(`/challenges/current/days/${date}`),
  extend: (lengthDays: number) => api.post<ActiveChallenge>('/challenges/current/extend', { lengthDays }),
  finish: () => api.post<ChallengeBase>('/challenges/current/finish'),
  abandon: () => api.post<ChallengeBase>('/challenges/current/abandon'),
  history: () => api.get<ChallengeBase[]>('/challenges/history'),
}

export const challengeKeys = {
  current: ['challenge', 'current'] as const,
  history: ['challenge', 'history'] as const,
}

export function useCurrentChallenge() {
  return useQuery({
    queryKey: challengeKeys.current,
    queryFn: challengesApi.current,
    // The rules depend on the clock (midnight, the 10:00 late-tick limit)
    refetchInterval: 5 * 60_000,
  })
}

export function useChallengeHistory(enabled = true) {
  return useQuery({ queryKey: challengeKeys.history, queryFn: challengesApi.history, enabled })
}

/** Runs a challenge action; the server's answer replaces the cached challenge. */
function useChallengeMutation<V>(
  mutationFn: (variables: V) => Promise<ActiveChallenge | ChallengeBase>,
  success?: (result: ActiveChallenge | ChallengeBase) => void,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      queryClient.setQueryData(challengeKeys.current, result.status === 'active' ? result : null)
      if (result.status !== 'active') queryClient.invalidateQueries({ queryKey: challengeKeys.history })
      success?.(result)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
      queryClient.invalidateQueries({ queryKey: challengeKeys.current })
    },
  })
}

export const useStartChallenge = () => useChallengeMutation(challengesApi.start)
export const useExtendChallenge = () =>
  useChallengeMutation(challengesApi.extend, (c) => toast.success(`Extended to ${c.lengthDays} days. Keep going!`))
export const useFinishChallenge = () =>
  useChallengeMutation(() => challengesApi.finish(), () => toast.success('Challenge complete. Well done! 🏆'))
export const useAbandonChallenge = () => useChallengeMutation(() => challengesApi.abandon())

/** Tick (done) or un-tick a day. */
export const useTickChallenge = () =>
  useChallengeMutation(({ date, done }: { date: DateString; done: boolean }) =>
    done ? challengesApi.tick(date) : challengesApi.untick(date),
  )
