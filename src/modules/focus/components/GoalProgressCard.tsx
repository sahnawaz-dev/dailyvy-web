/**
 * Today's focus vs the daily goal: done, remaining, and the focus streak.
 * Includes the running session live.
 */
import { Flame, Settings2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useLiveFocusMinutes } from '../hooks/useLiveFocusMinutes'
import { useFocusSummary } from '../services/focus.queries'
import { formatMinutes } from '../utils/time'
import { ProgressRing } from '@/shared/components/ProgressRing'

export function GoalProgressCard({ onEditGoal }: { onEditGoal: () => void }) {
  const { data: summary } = useFocusSummary()
  const live = useLiveFocusMinutes(summary?.today)

  if (!summary) return <Skeleton className="h-80 rounded-xl" />

  const goal = summary.goal.dailyGoalMinutes
  const done = summary.totals.today + live
  const restDay = !summary.goal.isFocusDay
  const met = !restDay && done >= goal

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's goal</CardTitle>
        <CardDescription>{restDay ? 'Rest day' : `${formatMinutes(goal)} of focus`}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={onEditGoal} aria-label="Edit focus goal" title="Edit goal">
            <Settings2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ProgressRing
          value={restDay ? (done > 0 ? 1 : 0) : done / goal}
          label="Today's focus goal"
          className={met ? 'text-success' : restDay ? 'text-muted-foreground' : undefined}
        >
          <span className="font-heading text-3xl font-semibold tabular-nums">{formatMinutes(done)}</span>
          <span className="text-sm text-muted-foreground">{restDay ? 'focused today' : `of ${formatMinutes(goal)}`}</span>
        </ProgressRing>

        <p className="text-center text-sm font-medium">
          {restDay
            ? 'No goal today — focus time still counts.'
            : met
              ? 'Goal reached 🎯'
              : `${formatMinutes(goal - done)} to go`}
        </p>

        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="size-4 text-warning" />
          <span>
            <span className="font-semibold text-foreground tabular-nums">{summary.currentStreak}</span>-day focus streak
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
