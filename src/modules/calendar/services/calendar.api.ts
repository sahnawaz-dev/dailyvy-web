/** Raw calls to /api/v1/calendar */
import { api } from '@/shared/api/httpClient'
import type { DateString, MonthString } from '@/shared/types/api'
import type { CalendarFilter, CalendarResponse, DayDetail } from '../types/calendar.types'

export const calendarApi = {
  getMonth: (filter: CalendarFilter, month: MonthString) =>
    api.get<CalendarResponse>('/calendar', { ...filter, month }),

  getDay: (filter: CalendarFilter, date: DateString) => api.get<DayDetail>(`/calendar/day/${date}`, filter),
}
