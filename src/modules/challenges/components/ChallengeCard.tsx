/**
 * The challenge at the top of the Today page:
 *  - none: an invitation to take one
 *  - running: progress ring, "Day N of M", days left, a big "Done today" button,
 *    the late-tick prompt for yesterday (until 10:00) and a note after a restart
 *  - goal reached: the achievement dialog opens (once by itself, then from
 *    "View your trophy") — that's where the user finishes or extends
 */
import { useState } from 'react'
import { CalendarClock, Check, Flame, History, Plus, RotateCcw, Trophy, Undo2 } from 'lucide-react'
import { ProgressRing } from '@/shared/components/ProgressRing'
import { Alert, AlertAction, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Spinner } from '@/shared/components/ui/spinner'
import { formatDisplay } from '@/shared/utils/date'
import { useAbandonChallenge, useCurrentChallenge, useTickChallenge } from '../services/challenges.queries'
import type { ActiveChallenge } from '../types/challenges.types'
import { ChallengeAchievementDialog } from './ChallengeAchievementDialog'
import { ChallengeHistoryDialog } from './ChallengeHistoryDialog'
import { ExtendChallengeDialog } from './ExtendChallengeDialog'
import { GiveUpChallengeDialog } from './GiveUpChallengeDialog'
import { StartChallengeDialog } from './StartChallengeDialog'

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
const shortDate = (date: string) => formatDisplay(date, { weekday: 'short', day: 'numeric', month: 'short' })

/** The achievement dialog opens by itself once per challenge (remembered in this browser). */
const celebratedKey = (id: string) => `dailyvy.challenge.celebrated.${id}`
function wasCelebrated(id: string) {
  try {
    return localStorage.getItem(celebratedKey(id)) === '1'
  } catch {
    return false
  }
}
function markCelebrated(id: string) {
  try {
    localStorage.setItem(celebratedKey(id), '1')
  } catch {
    // storage blocked: it may open again next time — harmless
  }
}

