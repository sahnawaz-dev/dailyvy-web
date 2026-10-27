/** The four headline numbers of the week, each compared with last week. */
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { formatDisplay } from '@/shared/utils/date'
import type { WeeklyInsights } from '../types/insights.types'
import { amountTrend, formatMinutes, percent, rateTrend, type Trend } from '../utils/format'

function TrendLine({ trend }: { trend: Trend }) {
  if (!trend) return <span className="text-xs text-muted-foreground">first week to compare</span>
  const Icon = trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : ArrowRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs',
        trend.direction === 'up' && 'text-success',
        trend.direction === 'down' && 'text-muted-foreground',
        trend.direction === 'same' && 'text-muted-foreground',
      )}
    >
      <Icon className="size-3.5" />
      {trend.text}
    </span>
  )
}

function Tile({ label, value, hint, children }: { label: string; value: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <Card size="sm" className="gap-1 px-4 py-3" title={hint}>
      <dt className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {children}
      </dd>
    </Card>
  )
}

export function SummaryTiles({ week }: { week: WeeklyInsights }) {
  const { habits, focus, tasks, bestDay, previous } = week
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="This week at a glance">
      <Tile
        label="Habits done"
        value={percent(habits.rate)}
        hint="Habits done out of those due (skipped days don't count)"
      >
        <span className="text-xs text-muted-foreground">
          {habits.done} of {habits.due} check-ins
        </span>
        <TrendLine trend={rateTrend(habits.rate, previous.habitRate)} />
      </Tile>
      <Tile label="Focus time" value={formatMinutes(focus.minutes)} hint="Time spent in focus sessions">
        <span className="text-xs text-muted-foreground">
          Goal met on {focus.goalDaysMet} of {focus.focusDays} focus days
        </span>
        <TrendLine trend={amountTrend(focus.minutes, previous.focusMinutes, formatMinutes)} />
      </Tile>
      <Tile label="Tasks done" value={tasks.completed} hint="One-off tasks completed">
        <span className="text-xs text-muted-foreground">of {tasks.total} planned</span>
        <TrendLine trend={amountTrend(tasks.completed, previous.tasksCompleted)} />
      </Tile>
      <Tile
        label="Best day"
        value={bestDay ? formatDisplay(bestDay.date, { weekday: 'long' }) : '—'}
        hint="The day you did the biggest share of your habits"
      >
        <span className="text-xs text-muted-foreground">
          {bestDay
            ? `${bestDay.done} of ${bestDay.due} habits${bestDay.focusMinutes ? ` · ${formatMinutes(bestDay.focusMinutes)} focus` : ''}`
            : 'Check off a habit to get one'}
        </span>
      </Tile>
    </dl>
  )
}
