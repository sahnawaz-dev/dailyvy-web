/** Edit a task's title and due time. Render with a `key` so it resets per task. */
import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { useUpdateTodo } from '../services/todos.queries'
import type { Todo } from '../types/todos.types'
import { DueTimeField } from './DueTimeField'

export function EditTaskDialog({ todo, onClose }: { todo: Todo; onClose: () => void }) {
  const [title, setTitle] = useState(todo.title)
  const [dueTime, setDueTime] = useState(todo.dueTime)
  const update = useUpdateTodo()

  const trimmed = title.trim()
  const changed = trimmed !== todo.title || dueTime !== todo.dueTime
  const canSubmit = trimmed.length > 0 && changed && !update.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    update.mutate({ todoId: todo.id, changes: { title: trimmed, dueTime } }, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Change what it is or when it's due today.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {update.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(update.error)}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="edit-task-title">Task</FieldLabel>
              <Input id="edit-task-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <DueTimeField id="edit-task-time" value={dueTime} onChange={setDueTime} />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              {update.isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
