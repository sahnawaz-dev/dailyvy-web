/**
 * "Give up?" — tries to talk the user out of it: an encouraging message based on
 * how far they've come, "Keep going" as the big primary button, and quitting as
 * a small, slightly uncomfortable text button.
 */
import { Flame } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import type { ActiveChallenge } from '../types/challenges.types'

interface GiveUpChallengeDialogProps {
  challenge: ActiveChallenge
  open: boolean
  loading: boolean
  onKeepGoing: () => void
  onGiveUp: () => void
}

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

/** A nudge that fits how far they've come. */
function encouragement({ doneCount, daysLeft, lengthDays }: ActiveChallenge) {
  if (doneCount === 0) {
    return 'Day 1 is always the hardest. Show up today, and tomorrow gets easier. You started this for a reason.'
  }
  if (daysLeft <= 3) {
    return `Only ${days(daysLeft)} left! You're so close to the finish line. Don't let ${days(doneCount)} of effort slip away now.`
  }
  if (doneCount * 2 >= lengthDays) {
    return `You're past halfway: ${doneCount} of ${lengthDays} days done. The hardest part is behind you. Finish what you started.`
  }
  return `You've shown up ${days(doneCount)} in a row. Every champion felt like quitting at some point; the ones who won kept going.`
}

export function GiveUpChallengeDialog({ challenge, open, loading, onKeepGoing, onGiveUp }: GiveUpChallengeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onKeepGoing()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-warning/15 text-warning">
            <Flame />
          </AlertDialogMedia>
          <AlertDialogTitle>Don't break your promise now</AlertDialogTitle>
          <AlertDialogDescription>
            {encouragement(challenge)}
            <span className="mt-2 block">
              Giving up ends “{challenge.title}” for good, and your progress stops here.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-col-reverse sm:items-stretch">
          <AlertDialogAction
            variant="ghost"
            size="sm"
            disabled={loading}
            className="text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              // Stay open until it's done (the parent closes it)
              event.preventDefault()
              onGiveUp()
            }}
          >
            {loading && <Spinner />}
            I give up on myself
          </AlertDialogAction>
          <AlertDialogCancel variant="default" size="lg" autoFocus disabled={loading}>
            💪 Keep going. I've got this!
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
