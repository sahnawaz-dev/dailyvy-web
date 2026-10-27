/**
 * "Are you sure?" dialog — a thin composition of shadcn's AlertDialog so the
 * confirmations in the app don't repeat the same markup.
 *
 * `keepFirst`: for actions we'd rather the user didn't take (deleting, quitting).
 * The "keep" option becomes the big primary button (focused by default) and the
 * action shrinks to a small text button underneath.
 */
import type { ReactNode } from 'react'
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
import { cn } from '@/shared/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** Make "keep" (cancel) the primary choice and the action a small text button. */
  keepFirst?: boolean
  /** Optional icon above / beside the title. */
  icon?: ReactNode
  /** Colours for the icon's tile, e.g. 'bg-success/15 text-success'. */
  iconClassName?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  keepFirst = false,
  icon,
  iconClassName,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirm = (
    <AlertDialogAction
      variant={keepFirst ? 'ghost' : destructive ? 'destructive' : 'default'}
      size={keepFirst ? 'sm' : 'default'}
      className={cn(keepFirst && 'text-muted-foreground hover:text-destructive')}
      disabled={loading}
      onClick={(event) => {
        // Keep the dialog open until the action finishes (parent closes it).
        event.preventDefault()
        onConfirm()
      }}
    >
      {loading && <Spinner />}
      {confirmLabel}
    </AlertDialogAction>
  )

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon && <AlertDialogMedia className={iconClassName}>{icon}</AlertDialogMedia>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {keepFirst ? (
          <AlertDialogFooter className="sm:flex-col sm:items-stretch">
            <AlertDialogCancel variant="default" size="lg" autoFocus disabled={loading}>
              {cancelLabel}
            </AlertDialogCancel>
            {confirm}
          </AlertDialogFooter>
        ) : (
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
            {confirm}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
