import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { DateString, MonthString } from '@/shared/types/api'
import type { CalendarFilter } from '../types/calendar.types'
import { calendarApi } from './calendar.api'

export const calendarKeys = {
  month: (filter: CalendarFilter, month: MonthString) => ['calendar', filter.scope, filter.tabId ?? 'all', month] as const,
  day: (filter: CalendarFilter, date: DateString) => ['calendar', 'day', filter.scope, filter.tabId ?? 'all', date] as const,
}

export function useCalendarMonth(filter: CalendarFilter, month: MonthString) {
  return useQuery({
    queryKey: calendarKeys.month(filter, month),
    queryFn: () => calendarApi.getMonth(filter, month),
    placeholderData: keepPreviousData,
  })
}

export function useDayDetail(filter: CalendarFilter, date: DateString | null) {
  return useQuery({
    queryKey: calendarKeys.day(filter, date ?? ''),
    queryFn: () => calendarApi.getDay(filter, date!),
    enabled: date !== null,
  })
}