export function ChallengeCard() {
  const current = useCurrentChallenge()
  const [starting, setStarting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  // Opened from "View your trophy" — or pinned while finishing, so the dialog stays
  // open after "Finish" clears the active challenge
  const [achievement, setAchievement] = useState<ActiveChallenge | null>(null)
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const [extending, setExtending] = useState<ActiveChallenge | null>(null)

  // Goal reached (here by ticking, or on another device): the achievement opens by itself once
  const reached = current.data?.reachedOn ? current.data : null
  const autoOpen = reached && reached.id !== dismissedId && !wasCelebrated(reached.id) ? reached : null
  const shownAchievement = achievement ?? autoOpen
  const closeAchievement = () => {
    if (shownAchievement) {
      markCelebrated(shownAchievement.id)
      setDismissedId(shownAchievement.id)
    }
    setAchievement(null)
  }

  if (current.isPending) return <Skeleton className="h-28 rounded-xl" />
  if (current.isError) return null // the rest of Today still works

  const challenge = current.data
  return (
    <>
      {challenge ? (
        <ActiveChallengeCard
          challenge={challenge}
          onShowHistory={() => setShowHistory(true)}
          onShowAchievement={() => setAchievement(challenge)}
          onExtend={() => setExtending(challenge)}
        />
      ) : (
        <Card size="sm">
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning/15 text-warning">
              <Flame className="size-5" />
            </span>
            <div className="min-w-48 flex-1">
              <p className="font-semibold">Take a challenge</p>
              <p className="text-sm text-muted-foreground">
                21, 45 or 90 days — every day, no excuses. Miss one and it starts again.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowHistory(true)}>
              <History />
              Past challenges
            </Button>
            <Button onClick={() => setStarting(true)}>
              <Plus />
              Start a challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {starting && <StartChallengeDialog onClose={() => setStarting(false)} />}
      {showHistory && <ChallengeHistoryDialog onClose={() => setShowHistory(false)} />}
      {shownAchievement && (
        <ChallengeAchievementDialog
          challenge={shownAchievement}
          onClose={closeAchievement}
          onFinishing={() => setAchievement(shownAchievement)}
          onExtendCustom={() => {
            setExtending(shownAchievement)
            closeAchievement()
          }}
          onStartNew={() => {
            closeAchievement()
            setStarting(true)
          }}
        />
      )}
      {extending && <ExtendChallengeDialog challenge={extending} onClose={() => setExtending(null)} />}
    </>
  )
}

interface ActiveChallengeCardProps {
  challenge: ActiveChallenge
  onShowHistory: () => void
  onShowAchievement: () => void
  onExtend: () => void
}

function ActiveChallengeCard({ challenge, onShowHistory, onShowAchievement, onExtend }: ActiveChallengeCardProps) {
  const tick = useTickChallenge()
  const abandon = useAbandonChallenge()
  const [confirmGiveUp, setConfirmGiveUp] = useState(false)

  const reached = challenge.reachedOn !== null
  const label = `${challenge.icon ? `${challenge.icon} ` : ''}${challenge.title}`

  const setDay = (date: string, done: boolean) => tick.mutate({ date, done })

  return (
    <Card size="sm" className="ring-warning/25">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ProgressRing
            value={challenge.doneCount / challenge.lengthDays}
            size={84}
            stroke={8}
            className={reached ? 'text-success' : 'text-warning'}
            label={`${challenge.doneCount} of ${challenge.lengthDays} days done`}
          >
            {reached ? (
              <Trophy className="size-7 text-warning" />
            ) : (
              <>
                <span className="text-xl leading-none font-bold tabular-nums">{challenge.doneCount}</span>
                <span className="text-[0.65rem] text-muted-foreground">of {challenge.lengthDays}</span>
              </>
            )}
          </ProgressRing>

          <div className="min-w-48 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-warning uppercase">
              <Flame className="size-3.5" />
              {reached ? 'Challenge reached' : `${challenge.lengthDays}-day challenge`}
            </p>
            <p className="truncate text-lg font-semibold" title={label}>
              {label}
            </p>
            <p className="text-sm text-muted-foreground">
              {reached
                ? `You did it — ${days(challenge.lengthDays)} in a row!`
                : `Day ${challenge.dayNumber} of ${challenge.lengthDays} · ${days(challenge.daysLeft)} left`}
              {challenge.attempts > 1 && ` · Attempt ${challenge.attempts} · Best ${days(challenge.bestDays)}`}
            </p>
          </div>

          {reached ? (
            <Button size="lg" onClick={onShowAchievement}>
              <Trophy />
              View your trophy
            </Button>
          ) : challenge.todayDone ? (
            <Button
              variant="outline"
              size="lg"
              // Follows the colour theme (like the rest of the card's actions)
              className="border-primary/40 text-primary hover:text-primary"
              disabled={tick.isPending}
              onClick={() => setDay(challenge.today, false)}
              title="Ticked by mistake? Undo"
            >
              <Check />
              Done for today
              <Undo2 className="opacity-60" />
            </Button>
          ) : (
            <Button size="lg" disabled={tick.isPending} onClick={() => setDay(challenge.today, true)}>
              {tick.isPending ? <Spinner /> : <Check />}
              Done today
            </Button>
          )}
        </div>

        {challenge.yesterdayOpen && (
          <Alert className="border-warning/40">
            <CalendarClock className="text-warning" />
            <AlertDescription>
              Yesterday ({shortDate(challenge.yesterday)}) isn't ticked. If you did it, tick it before{' '}
              {challenge.lateTickUntil} — otherwise the challenge starts again.
            </AlertDescription>
            <AlertAction>
              <Button size="sm" disabled={tick.isPending} onClick={() => setDay(challenge.yesterday, true)}>
                Done yesterday
              </Button>
            </AlertAction>
          </Alert>
        )}

        {challenge.recentRestart && !reached && (
          <Alert>
            <RotateCcw />
            <AlertDescription>
              You missed {shortDate(challenge.recentRestart.missedOn)}, so the challenge started again. You made it{' '}
              {days(challenge.recentRestart.daysDone)} — your best is {days(challenge.bestDays)}. Go again!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap justify-end gap-1">
          <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onShowHistory}>
            <History />
            Past challenges
          </Button>
          {!reached && (
            <>
              <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onExtend}>
                <CalendarClock />
                Extend
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmGiveUp(true)}
              >
                Give up
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <GiveUpChallengeDialog
        challenge={challenge}
        open={confirmGiveUp}
        loading={abandon.isPending}
        onKeepGoing={() => setConfirmGiveUp(false)}
        onGiveUp={() => abandon.mutate(undefined, { onSuccess: () => setConfirmGiveUp(false) })}
      />
    </Card>
  )
}
