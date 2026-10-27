/**
 * Month heatmap built on shadcn's Calendar (react-day-picker). Each day is
 * colour-coded by status and shows "done/total"; days with something to show
 * are selectable for the drill-down.
 */
import { createContext, use, useMemo, type ComponentProps } from 'react'
import { Calendar, CalendarDayButton } from '@/shared/components/ui/calendar'
import { cn } from '@/shared/lib/utils'
import type { DateString, MonthString } from '@/shared/types/api'
import { STATUS_CLASS, STATUS_LABEL } from '../../constants'
import type { CalendarDay, DayStatus } from '../../types/calendar.types'

// ---- date-string <-> local Date (react-day-picker works with local Dates) ----

const pad = (n: number) => String(n).padStart(2, '0')
const toLocalDate = (date: DateString) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toDateString = (date: Date): DateString =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const monthToDate = (month: MonthString) => toLocalDate(`${month}-01`)
const toMonthString = (date: Date): MonthString => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

// Gives the custom day button access to the month's statuses.
const DaysContext = createContext<Map<DateString, CalendarDay>>(new Map())

function StatusDayButton({ day, modifiers, className, ...props }: ComponentProps<typeof CalendarDayButton>) {
  const info = use(DaysContext).get(toDateString(day.date))
  const status: DayStatus = info?.status ?? 'n/a'

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      title={info ? `${STATUS_LABEL[status]}${info.applicable ? ` (${info.completed} of ${info.applicable})` : ''}` : undefined}
      className={cn(
        'rounded-md disabled:opacity-100 lg:aspect-auto lg:h-auto lg:min-h-0',
        STATUS_CLASS[status],
        modifiers.today && 'ring-2 ring-primary ring-inset',
        // Keep the status colour when selected; mark the selection with a ring instead.
        'data-[selected-single=true]:ring-2 data-[selected-single=true]:ring-foreground data-[selected-single=true]:ring-offset-2 data-[selected-single=true]:ring-offset-background',
        status === 'complete' && 'data-[selected-single=true]:bg-success data-[selected-single=true]:text-success-foreground',
        status === 'partial' && 'data-[selected-single=true]:bg-warning/20 data-[selected-single=true]:text-warning',
        status === 'missed' && 'data-[selected-single=true]:bg-destructive/15 data-[selected-single=true]:text-destructive',
        className,
      )}
      {...props}
    >
      <span className="text-sm font-semibold opacity-100!">{day.date.getDate()}</span>
      {info && info.applicable > 0 && (
        <span className="hidden sm:block">
          {info.completed}/{info.applicable}
        </span>
      )}
    </CalendarDayButton>
  )
}

interface CalendarMonthProps {
  days: CalendarDay[]
  today: DateString
  registeredOn: DateString
  month: MonthString
  selectedDate: DateString | null
  onSelect: (date: DateString) => void
  onMonthChange: (month: MonthString) => void
}

export function CalendarMonth({
  days,
  today,
  registeredOn,
  month,
  selectedDate,
  onSelect,
  onMonthChange,
}: CalendarMonthProps) {
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days])

  return (
    <div className="flex flex-col gap-3 lg:min-h-0">
      <DaysContext value={byDate}>
        <Calendar
          mode="single"
          weekStartsOn={1}
          showOutsideDays={false}
          month={monthToDate(month)}
          onMonthChange={(date) => onMonthChange(toMonthString(date))}
          startMonth={monthToDate(registeredOn.slice(0, 7))}
          endMonth={monthToDate(today.slice(0, 7))}
          selected={selectedDate ? toLocalDate(selectedDate) : undefined}
          onSelect={(date) => date && onSelect(toDateString(date))}
          today={toLocalDate(today)}
          // Only days that had something to track can be opened.
          disabled={(date) => {
            const info = byDate.get(toDateString(date))
            return !info || info.applicable === 0 || toDateString(date) > today
          }}
          components={{ DayButton: StatusDayButton }}
          className="w-full rounded-xl border p-3 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(14)] lg:min-h-0 lg:flex-1"
          classNames={{
            root: 'rdp-root w-full lg:flex lg:flex-col',
            // Desktop: month → grid → weeks stretch to fill the card's height
            months: 'relative flex flex-col gap-4 lg:min-h-0 lg:flex-1',
            month: 'flex w-full flex-col gap-4 lg:min-h-0 lg:flex-1',
            month_grid: 'w-full border-collapse lg:flex lg:min-h-0 lg:flex-1 lg:flex-col',
            weeks: 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col',
            // Same gap between columns as between rows; the weekday row matches so columns line up
            weekdays: 'flex gap-1.5',
            week: 'mt-1.5 flex w-full gap-1.5 lg:min-h-0 lg:flex-1',
            day: 'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none lg:aspect-auto lg:flex lg:min-h-0',
          }}
        />
      </DaysContext>

      <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="Legend">
        {(['complete', 'partial', 'missed', 'n/a'] as DayStatus[]).map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('size-3.5 rounded', STATUS_CLASS[status])} />
            {STATUS_LABEL[status]}
          </li>
        ))}
      </ul>
    </div>
  )
}
