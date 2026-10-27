/**
 * History view: month-by-month from the registration date to today.
 * URL: /calendar?scope=all|tab&tabId=&month=YYYY-MM&day=YYYY-MM-DD
 */
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AlertCircle, ChevronLeft } from 'lucide-react'
import { MonthSkeleton, PageHeader } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { getErrorMessage } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { monthOf, todayInTimezone } from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { useTabs } from '@/modules/habits'
import { CalendarMonth } from '../components/CalendarMonth/CalendarMonth'
import { DayDetailPanel } from '../components/DayDetailPanel/DayDetailPanel'
import { ScopeToggle } from '../components/ScopeToggle/ScopeToggle'
import { useCalendarMonth } from '../services/calendar.queries'
import type { CalendarFilter } from '../types/calendar.types'

export function CalendarPage() {
  useDocumentTitle('Calendar')
  const user = useCurrentUser()
  const tabs = useTabs()
  const [params, setParams] = useSearchParams()

  const currentMonth = monthOf(todayInTimezone(user.timezone))
  const month = params.get('month') ?? currentMonth
  const selectedDay = params.get('day')
  const tabId = params.get('tabId') ?? undefined
  const filter: CalendarFilter = params.get('scope') === 'tab' && tabId ? { scope: 'tab', tabId } : { scope: 'all' }

  const calendar = useCalendarMonth(filter, month)
  const tabNames = useMemo(() => new Map(tabs.data?.map((t) => [t.id, t.name]) ?? []), [tabs.data])

  /** Updates some URL params, keeping the others. */
  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const goToMonth = (target: string) => update({ month: target === currentMonth ? undefined : target, day: undefined })

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Your history since you joined."
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/habits">
              <ChevronLeft />
              Back to habits
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ScopeToggle
          filter={filter}
          tabs={tabs.data ?? []}
          onChange={(next) => update({ scope: next.scope, tabId: next.tabId, day: undefined })}
        />
        <Button variant="outline" size="sm" onClick={() => goToMonth(currentMonth)} disabled={month === currentMonth}>
          This month
        </Button>
      </div>

      {calendar.isPending && <MonthSkeleton />}
      {calendar.isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(calendar.error)}</AlertDescription>
        </Alert>
      )}

      {calendar.data && (
        // Desktop: fills the rest of the screen (no page scroll); the month's rows share
        // the height and the day panel scrolls its own list. Smaller screens scroll normally.
        <div className="grid items-start gap-4 lg:min-h-[420px] lg:flex-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
          <CalendarMonth
            days={calendar.data.days}
            today={calendar.data.today}
            registeredOn={calendar.data.registeredOn}
            month={month}
            selectedDate={selectedDay}
            onSelect={(date) => update({ day: date })}
            onMonthChange={goToMonth}
          />
          <DayDetailPanel filter={filter} date={selectedDay} tabNames={tabNames} />
        </div>
      )}
    </>
  )
}
