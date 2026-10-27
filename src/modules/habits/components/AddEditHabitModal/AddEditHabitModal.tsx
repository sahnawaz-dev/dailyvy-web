/**
 * Create or edit a habit: name, applicable weekdays, color, optional emoji icon.
 * In edit mode it also offers "Delete habit".
 *
 * Render it with a `key` so the form resets each time it opens:
 *   {editing !== undefined && <AddEditHabitModal key={editing?.id ?? 'new'} ... />}
 */
import { useState, type FormEvent } from 'react'
import { AlertCircle, Archive } from 'lucide-react'
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
import { useArchiveHabit, useCreateHabit, useDeleteHabit, useUpdateHabit } from '../../services/habits.queries'
import type { Habit, HabitFormValues } from '../../types/habits.types'
import { NEW_HABIT_FIELDS, hasActiveDay } from '../../utils/habitFields'
import { DeleteHabitDialog } from '../DeleteHabitDialog/DeleteHabitDialog'
import { HabitFormFields } from '../HabitFormFields/HabitFormFields'

interface AddEditHabitModalProps {
  tabId: string
  /** The habit to edit, or null to create a new one. */
  habit: Habit | null
  onClose: () => void
}

export function AddEditHabitModal({ tabId, habit, onClose }: AddEditHabitModalProps) {
  const isEdit = habit !== null
  const [values, setValues] = useState<HabitFormValues>({
    name: habit?.name ?? '',
    activeDays: habit?.activeDays ?? NEW_HABIT_FIELDS.activeDays,
    frequency: habit?.frequency ?? NEW_HABIT_FIELDS.frequency,
    color: habit?.color ?? NEW_HABIT_FIELDS.color,
    icon: habit?.icon ?? NEW_HABIT_FIELDS.icon,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit(tabId)
  const deleteHabit = useDeleteHabit(tabId)
  const archiveHabit = useArchiveHabit(tabId)
  const save = isEdit ? updateHabit : createHabit

  const canSubmit = values.name.trim().length > 0 && hasActiveDay(values) && !save.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    const payload = { ...values, name: values.name.trim(), icon: values.icon?.trim() || null }
    const options = { onSuccess: onClose }
    if (isEdit) updateHabit.mutate({ habitId: habit.id, values: payload }, options)
    else createHabit.mutate({ tabId, values: payload }, options)
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit habit' : 'Start a new habit'}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Fine-tune it. Your progress so far is safe.'
                  : 'Small steps, every day, add up to big change. What will you start?'}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              {save.isError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{getErrorMessage(save.error)}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="habit-name">Name</FieldLabel>
                <Input
                  id="habit-name"
                  placeholder="e.g. Drink 2L of water"
                  value={values.name}
                  maxLength={60}
                  onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Field>

              <HabitFormFields
                value={values}
                onChange={(fields) => setValues((prev) => ({ ...prev, ...fields }))}
                daysNote={
                  isEdit
                    ? "Changing how often doesn't erase history — past check-ins are kept, stats follow the new schedule."
                    : undefined
                }
              />
            </FieldGroup>

            <DialogFooter>
              {isEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete habit
                </Button>
              )}
              {isEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground sm:-ml-2 sm:mr-auto"
                  disabled={archiveHabit.isPending}
                  onClick={() => archiveHabit.mutate(habit.id, { onSuccess: onClose })}
                  title="Pause it — restore it any time from Archived"
                >
                  <Archive />
                  Archive
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!canSubmit}>
                {save.isPending && <Spinner />}
                {isEdit ? 'Save changes' : '🌱 Start this habit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isEdit && (
        <DeleteHabitDialog
          habit={confirmDelete ? habit : null}
          deleting={deleteHabit.isPending}
          archiving={archiveHabit.isPending}
          onKeep={() => setConfirmDelete(false)}
          onArchive={() => archiveHabit.mutate(habit.id, { onSuccess: onClose })}
          onDelete={() => deleteHabit.mutate(habit.id, { onSuccess: onClose })}
        />
      )}
    </>
  )
}
