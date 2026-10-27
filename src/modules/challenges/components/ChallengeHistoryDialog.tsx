/** Completed (🏆) and given-up challenges, newest first. */
import { AlertCircle, Flag, Trophy } from 'lucide-react'
import { ListSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { getErrorMessage } from '@/shared/api/apiError'
import { useChallengeHistory } from '../services/challenges.queries'

const date = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export function ChallengeHistoryDialog({ onClose }: { onClose: () => void }) {
  const history = useChallengeHistory()

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Past challenges</DialogTitle>
          <DialogDescription>Every challenge you finished or gave up.</DialogDescription>
        </DialogHeader>

        {history.isPending && <ListSkeleton rows={2} />}
        {history.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(history.error)}</AlertDescription>
          </Alert>
        )}
        {history.data?.length === 0 && (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trophy />
              </EmptyMedia>
              <EmptyTitle>No past challenges yet</EmptyTitle>
              <EmptyDescription>Finished challenges show up here as trophies.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {history.data && history.data.length > 0 && (
          <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
            {history.data.map((c) => {
              const completed = c.status === 'completed'
              return (
                <li key={c.id} className="flex items-center gap-3 rounded-md px-2 py-2">
                  <span
                    className={
                      completed
                        ? 'grid size-9 shrink-0 place-items-center rounded-full bg-warning/15 text-warning'
                        : 'grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground'
                    }
                  >
                    {completed ? <Trophy className="size-4" /> : <Flag className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {c.icon && <span aria-hidden="true">{c.icon} </span>}
                      {c.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {completed ? `${c.lengthDays} days · completed` : `Given up · best ${c.bestDays} days`}
                      {c.endedAt && ` · ${date(c.endedAt)}`}
                      {c.attempts > 1 && ` · ${c.attempts} attempts`}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
