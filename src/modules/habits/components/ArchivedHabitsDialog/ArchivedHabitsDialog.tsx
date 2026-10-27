/**
 * A tab's archived (paused) habits: restore one (tracked again from today — the
 * days it was archived never count as missed) or delete it for good.
 */
import { useState } from 'react'
import { AlertCircle, Archive, RotateCcw, Trash2 } from 'lucide-react'
import { ConfirmDialog, ListSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { getErrorMessage } from '@/shared/api/apiError'
import { addDays, formatDisplay } from '@/shared/utils/date'
import { MAX_HABITS_PER_TAB } from '../../constants'
import { useArchivedHabits, useDeleteHabit, useRestoreHabit } from '../../services/habits.queries'
import type { Habit } from '../../types/habits.types'

interface ArchivedHabitsDialogProps {
  tabId: string
  /** False when the tab is full — restoring needs a free slot. */
  canRestore: boolean
  onClose: () => void
}

export function ArchivedHabitsDialog({ tabId, canRestore, onClose }: ArchivedHabitsDialogProps) {
  const archived = useArchivedHabits(tabId)
  const restore = useRestoreHabit(tabId)
  const remove = useDeleteHabit(tabId)
  const [deleting, setDeleting] = useState<Habit | null>(null)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archived habits</DialogTitle>
          <DialogDescription>
            Paused habits keep their history. Restore one to track it again from today — the days it was archived
            don't count as missed.
          </DialogDescription>
        </DialogHeader>

        {archived.isPending && <ListSkeleton rows={2} />}
        {archived.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(archived.error)}</AlertDescription>
          </Alert>
        )}
        {!canRestore && (archived.data?.length ?? 0) > 0 && (
          <Alert>
            <AlertCircle />
            <AlertDescription>
              This tab already has {MAX_HABITS_PER_TAB} habits. Delete or archive one to restore another.
            </AlertDescription>
          </Alert>
        )}

        {archived.data?.length === 0 && (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Archive />
              </EmptyMedia>
              <EmptyTitle>Nothing archived</EmptyTitle>
              <EmptyDescription>Archive a habit to take a break from it without losing its history.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {archived.data && archived.data.length > 0 && (
          <ul className="flex max-h-80 flex-col overflow-y-auto">
            {archived.data.map((habit) => (
              <li key={habit.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50">
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: habit.color ?? 'var(--primary)' }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{habit.name}</span>
                    {habit.icon && <span aria-hidden="true">{habit.icon}</span>}
                  </span>
                  {habit.endDate && (
                    <span className="block text-xs text-muted-foreground">
                      Archived {formatDisplay(addDays(habit.endDate, 1), { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canRestore || restore.isPending}
                  onClick={() => restore.mutate(habit.id)}
                >
                  <RotateCcw />
                  Restore
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleting(habit)}
                  aria-label={`Delete ${habit.name}`}
                  title="Delete for good"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <ConfirmDialog
          open={deleting !== null}
          title={`Delete “${deleting?.name}” for good?`}
          message="It's resting safely in your archive, ready for a fresh start whenever you are. Deleting takes that chance away (past check-ins stay in your calendar)."
          keepFirst
          icon={<Archive />}
          iconClassName="bg-success/15 text-success"
          cancelLabel="Keep it in my archive"
          confirmLabel="Delete for good"
          loading={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        />
      </DialogContent>
    </Dialog>
  )
}
