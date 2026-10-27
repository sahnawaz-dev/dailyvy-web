/**
 * Focus stat tiles, in two sets so the page stays simple:
 *  - 'main' (always visible): today, this week, current streak, best streak
 *  - 'more' (inside History):  yesterday, this month, best day, average per focus day
 * Today, week and month include the running session live.
 */
import type { ReactNode } from 'react'
import { Flame, Trophy } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatDisplay } from '@/shared/utils/date'
import { useLiveFocusMinutes } from '../hooks/useLiveFocusMinutes'
import { useFocusSummary } from '../services/focus.queries'
import { formatMinutes } from '../utils/time'

interface Stat {
  label: string
  title: string
  value: ReactNode
}

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

export function FocusStats({ show }: { show: 'main' | 'more' }) {
  const { data: summary } = useFocusSummary()
  const live = useLiveFocusMinutes(summary?.today)

  if (!summary) return <Skeleton className="h-16 rounded-xl" />

  const { totals } = summary
  const items: Stat[] =
    show === 'main'
      ? [
          { label: 'Today', title: 'Focus time today', value: formatMinutes(totals.today + live) },
          { label: 'This week', title: 'Focus time since Monday', value: formatMinutes(totals.week + live) },
          {
            label: 'Current streak',
            title: 'Focus days in a row on which you reached your goal (rest days are skipped)',
            value: (
              <span className="inline-flex items-center gap-1 text-warning">
                <Flame className="size-4" />
                {days(summary.currentStreak)}
              </span>
            ),
          },
          {
            label: 'Best streak',
            title: 'Your longest run of focus days with the goal reached',
            value: (
              <span className="inline-flex items-center gap-1">
                <Trophy className="size-4 text-warning" />
                {days(summary.longestStreak)}
              </span>
            ),
          },
        ]
      : [
          { label: 'Yesterday', title: 'Focus time yesterday', value: formatMinutes(totals.yesterday) },
          { label: 'This month', title: 'Focus time this month', value: formatMinutes(totals.month + live) },
          {
            label: 'Best day',
            title: 'Your day with the most focus time',
            value: summary.bestDay ? (
              <span>
                {formatMinutes(summary.bestDay.minutes)}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  {formatDisplay(summary.bestDay.date, { day: 'numeric', month: 'short' })}
                </span>
              </span>
            ) : (
              '—'
            ),
          },
          {
            label: 'Avg. per focus day',
            title: 'Average focus time on your focus days, last 30 days',
            value: summary.averagePerFocusDay === null ? '—' : formatMinutes(summary.averagePerFocusDay),
          },
        ]

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={show === 'main' ? 'Focus stats' : 'More focus stats'}>
      {items.map((item) => (
        <Card key={item.label} size="sm" title={item.title} className="gap-0 px-3 py-2">
          <dt className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="text-lg font-semibold tabular-nums">{item.value}</dd>
        </Card>
      ))}
    </dl>
  )
}
