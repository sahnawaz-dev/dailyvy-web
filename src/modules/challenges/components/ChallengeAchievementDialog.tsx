/**
 * The "you did it" moment when a challenge reaches its goal: a glowing trophy,
 * confetti, what was achieved — and the only two ways forward:
 *  - keep going (extend to 45 / 90 / custom days, progress kept), or
 *  - finish and claim the trophy → then "Start a new challenge".
 */
import { useState } from 'react'
import { CalendarClock, Flame, Plus, Share2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { formatDisplay } from '@/shared/utils/date'
import { PRESET_LENGTHS } from '../constants'
import { useExtendChallenge, useFinishChallenge } from '../services/challenges.queries'
import type { ActiveChallenge } from '../types/challenges.types'
import { shareTrophy } from '../utils/trophyImage'

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '🏆', '🌟', '🎉', '✨', '🎊', '⭐', '💪', '🔥']
const longDate = (date: string) => formatDisplay(date, { day: 'numeric', month: 'short' })

interface ChallengeAchievementDialogProps {
  /** The reached challenge (a snapshot — it stays on screen after finishing). */
  challenge: ActiveChallenge
  onClose: () => void
  /** Called as "Finish" is clicked (the parent keeps the dialog open afterwards). */
  onFinishing: () => void
  /** Custom length → the extend dialog. */
  onExtendCustom: () => void
  onStartNew: () => void
}

export function ChallengeAchievementDialog({
  challenge,
  onClose,
  onFinishing,
  onExtendCustom,
  onStartNew,
}: ChallengeAchievementDialogProps) {
  const [claimed, setClaimed] = useState(false)
  const finish = useFinishChallenge()
  const extend = useExtendChallenge()
  const restarts = challenge.attempts - 1
  const longer = PRESET_LENGTHS.filter((days) => days > challenge.lengthDays)
  const label = `${challenge.icon ? `${challenge.icon} ` : ''}${challenge.title}`
  const busy = finish.isPending || extend.isPending
  const [sharing, setSharing] = useState(false)

  /** Share sheet on phones; elsewhere the image is downloaded. */
  const share = async () => {
    setSharing(true)
    try {
      const result = await shareTrophy({ ...challenge, status: 'completed' })
      if (result === 'downloaded') toast.success('Trophy image saved. Share it anywhere!')
    } catch {
      toast.error("Couldn't create the image. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        {/* Confetti falling through the card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {CONFETTI.map((piece, i) => (
            <span
              key={i}
              className="absolute -top-10 animate-confetti-fall text-xl motion-reduce:hidden"
              style={{ left: `${4 + i * 8}%`, animationDelay: `${i * 90}ms` }}
            >
              {piece}
            </span>
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-4 pt-2 text-center">
          {/* Glowing trophy */}
          <div className="relative grid size-28 place-items-center">
            <span className="absolute inset-0 rounded-full bg-warning/25 blur-2xl motion-safe:animate-pulse" />
            <span className="relative grid size-24 place-items-center rounded-full bg-linear-to-br from-warning/30 to-warning/5 ring-1 ring-warning/40 duration-500 animate-in zoom-in-50">
              <Trophy className="size-12 text-warning drop-shadow-[0_0_12px_var(--warning)]" />
            </span>
          </div>

          {claimed ? (
            <>
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-2xl">Trophy claimed! 🏆</DialogTitle>
                <DialogDescription>
                  “{challenge.title}” is in your past challenges forever. Ready to prove it again with something new?
                </DialogDescription>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button size="lg" onClick={onStartNew}>
                  <Plus />
                  Start a new challenge
                </Button>
                <Button variant="outline" onClick={share} disabled={sharing}>
                  {sharing ? <Spinner /> : <Share2 />}
                  Share my trophy
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Maybe later
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold tracking-widest text-warning uppercase">Challenge complete</p>
                <DialogTitle className="text-2xl">
                  {challenge.lengthDays} days. You did it!
                </DialogTitle>
                <p className="font-medium">{label}</p>
                <DialogDescription>
                  You kept your promise to yourself every single day. That's how habits are built.
                </DialogDescription>
              </div>

              <dl className="grid w-full grid-cols-3 gap-2">
                <Stat label="In a row" value={`${challenge.lengthDays} days`} />
                <Stat
                  label="Journey"
                  value={`${longDate(challenge.startDate)} → ${longDate(challenge.reachedOn ?? challenge.today)}`}
                />
                <Stat label={restarts > 0 ? 'Comebacks' : 'Attempts'} value={restarts > 0 ? String(restarts) : 'First try!'} />
              </dl>
              {restarts > 0 && (
                <p className="-mt-1 text-sm text-muted-foreground">
                  You fell {restarts === 1 ? 'once' : `${restarts} times`} and got back up. That's the real win.
                </p>
              )}

              <div className="flex w-full flex-col gap-2">
                <Button
                  size="lg"
                  disabled={busy}
                  onClick={() => {
                    onFinishing()
                    finish.mutate(undefined, { onSuccess: () => setClaimed(true) })
                  }}
                >
                  {finish.isPending ? <Spinner /> : <Trophy />}
                  Finish and claim my trophy
                </Button>

                {challenge.canExtend && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 flex items-center justify-center gap-1.5 text-sm font-medium">
                      <Flame className="size-4 text-warning" />
                      Not done yet? Keep going
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {longer.map((days) => (
                        <Button
                          key={days}
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => extend.mutate(days, { onSuccess: onClose })}
                        >
                          <CalendarClock />
                          {days} days
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" disabled={busy} onClick={onExtendCustom}>
                        Custom…
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your {challenge.lengthDays} days count. Same rules: every day, no misses.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  )
}
