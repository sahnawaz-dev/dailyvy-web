/**
 * The main card of the Focus page. Shows one of:
 *  - the running / paused session (countdown, pause / resume, end early)
 *  - the break after a session (countdown, skip)
 *  - the start form (duration + "Focusing on…"), with a break offer after a session
 */
import { useState } from 'react'
import { Coffee, Pause, Play, Square, Target, X } from 'lucide-react'
import { ConfirmDialog } from '@/shared/components'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Spinner } from '@/shared/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { BREAK_MINUTES, FOCUS_DURATIONS, MIN_CREDIT_MINUTES, type FocusDuration } from '../constants'
import { useFocusOptions } from '../hooks/useFocusOptions'
import { useLiveSession } from '../hooks/useLiveSession'
import { useNow } from '../hooks/useNow'
import { useEndSession, usePauseSession, useResumeSession, useStartSession } from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'
import { primeAlerts } from '../utils/alerts'
import { NO_FOCUS_CHOICE, resolveFocusChoice } from '../utils/focusChoice'
import { formatClock, formatMinutes } from '../utils/time'
import { FocusLabelPicker } from './FocusLabelPicker'
import { ProgressRing } from '@/shared/components/ProgressRing'

export function FocusTimerCard() {
  const live = useLiveSession()
  const breakEndsAt = useFocusUiStore((state) => state.breakEndsAt)

  if (live.session) return <ActiveSession {...live} session={live.session} />
  if (breakEndsAt) return <BreakTimer endsAt={breakEndsAt} />
  return <StartSession />
}

// ---- Running / paused --------------------------------------------------------------

function ActiveSession({
  session,
  elapsedSeconds,
  remainingSeconds,
}: ReturnType<typeof useLiveSession> & { session: NonNullable<ReturnType<typeof useLiveSession>['session']> }) {
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const pause = usePauseSession()
  const resume = useResumeSession()
  const end = useEndSession()
  const paused = session.status === 'paused'
  const focusedMinutes = Math.floor(elapsedSeconds / 60)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{paused ? 'Paused' : 'Focusing'}</CardTitle>
        <CardDescription className="truncate">{session.label ?? `${session.plannedMinutes}-minute session`}</CardDescription>
        <CardAction>
          <Badge variant={paused ? 'secondary' : 'default'}>{session.plannedMinutes} min</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ProgressRing
          value={elapsedSeconds / (session.plannedMinutes * 60)}
          size={220}
          label="Session progress"
          className={paused ? 'text-muted-foreground' : undefined}
        >
          <span className="font-heading text-5xl font-semibold tabular-nums" aria-live="off">
            {formatClock(remainingSeconds)}
          </span>
          <span className="text-sm text-muted-foreground">{paused ? 'paused' : 'remaining'}</span>
        </ProgressRing>
      </CardContent>
      <CardFooter className="justify-center gap-2">
        {paused ? (
          <Button size="lg" onClick={() => resume.mutate(session.id)} disabled={resume.isPending}>
            <Play />
            Resume
          </Button>
        ) : (
          <Button size="lg" onClick={() => pause.mutate(session.id)} disabled={pause.isPending}>
            <Pause />
            Pause
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => setConfirmingEnd(true)}>
          <Square />
          End early
        </Button>
      </CardFooter>

      <ConfirmDialog
        open={confirmingEnd}
        title="Stop focusing now?"
        message={
          focusedMinutes >= MIN_CREDIT_MINUTES
            ? `You've focused for ${formatMinutes(focusedMinutes)}. Great work! Stay a little longer and finish strong. If you stop now, this time still counts toward today.`
            : `You're ${formatMinutes(focusedMinutes)} in. Sessions under ${MIN_CREDIT_MINUTES} minutes don't count, so push through. The hardest minutes are the first ones.`
        }
        keepFirst
        icon={<Target />}
        iconClassName="bg-primary/15 text-primary"
        cancelLabel="🎯 Keep focusing"
        confirmLabel="End session now"
        loading={end.isPending}
        onCancel={() => setConfirmingEnd(false)}
        onConfirm={() => end.mutate(session.id, { onSettled: () => setConfirmingEnd(false) })}
      />
    </Card>
  )
}

