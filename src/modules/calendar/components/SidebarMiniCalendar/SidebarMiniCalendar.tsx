/**
 * A small month calendar in the sidebar: each day tinted by how it went (all
 * done / partly / missed, across all tabs). Clicking a day opens it on the
 * Calendar page. Shares its data (and cache) with the Calendar page.
 * Hidden while the sidebar is collapsed to icons.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { DateString, MonthString } from '@/shared/types/api'
import {
  addMonths,
  dayOfMonth,
  formatMonth,
  monthDays,
  monthOf,
  todayInTimezone,
  WEEKDAY_SHORT,
  weekdayIndex,
} from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { STATUS_LABEL } from '../../constants'
import { useCalendarMonth } from '../../services/calendar.queries'
import type { CalendarFilter, DayStatus } from '../../types/calendar.types'

const ALL: CalendarFilter = { scope: 'all' }

/** Softer than the Calendar page — it sits in the sidebar. */
const MINI_STATUS: Record<DayStatus, string> = {
  complete: 'bg-success text-success-foreground',
  partial: 'bg-warning/25 text-warning',
  missed: 'bg-destructive/15 text-destructive',
  'n/a': 'text-sidebar-foreground/50',
}

export function SidebarMiniCalendar() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const today = todayInTimezone(user.timezone)
  const currentMonth = monthOf(today)
  const [month, setMonth] = useState<MonthString>(currentMonth)
  const calendar = useCalendarMonth(ALL, month)

  const statusOf = new Map(calendar.data?.days.map((d) => [d.date, d]) ?? [])
  const days = monthDays(month)
  const leading = weekdayIndex(days[0]) // Monday-first
  const earliest = calendar.data ? monthOf(calendar.data.registeredOn) : null

  const open = (date: DateString) => navigate(`/calendar?month=${month}&day=${date}`)

  return (
    <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden" aria-label="This month">
      <div className="mb-1 flex items-center justify-between">
        <span className="pl-1 text-xs font-medium text-sidebar-foreground/70">{formatMonth(month)}</span>
        <span className="flex">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous month"
            disabled={earliest !== null && month <= earliest}
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next month"
            disabled={month >= currentMonth}
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight />
          </Button>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_SHORT.map((day) => (
          <span key={day} className="text-[0.6rem] font-medium text-sidebar-foreground/50" aria-hidden="true">
            {day[0]}
          </span>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((date) => {
          const info = statusOf.get(date)
          const status: DayStatus = info?.status ?? 'n/a'
          const trackable = status !== 'n/a' || date === today
          const label = `${date}: ${STATUS_LABEL[status]}${info?.applicable ? ` (${info.completed} of ${info.applicable})` : ''}`
          return (
            <button
              key={date}
              type="button"
              disabled={!trackable}
              onClick={() => open(date)}
              title={label}
              aria-label={label}
              className={cn(
                'grid aspect-square place-items-center rounded-md text-[0.7rem] font-medium tabular-nums transition-transform',
                MINI_STATUS[status],
                trackable && 'hover:scale-110 hover:ring-1 hover:ring-sidebar-ring',
                date === today && 'ring-2 ring-primary',
                !trackable && 'cursor-default',
              )}
            >
              {dayOfMonth(date)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
