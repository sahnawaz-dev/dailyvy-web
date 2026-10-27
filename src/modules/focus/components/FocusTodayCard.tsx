/**
 * Compact focus card for the Today page: today's goal progress + one-click
 * start (uses the last chosen length). While a session runs it shows the
 * countdown with pause / resume, and a pen to edit the goal right here.
 * Everything else lives on the Focus page.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Coffee, Flame, Pause, Pencil, Play } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useLiveFocusMinutes } from '../hooks/useLiveFocusMinutes'
import { useLiveSession } from '../hooks/useLiveSession'
import {
  useFocusSettings,
  useFocusSummary,
  usePauseSession,
  useResumeSession,
  useStartSession,
} from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'
import { primeAlerts } from '../utils/alerts'
import { formatClock, formatMinutes } from '../utils/time'
import { FocusSettingsDialog } from './FocusSettingsDialog'
import { ProgressRing } from '@/shared/components/ProgressRing'

export function FocusTodayCard() {
  const { data: summary } = useFocusSummary()
  const { session, elapsedSeconds, remainingSeconds } = useLiveSession()
  const live = useLiveFocusMinutes(summary?.today)
  const duration = useFocusUiStore((state) => state.duration)
  const onBreak = useFocusUiStore((state) => Boolean(state.breakEndsAt))
  const start = useStartSession()
  const pause = usePauseSession()
  const resume = useResumeSession()
  const settings = useFocusSettings()
  const [editingGoal, setEditingGoal] = useState(false)

  if (!summary) return <Skeleton className="h-56 rounded-xl" />

  const goal = summary.goal.dailyGoalMinutes
  const done = summary.totals.today + live
  const restDay = !summary.goal.isFocusDay
  const met = !restDay && done >= goal

  const status = restDay
    ? 'Rest day — focus time still counts'
    : met
      ? 'Goal reached 🎯'
      : `${formatMinutes(goal - done)} to go`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus</CardTitle>
        <CardDescription>{restDay ? 'No goal today' : `Goal: ${formatMinutes(goal)}`}</CardDescription>
        <CardAction className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditingGoal(true)}
            disabled={!settings.data}
            aria-label="Edit focus goal"
            title="Edit focus goal"
          >
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/focus" aria-label="Open the Focus page" title="Open Focus">
              <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        {session ? (
          <ProgressRing
            value={elapsedSeconds / (session.plannedMinutes * 60)}
            size={104}
            stroke={9}
            label="Session progress"
            className={session.status === 'paused' ? 'text-muted-foreground' : undefined}
          >
            <span className="font-heading text-xl font-semibold tabular-nums">{formatClock(remainingSeconds)}</span>
          </ProgressRing>
        ) : (
          <ProgressRing
            value={restDay ? (done > 0 ? 1 : 0) : done / goal}
            size={104}
            stroke={9}
            label="Today's focus goal"
            className={met ? 'text-success' : undefined}
          >
            <span className="font-heading text-lg font-semibold tabular-nums">{formatMinutes(done)}</span>
          </ProgressRing>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {session ? (
            <>
              <p className="truncate text-sm font-medium">{session.label ?? `${session.plannedMinutes}-minute session`}</p>
              {session.status === 'paused' ? (
                <Button size="sm" className="self-start" onClick={() => resume.mutate(session.id)} disabled={resume.isPending}>
                  <Play />
                  Resume
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="self-start" onClick={() => pause.mutate(session.id)} disabled={pause.isPending}>
                  <Pause />
                  Pause
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium">{status}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="size-3.5 text-warning" />
                {summary.currentStreak}-day streak
              </p>
              {onBreak ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Coffee className="size-4" />
                  On a break
                </p>
              ) : (
                <Button
                  size="sm"
                  className="self-start"
                  disabled={start.isPending}
                  onClick={() => {
                    primeAlerts() // inside the click: unlocks the chime + asks for notifications once
                    start.mutate({ plannedMinutes: duration, label: null, link: null })
                  }}
                >
                  <Play />
                  Start {duration}-min focus
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
      {editingGoal && settings.data && (
        <FocusSettingsDialog settings={settings.data} onClose={() => setEditingGoal(false)} />
      )}
    </Card>
  )
}
