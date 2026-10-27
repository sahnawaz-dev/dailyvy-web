import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import type { AppError } from '@/shared/api/apiError'
import { reportRequestResult } from '@/shared/lib/connection'

export const queryClient = new QueryClient({
  // Every request result feeds the connection banner ("Can't reach Dailyvy")
  queryCache: new QueryCache({
    onError: (error) => reportRequestResult(error),
    onSuccess: () => reportRequestResult(null),
  }),
  mutationCache: new MutationCache({
    onError: (error) => reportRequestResult(error),
    onSuccess: () => reportRequestResult(null),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Don't retry client errors (401/403/404/422...) — they won't fix themselves.
      retry: (failureCount, error) => {
        const status = (error as AppError).status ?? 0
        return status >= 500 || status === 0 ? failureCount < 2 : false
      },
    },
    mutations: { retry: false },
  },
})
