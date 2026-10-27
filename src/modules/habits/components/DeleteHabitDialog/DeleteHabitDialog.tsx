/**
 * "Delete this habit?" — nudges the user to keep it: "Keep my habit" is the big
 * primary button, Archive (a break, restorable) is offered as the gentler
 * option, and deleting is a small text button.
 */
import { Archive, Sprout } from 'lucide-react'
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
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'

interface DeleteHabitDialogProps {
  /** The habit to delete, or null when closed. */
  habit: { name: string } | null
  deleting: boolean
  archiving: boolean
  onKeep: () => void
  onArchive: () => void
  onDelete: () => void
}

export function DeleteHabitDialog({ habit, deleting, archiving, onKeep, onArchive, onDelete }: DeleteHabitDialogProps) {
  const busy = deleting || archiving
  return (
    <AlertDialog open={habit !== null} onOpenChange={(open) => !open && onKeep()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-success/15 text-success">
            <Sprout />
          </AlertDialogMedia>
          <AlertDialogTitle>Let go of “{habit?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Every check-in has been a step toward the person you want to be. Habits take time to grow, so don't
            pull it out by the roots too soon.
            <span className="mt-2 block">
              Need a break? <strong className="text-foreground">Archive</strong> it and bring it back any time.
              Deleting stops it for good from today (past check-ins stay in your calendar).
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-col sm:items-stretch">
          <AlertDialogCancel variant="default" size="lg" autoFocus disabled={busy}>
            🌱 Keep my habit
          </AlertDialogCancel>
          <Button variant="outline" disabled={busy} onClick={onArchive}>
            {archiving ? <Spinner /> : <Archive />}
            Take a break (archive)
          </Button>
          <AlertDialogAction
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              // Stay open until it's done (the parent closes it)
              event.preventDefault()
              onDelete()
            }}
          >
            {deleting && <Spinner />}
            Delete it anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
