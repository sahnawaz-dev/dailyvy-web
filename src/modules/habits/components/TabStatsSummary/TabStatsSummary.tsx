import { Flame, Trophy } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { useTabStats } from '../../services/habits.queries'
import { formatRate } from '../../utils/format'

/**
 * Tab-level stats above the grid. Streaks are tracked per TAB: a day counts
 * when every habit in the tab that applies that day was done.
 */
export function TabStatsSummary({ tabId }: { tabId: string }) {
  const { data: stats } = useTabStats(tabId)
  if (!stats || stats.habitCount === 0) return null

  const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
  const items = [
    {
      label: 'Current streak',
      title: 'Days in a row with every habit in this tab done',
      value: (
        <span className="inline-flex items-center gap-1 text-warning">
          <Flame className="size-4" />
          {days(stats.currentStreak)}
        </span>
      ),
    },
    {
      label: 'Best streak',
      title: 'Longest run of days with every habit in this tab done',
      value: (
        <span className="inline-flex items-center gap-1">
          <Trophy className="size-4 text-warning" />
          {days(stats.longestStreak)}
        </span>
      ),
    },
    { label: 'Avg. completion', title: 'Average completion rate of this tab\'s habits', value: formatRate(stats.averageCompletionRate) },
    { label: 'Habits', title: 'Habits in this tab', value: stats.habitCount },
  ]

  return (
    <dl className="flex flex-wrap gap-2" aria-label="Tab statistics">
      {items.map((item) => (
        <Card key={item.label} size="sm" title={item.title} className="min-w-28 gap-0 px-3 py-2">
          <dt className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="text-lg font-semibold tabular-nums">{item.value}</dd>
        </Card>
      ))}
    </dl>
  )
}
