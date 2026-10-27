/**
 * Month view of focus days: each day is coloured by goal status and shows its
 * focus time. Picking a day shows that day's sessions (DaySessionsCard).
 */
import { createContext, use, useMemo, useState, type ComponentProps } from 'react'
import { Calendar, CalendarDayButton } from '@/shared/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { DateString, MonthString } from '@/shared/types/api'
import { monthDays, monthOf } from '@/shared/utils/date'
import { useFocusDays } from '../services/focus.queries'
import type { FocusDay, FocusDayStatus } from '../types/focus.types'
import { STATUS_CELL_CLASS, STATUS_LABEL } from '../utils/status'
import { formatMinutes } from '../utils/time'

// ---- date-string <-> local Date (react-day-picker works with local Dates) ----

const pad = (n: number) => String(n).padStart(2, '0')
const toLocalDate = (date: DateString) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toDateString = (date: Date): DateString =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const toMonthString = (date: Date): MonthString => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const DaysContext = createContext<Map<DateString, FocusDay>>(new Map())

function FocusDayButton({ day, modifiers, className, ...props }: ComponentProps<typeof CalendarDayButton>) {
  const info = use(DaysContext).get(toDateString(day.date))
  const status: FocusDayStatus = info?.status ?? 'none'

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      title={info && status !== 'none' ? `${STATUS_LABEL[status]} · ${formatMinutes(info.minutes)}` : undefined}
      className={cn(
        'm-0.5 rounded-md disabled:opacity-100',
        STATUS_CELL_CLASS[status],
        modifiers.today && 'ring-2 ring-primary ring-inset',
        'data-[selected-single=true]:ring-2 data-[selected-single=true]:ring-foreground data-[selected-single=true]:ring-offset-2 data-[selected-single=true]:ring-offset-background',
        // Keep the status colour when selected.
        status === 'met' && 'data-[selected-single=true]:bg-success data-[selected-single=true]:text-success-foreground',
        status === 'partial' && 'data-[selected-single=true]:bg-warning/20 data-[selected-single=true]:text-warning',
        status === 'missed' && 'data-[selected-single=true]:bg-destructive/15 data-[selected-single=true]:text-destructive',
        status === 'in-progress' && 'data-[selected-single=true]:bg-primary/15 data-[selected-single=true]:text-primary',
        status === 'rest' && 'data-[selected-single=true]:bg-muted/60 data-[selected-single=true]:text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span className="text-sm font-semibold opacity-100!">{day.date.getDate()}</span>
      {info && info.minutes > 0 && <span className="hidden sm:block">{formatMinutes(info.minutes)}</span>}
    </CalendarDayButton>
  )
}

interface FocusCalendarProps {
  today: DateString
  registeredOn: DateString
  selectedDate: DateString
  onSelect: (date: DateString) => void
}

export function FocusCalendar({ today, registeredOn, selectedDate, onSelect }: FocusCalendarProps) {
  const [month, setMonth] = useState<MonthString>(monthOf(today))
  const dates = monthDays(month)
  const { data } = useFocusDays(dates[0], dates.at(-1)!)
  const byDate = useMemo(() => new Map((data?.days ?? []).map((day) => [day.date, day])), [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus calendar</CardTitle>
        <CardDescription>Pick a day to see its sessions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DaysContext value={byDate}>
          <Calendar
            mode="single"
            required
            weekStartsOn={1}
            showOutsideDays={false}
            month={toLocalDate(`${month}-01`)}
            onMonthChange={(date) => setMonth(toMonthString(date))}
            startMonth={toLocalDate(`${monthOf(registeredOn)}-01`)}
            endMonth={toLocalDate(`${monthOf(today)}-01`)}
            selected={toLocalDate(selectedDate)}
            onSelect={(date) => date && onSelect(toDateString(date))}
            today={toLocalDate(today)}
            disabled={(date) => {
              const value = toDateString(date)
              return value > today || value < registeredOn
            }}
            components={{ DayButton: FocusDayButton }}
            className="w-full p-0 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(12)]"
            classNames={{ root: 'rdp-root w-full' }}
          />
        </DaysContext>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          {(['met', 'partial', 'missed', 'rest'] as FocusDayStatus[]).map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn('size-3 rounded', STATUS_CELL_CLASS[status])} />
              {STATUS_LABEL[status]}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
