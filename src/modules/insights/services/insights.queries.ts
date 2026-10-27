/** Weekly review data. Cache key: ['insights', 'weekly', weekStart] */
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/httpClient'
import type { DateString } from '@/shared/types/api'
import type { WeeklyInsights } from '../types/insights.types'

export const insightsApi = {
  weekly: (weekStart?: DateString) => api.get<WeeklyInsights>('/insights/weekly', { weekStart }),
}

export function useWeeklyInsights(weekStart: DateString | undefined) {
  return useQuery({
    queryKey: ['insights', 'weekly', weekStart ?? 'current'],
    queryFn: () => insightsApi.weekly(weekStart),
    // Keep last week on screen while the next one loads (no flash when browsing)
    placeholderData: keepPreviousData,
  })
}
