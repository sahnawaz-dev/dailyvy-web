/**
 * Focus minutes per day as bars, with each focus day's goal as a dashed line.
 *  - Week:  Mon–Sun, minutes under each bar; browse earlier weeks with ‹ ›
 *  - Month: one bar per day of the month; browse back to the month you joined
 * The Week / Month choice is remembered (focusUiStore).
 */
import { useState } from 'react'
import { PeriodNavigator } from '@/shared/components'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { cn } from '@/shared/lib/utils'
import type { DateString } from '@/shared/types/api'
import {
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  addDays,
  addMonths,
  dayOfMonth,
  formatDisplay,
  formatMonth,
  formatWeekRange,
  monthDays,
  monthOf,
  startOfWeek,
  weekdayIndex,
} from '@/shared/utils/date'
import { useLiveFocusMinutes } from '../hooks/useLiveFocusMinutes'
import { useFocusDays } from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'
import { STATUS_BAR_CLASS, STATUS_LABEL } from '../utils/status'
import { formatMinutes } from '../utils/time'

/** In month view, these day numbers are labelled on small screens (all on wider ones). */
const MONTH_LABELS = new Set([1, 8, 15, 22, 29])

interface FocusChartProps {
  today: DateString
  /** The day the user joined — month view doesn't go further back. */
  registeredOn: DateString
}

export function FocusChart({ today, registeredOn }: FocusChartProps) {
  const range = useFocusUiStore((state) => state.chartRange)
  const setRange = useFocusUiStore((state) => state.setChartRange)

  const currentWeek = startOfWeek(today)
  const currentMonth = monthOf(today)
  const firstMonth = monthOf(registeredOn)
  const [weekStart, setWeekStart] = useState(currentWeek)
  const [month, setMonth] = useState(currentMonth)

  const isWeek = range === 'week'
  const dates = isWeek ? [weekStart, addDays(weekStart, 6)] : [monthDays(month)[0], monthDays(month).at(-1)!]
  const { data } = useFocusDays(dates[0], dates[1])
  const live = useLiveFocusMinutes(today)

  const days = (data?.days ?? []).map((day) => (day.date === today ? { ...day, minutes: day.minutes + live } : day))
  const total = days.reduce((sum, day) => sum + day.minutes, 0)
  const scale = Math.max(60, ...days.map((day) => Math.max(day.minutes, day.goalMinutes ?? 0)))
  const percent = (minutes: number) => `${(minutes / scale) * 100}%`

  const describeDay = (day: (typeof days)[number]) =>
    `${formatDisplay(day.date, { weekday: 'long', day: 'numeric', month: 'short' })}: ${formatMinutes(day.minutes)}${
      day.goalMinutes ? ` of ${formatMinutes(day.goalMinutes)}` : ''
    }${STATUS_LABEL[day.status] ? ` · ${STATUS_LABEL[day.status]}` : ''}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isWeek ? 'Week' : 'Month'}</CardTitle>
        <CardDescription>{formatMinutes(total)} of focus</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            variant="outline"
            value={range}
            // Radix sends '' when the active item is clicked again — ignore that.
            onValueChange={(next) => next && setRange(next as 'week' | 'month')}
            aria-label="Chart range"
          >
            <ToggleGroupItem value="week" className="px-3">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-3">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isWeek ? (
          <PeriodNavigator
            label={formatWeekRange(weekStart)}
            onPrevious={() => setWeekStart(addDays(weekStart, -7))}
            onNext={() => setWeekStart(addDays(weekStart, 7))}
            onToday={() => setWeekStart(currentWeek)}
            isCurrent={weekStart === currentWeek}
            disableNext={weekStart >= currentWeek}
            previousLabel="Previous week"
            nextLabel="Next week"
          />
        ) : (
          <PeriodNavigator
            label={formatMonth(month)}
            onPrevious={() => setMonth(addMonths(month, -1))}
            onNext={() => setMonth(addMonths(month, 1))}
            onToday={() => setMonth(currentMonth)}
            isCurrent={month === currentMonth}
            disablePrevious={month <= firstMonth}
            disableNext={month >= currentMonth}
            previousLabel="Previous month"
            nextLabel="Next month"
          />
        )}

        {!data ? (
          <Skeleton className="h-48" />
        ) : isWeek ? (
          <div className="grid grid-cols-7 gap-2" role="list" aria-label="Focus time per day">
            {days.map((day, index) => (
              <div
                key={day.date}
                role="listitem"
                className="flex flex-col items-center gap-1.5"
                title={describeDay(day)}
              >
                <Bar day={day} percent={percent} className="h-36 max-w-10 rounded-md" />
                <span className={cn('text-xs', day.date === today ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                  <span className="sr-only">{WEEKDAY_LONG[index]}</span>
                  <span aria-hidden="true">{WEEKDAY_SHORT[index]}</span>
                </span>
                <span className="text-[0.7rem] tabular-nums text-muted-foreground">
                  {day.minutes ? formatMinutes(day.minutes) : '–'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid gap-0.5 sm:gap-1"
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
            role="list"
            aria-label="Focus time per day"
          >
            {days.map((day) => {
              const dayNumber = dayOfMonth(day.date)
              const isToday = day.date === today
              return (
                <div
                  key={day.date}
                  role="listitem"
                  aria-label={describeDay(day)}
                  className="flex flex-col items-center gap-1.5"
                  title={describeDay(day)}
                >
                  <Bar
                    day={day}
                    percent={percent}
                    className={cn('h-36 max-w-6 rounded-sm', weekdayIndex(day.date) >= 5 && 'bg-muted/30')}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'text-[0.65rem] tabular-nums',
                      isToday ? 'font-semibold text-primary' : 'text-muted-foreground',
                      !MONTH_LABELS.has(dayNumber) && !isToday && 'invisible sm:visible',
                    )}
                  >
                    {dayNumber}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span aria-hidden="true" className="w-5 border-t-2 border-dashed border-foreground/30" />
          Daily goal
        </p>
      </CardContent>
    </Card>
  )
}

interface BarProps {
  day: { minutes: number; goalMinutes: number | null; status: keyof typeof STATUS_BAR_CLASS }
  percent: (minutes: number) => string
  className?: string
}

/** One day's column: muted track, goal line (dashed), filled bar in the status color. */
function Bar({ day, percent, className }: BarProps) {
  return (
    <div className={cn('relative flex w-full items-end bg-muted/50', className)}>
      {day.goalMinutes !== null && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 border-t-2 border-dashed border-foreground/30"
          style={{ bottom: percent(day.goalMinutes) }}
        />
      )}
      {day.minutes > 0 && (
        <div
          className={cn('w-full rounded-[inherit] transition-[height] duration-500', STATUS_BAR_CLASS[day.status])}
          style={{ height: percent(day.minutes) }}
        />
      )}
    </div>
  )
}
