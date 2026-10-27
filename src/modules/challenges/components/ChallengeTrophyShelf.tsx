/**
 * Insights: completed challenges as a trophy shelf (each can be shared as an
 * image), plus the challenge in progress.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import { Flame, Share2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { ProgressRing } from '@/shared/components/ProgressRing'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Spinner } from '@/shared/components/ui/spinner'
import { formatDisplay } from '@/shared/utils/date'
import { useChallengeHistory, useCurrentChallenge } from '../services/challenges.queries'
import type { ChallengeBase } from '../types/challenges.types'
import { shareTrophy } from '../utils/trophyImage'

export function ChallengeTrophyShelf() {
  const history = useChallengeHistory()
  const current = useCurrentChallenge()
  const trophies = history.data?.filter((c) => c.status === 'completed') ?? []
  const active = current.data && !current.data.reachedOn ? current.data : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-warning" />
          Challenge trophies
        </CardTitle>
        <CardDescription>
          {trophies.length > 0
            ? `${trophies.length} ${trophies.length === 1 ? 'challenge' : 'challenges'} completed. Every one a promise kept.`
            : 'Complete a challenge to earn your first trophy.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {active && (
              <li className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-warning/40 p-4 text-center">
                <ProgressRing
                  value={active.doneCount / active.lengthDays}
                  size={64}
                  stroke={6}
                  className="text-warning"
                  label={`${active.doneCount} of ${active.lengthDays} days`}
                >
                  <Flame className="size-5 text-warning" />
                </ProgressRing>
                <p className="line-clamp-2 text-sm font-medium">{active.title}</p>
                <p className="text-xs text-muted-foreground">
                  In progress · {active.doneCount}/{active.lengthDays} days
                </p>
              </li>
            )}
            {trophies.map((challenge) => (
              <TrophyTile key={challenge.id} challenge={challenge} />
            ))}
            {trophies.length === 0 && !active && (
              <li className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
                <Trophy className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Your shelf is waiting. 21 days is all it takes for your first trophy.
                </p>
                <Button asChild size="sm">
                  <Link to="/today">
                    <Flame />
                    Take a challenge
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function TrophyTile({ challenge }: { challenge: ChallengeBase }) {
  const [sharing, setSharing] = useState(false)
  const finished = challenge.reachedOn ?? challenge.endedAt?.slice(0, 10)

  const share = async () => {
    setSharing(true)
    try {
      const result = await shareTrophy(challenge)
      if (result === 'downloaded') toast.success('Trophy image saved. Share it anywhere!')
    } catch {
      toast.error("Couldn't create the image. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  return (
    <li className="group/trophy flex flex-col items-center gap-2 rounded-xl bg-linear-to-b from-warning/10 to-transparent p-4 text-center ring-1 ring-warning/20">
      <span className="relative grid size-16 place-items-center">
        <span className="absolute inset-1 rounded-full bg-warning/20 blur-md" />
        <Trophy className="relative size-9 text-warning" />
      </span>
      <p className="text-lg leading-none font-bold">{challenge.lengthDays} days</p>
      <p className="line-clamp-2 text-sm font-medium">
        {challenge.icon && <span aria-hidden="true">{challenge.icon} </span>}
        {challenge.title}
      </p>
      {finished && (
        <p className="text-xs text-muted-foreground">
          {formatDisplay(finished, { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
      <Button variant="ghost" size="xs" className="mt-auto text-muted-foreground" onClick={share} disabled={sharing}>
        {sharing ? <Spinner /> : <Share2 />}
        Share
      </Button>
    </li>
  )
}