// ---- Break -----------------------------------------------------------------------

function BreakTimer({ endsAt }: { endsAt: number }) {
  const now = useNow(true)
  const endBreak = useFocusUiStore((state) => state.endBreak)
  const remaining = Math.max(0, (endsAt - now) / 1000)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="size-4 text-primary" />
          Break
        </CardTitle>
        <CardDescription>Stand up, stretch, drink some water. Breaks don't count as focus time.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ProgressRing
          value={1 - remaining / (BREAK_MINUTES * 60)}
          size={220}
          label="Break progress"
          className="text-success"
        >
          <span className="font-heading text-5xl font-semibold tabular-nums">{formatClock(remaining)}</span>
          <span className="text-sm text-muted-foreground">break left</span>
        </ProgressRing>
      </CardContent>
      <CardFooter className="justify-center">
        <Button size="lg" variant="outline" onClick={endBreak}>
          Skip break
        </Button>
      </CardFooter>
    </Card>
  )
}

// ---- Start -------------------------------------------------------------------------

function StartSession() {
  const duration = useFocusUiStore((state) => state.duration)
  const setDuration = useFocusUiStore((state) => state.setDuration)
  const justCompleted = useFocusUiStore((state) => state.justCompleted)
  const setJustCompleted = useFocusUiStore((state) => state.setJustCompleted)
  const startBreak = useFocusUiStore((state) => state.startBreak)

  const [choice, setChoice] = useState(NO_FOCUS_CHOICE)
  const options = useFocusOptions()
  const start = useStartSession()

  const handleStart = () => {
    primeAlerts() // inside the click: unlocks the chime + asks for notifications once
    setJustCompleted(null)
    const { label, link } = resolveFocusChoice(choice, [...options.tasks, ...options.habits])
    start.mutate({ plannedMinutes: duration, label, link }, { onSuccess: () => setChoice(NO_FOCUS_CHOICE) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a focus session</CardTitle>
        <CardDescription>Pick a length and get to work. Pause any time; ending early still counts.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {justCompleted && (
            <Alert>
              <Coffee />
              <AlertTitle>Nice work — {formatMinutes(justCompleted.minutes)} added to today!</AlertTitle>
              <AlertDescription>Take a {BREAK_MINUTES}-minute break before the next one?</AlertDescription>
              <AlertAction className="flex gap-1">
                <Button size="sm" onClick={startBreak}>
                  Start break
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="No break" onClick={() => setJustCompleted(null)}>
                  <X />
                </Button>
              </AlertAction>
            </Alert>
          )}

          <Field>
            <FieldLabel>Length</FieldLabel>
            <ToggleGroup
              type="single"
              value={String(duration)}
              onValueChange={(value) => value && setDuration(Number(value) as FocusDuration)}
              aria-label="Session length"
              className="grid w-full grid-cols-4 gap-2"
            >
              {FOCUS_DURATIONS.map((minutes) => (
                <ToggleGroupItem
                  key={minutes}
                  value={String(minutes)}
                  className="h-auto flex-col rounded-lg border py-3 data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:ring-2 data-[state=on]:ring-primary/20"
                >
                  <span className="font-heading text-xl font-semibold tabular-nums">{minutes}</span>
                  <span className="text-xs text-muted-foreground">min</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          <FocusLabelPicker value={choice} onChange={setChoice} tasks={options.tasks} habits={options.habits} />
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={handleStart} disabled={start.isPending}>
          {start.isPending ? <Spinner /> : <Play />}
          Start {duration}-minute focus
        </Button>
      </CardFooter>
    </Card>
  )
}
