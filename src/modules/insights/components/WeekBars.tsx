/**
 * The week day by day: a bar per day showing the share of habits done (theme
 * colour; green when all done), with the focus minutes underneath. Skipped
 * habits are noted; future days are greyed out.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { WEEKDAY_SHORT, formatDisplay } from '@/shared/utils/date'
import type { WeeklyInsights } from '../types/insights.types'
import { formatMinutes } from '../utils/format'

export function WeekBars({ week }: { week: WeeklyInsights }) {
  const focusByDate = new Map(week.focus.daily.map((d) => [d.date, d.minutes]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day by day</CardTitle>
        <CardDescription>Share of habits done each day, with your focus time below.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-7 gap-2" aria-label="Habits done per day">
          {week.habits.daily.map((day, index) => {
            const share = day.due > 0 ? day.done / day.due : 0
            const minutes = focusByDate.get(day.date) ?? 0
            const isToday = day.date === week.today
            const label = day.future
              ? 'upcoming'
              : day.due === 0
                ? 'nothing due'
                : `${day.done} of ${day.due} habits done`
            return (
              <li
                key={day.date}
                className="flex flex-col items-center gap-1.5"
                title={`${formatDisplay(day.date, { weekday: 'long', day: 'numeric', month: 'short' })}: ${label}${
                  day.skipped ? ` · ${day.skipped} skipped` : ''
                }${minutes ? ` · ${formatMinutes(minutes)} focus` : ''}`}
              >
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {day.future || day.due === 0 ? '–' : `${Math.round(share * 100)}%`}
                </span>
                <div
                  className={cn(
                    'relative flex h-32 w-full max-w-10 items-end overflow-hidden rounded-md bg-muted/50',
                    day.future && 'opacity-40',
                  )}
                >
                  {share > 0 && (
                    <div
                      className={cn(
                        'w-full rounded-md transition-[height] duration-500',
                        share === 1 ? 'bg-success' : 'bg-primary',
                      )}
                      style={{ height: `${share * 100}%` }}
                    />
                  )}
                </div>
                <span className={cn('text-xs', isToday ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                  {WEEKDAY_SHORT[index]}
                </span>
                <span className="text-[0.7rem] tabular-nums text-muted-foreground">
                  {minutes ? formatMinutes(minutes) : '·'}
                </span>
                {day.skipped > 0 && (
                  <span className="text-[0.65rem] text-muted-foreground">⏭ {day.skipped}</span>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
