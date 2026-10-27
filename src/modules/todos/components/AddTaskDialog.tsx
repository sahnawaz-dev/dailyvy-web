/**
 * "Add task" dialog. The user types what they want to do, then chooses:
 *  - For today only  → a one-off to-do for today (todos module)
 *  - Make it a habit → pick a tab + days / color / icon, exactly like the
 *                      Add habit dialog (creates a habit via the habits module)
 */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { AlertCircle, CalendarCheck, Repeat } from 'lucide-react'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { getErrorMessage } from '@/shared/api/apiError'
import {
  HabitFormFields,
  NEW_HABIT_FIELDS,
  hasActiveDay,
  useCreateHabit,
  useTabs,
  type HabitFieldValues,
} from '@/modules/habits'
import { useCreateTodo } from '../services/todos.queries'
import type { TimeString } from '../types/todos.types'
import { DueTimeField } from './DueTimeField'

type Kind = 'today' | 'habit'

const TODO_TITLE_MAX = 200
const HABIT_NAME_MAX = 60

const KIND_OPTIONS = [
  { value: 'today', label: 'For today only', description: 'A one-off task for today', icon: CalendarCheck },
  { value: 'habit', label: 'Make it a habit', description: 'Repeat it on the days you choose', icon: Repeat },
] as const

export function AddTaskDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<Kind>('today')
  const [dueTime, setDueTime] = useState<TimeString | null>(null)
  const [tabId, setTabId] = useState<string>('')
  const [habitFields, setHabitFields] = useState<HabitFieldValues>(NEW_HABIT_FIELDS)

  const tabs = useTabs()
  const createTodo = useCreateTodo()
  const createHabit = useCreateHabit()
  const save = kind === 'today' ? createTodo : createHabit

  const selectedTabId = tabId || tabs.data?.[0]?.id || ''
  const trimmed = title.trim()
  const titleTooLongForHabit = kind === 'habit' && trimmed.length > HABIT_NAME_MAX
  const canSubmit =
    trimmed.length > 0 &&
    !save.isPending &&
    (kind === 'today' || (Boolean(selectedTabId) && hasActiveDay(habitFields) && !titleTooLongForHabit))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    if (kind === 'today') {
      createTodo.mutate({ title: trimmed, dueTime }, { onSuccess: onClose })
    } else {
      createHabit.mutate(
        {
          tabId: selectedTabId,
          values: { ...habitFields, name: trimmed, icon: habitFields.icon?.trim() || null },
        },
        { onSuccess: onClose },
      )
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>Plan something for today, or turn it into a habit.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {save.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(save.error)}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={titleTooLongForHabit}>
              <FieldLabel htmlFor="task-title">What do you want to do?</FieldLabel>
              <Input
                id="task-title"
                placeholder="e.g. Call the bank"
                value={title}
                maxLength={TODO_TITLE_MAX}
                aria-invalid={titleTooLongForHabit}
                onChange={(e) => setTitle(e.target.value)}
              />
              {titleTooLongForHabit && (
                <FieldError>Habit names can be at most {HABIT_NAME_MAX} characters.</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Add it as</FieldLabel>
              <ToggleGroup
                type="single"
                value={kind}
                onValueChange={(value) => value && setKind(value as Kind)}
                aria-label="Add it as"
                className="grid w-full grid-cols-2 gap-2"
              >
                {KIND_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-auto flex-col items-start gap-1 rounded-lg border p-3 text-left data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:ring-2 data-[state=on]:ring-primary/20"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <option.icon className="size-4 text-primary" />
                      {option.label}
                    </span>
                    <span className="text-xs font-normal whitespace-normal text-muted-foreground">
                      {option.description}
                    </span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            {/* Only one-off tasks have a due time — habits never do. */}
            {kind === 'today' && <DueTimeField id="task-time" value={dueTime} onChange={setDueTime} />}

            {kind === 'habit' &&
              (tabs.data && tabs.data.length === 0 ? (
                <Alert>
                  <AlertCircle />
                  <AlertDescription>
                    Habits live in tabs, and you don't have one yet.{' '}
                    <Link to="/habits" className="font-medium underline underline-offset-4" onClick={onClose}>
                      Create a tab
                    </Link>{' '}
                    first.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="task-tab">Habit tab</FieldLabel>
                    <Select value={selectedTabId} onValueChange={setTabId}>
                      <SelectTrigger id="task-tab" className="w-full">
                        <SelectValue placeholder="Choose a tab" />
                      </SelectTrigger>
                      <SelectContent>
                        {tabs.data?.map((tab) => (
                          <SelectItem key={tab.id} value={tab.id}>
                            {tab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <HabitFormFields value={habitFields} onChange={setHabitFields} />
                </>
              ))}
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              {save.isPending && <Spinner />}
              {kind === 'today' ? 'Add to my day' : '🌱 Start this habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
