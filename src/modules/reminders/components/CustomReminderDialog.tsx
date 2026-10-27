/**
 * Add / edit one of the user's own reminders:
 *   presets (adding only) · icon + title + message · Repeat every … between
 *   active hours, or At set times (Morning / Afternoon / Evening / Before bed
 *   or any time) · days · optional linked habit (stop once it's checked
 *   today) · Delete (editing only)
 * Pass `reminder` to edit; render with a `key` so it resets per reminder.
 */
import { useState, type FormEvent } from 'react'
import { AlertCircle, BellRing, Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog, WeekdaySelector } from '@/shared/components'
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/shared/components/ui/native-select'
import { Spinner } from '@/shared/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import {
  ACTIVE_HOURS,
  BLANK_REMINDER,
  ICON_CHOICES,
  INTERVAL_OPTIONS,
  REMINDER_PRESETS,
  TIME_PRESETS,
} from '../constants'
import {
  useCreateCustomReminder,
  useDeleteCustomReminder,
  useHabitOptions,
  useUpdateCustomReminder,
} from '../services/reminders.queries'
import type { CustomReminder, CustomReminderInput, CustomSchedule, HabitOption } from '../types/reminders.types'
import { formatEvery, formatTime } from '../utils/schedule'

const ON_CLASS = 'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'

/** Just the fields a reminder form edits (drops id, createdAt, snoozedUntil…). */
function toInput({ icon, title, body, schedule, days, enabled, habitId }: CustomReminderInput): CustomReminderInput {
  return { icon, title, body, schedule, days, enabled, habitId }
}

/** Habits grouped by their tab, for the "linked habit" select. */
function groupByTab(options: HabitOption[]) {
  const groups = new Map<string, HabitOption[]>()
  for (const option of options) {
    const tab = option.tabName ?? 'Habits'
    groups.set(tab, [...(groups.get(tab) ?? []), option])
  }
  return [...groups.entries()]
}

interface CustomReminderDialogProps {
  /** Edit this reminder (otherwise a new one is added). */
  reminder?: CustomReminder
  /** Start a new reminder from a preset (e.g. "Drink water"). */
  initial?: CustomReminderInput
  onClose: () => void
}

export function CustomReminderDialog({ reminder, initial, onClose }: CustomReminderDialogProps) {
  const [values, setValues] = useState<CustomReminderInput>(() => toInput(reminder ?? initial ?? BLANK_REMINDER))
  const [customTime, setCustomTime] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // Remember the other kind's settings while switching back and forth
  const [lastInterval, setLastInterval] = useState<CustomSchedule>(
    values.schedule.kind === 'interval' ? values.schedule : BLANK_REMINDER.schedule,
  )
  const [lastTimes, setLastTimes] = useState<CustomSchedule>(
    values.schedule.kind === 'times' ? values.schedule : { kind: 'times', times: ['08:00', '13:00', '19:00'] },
  )

  const create = useCreateCustomReminder()
  const update = useUpdateCustomReminder()
  const remove = useDeleteCustomReminder()
  const habits = useHabitOptions()
  const saving = create.isPending || update.isPending
  const error = create.error ?? update.error

  const set = (changes: Partial<CustomReminderInput>) => setValues((v) => ({ ...v, ...changes }))
  const setSchedule = (schedule: CustomSchedule) => {
    if (schedule.kind === 'interval') setLastInterval(schedule)
    else setLastTimes(schedule)
    set({ schedule })
  }

  const { schedule } = values
  const scheduleError =
    schedule.kind === 'interval'
      ? schedule.from >= schedule.to
        ? 'The end time must be after the start time'
        : undefined
      : schedule.times.length === 0
        ? 'Pick at least one time'
        : undefined
  const daysError = values.days.some(Boolean) ? undefined : 'Pick at least one day'
  const canSave = values.title.trim().length > 0 && !scheduleError && !daysError && !saving

  const toggleTime = (time: string) => {
    if (schedule.kind !== 'times') return
    const times = schedule.times.includes(time)
      ? schedule.times.filter((t) => t !== time)
      : [...schedule.times, time].sort()
    setSchedule({ kind: 'times', times })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    // Only the editable fields (the server rejects anything else)
    const input = toInput({ ...values, title: values.title.trim(), body: values.body.trim() })
    if (reminder) update.mutate({ id: reminder.id, changes: input }, { onSuccess: onClose })
    else create.mutate(input, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{reminder ? 'Edit reminder' : 'New reminder'}</DialogTitle>
            <DialogDescription>A gentle, silent nudge — paused automatically while you focus.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            {!reminder && (
              <Field>
                <FieldLabel>Start from</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {REMINDER_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setValues(preset.reminder)
                        if (preset.reminder.schedule.kind === 'interval') setLastInterval(preset.reminder.schedule)
                        else setLastTimes(preset.reminder.schedule)
                      }}
                    >
                      <span aria-hidden="true">{preset.reminder.icon}</span>
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </Field>
            )}

            <Field>
              <FieldLabel>Icon</FieldLabel>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Icon">
                {ICON_CHOICES.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    role="radio"
                    aria-checked={values.icon === icon}
                    onClick={() => set({ icon })}
                    className={cn(
                      'grid size-9 place-items-center rounded-lg border text-lg transition-colors hover:bg-accent/50',
                      values.icon === icon && 'border-primary bg-accent',
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="reminder-title">Title</FieldLabel>
              <Input
                id="reminder-title"
                value={values.title}
                maxLength={60}
                placeholder="e.g. Time for some water"
                onChange={(e) => set({ title: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="reminder-body">Message (optional)</FieldLabel>
              <Input
                id="reminder-body"
                value={values.body}
                maxLength={120}
                placeholder="e.g. A glass now keeps you going."
                onChange={(e) => set({ body: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>When</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={schedule.kind}
                onValueChange={(kind) => kind && setSchedule(kind === 'interval' ? lastInterval : lastTimes)}
                aria-label="Schedule type"
              >
                <ToggleGroupItem value="interval" className={cn('px-3', ON_CLASS)}>
                  Repeat
                </ToggleGroupItem>
                <ToggleGroupItem value="times" className={cn('px-3', ON_CLASS)}>
                  At set times
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            {schedule.kind === 'interval' ? (
              <>
                <Field>
                  <FieldLabel>Every</FieldLabel>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(schedule.everyMinutes)}
                    onValueChange={(v) => v && setSchedule({ ...schedule, everyMinutes: Number(v) })}
                    className="flex-wrap"
                    aria-label="Repeat every"
                  >
                    {INTERVAL_OPTIONS.map((minutes) => (
                      <ToggleGroupItem key={minutes} value={String(minutes)} className={cn('px-3', ON_CLASS)}>
                        {formatEvery(minutes)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <Field data-invalid={Boolean(scheduleError)}>
                  <FieldLabel>Between</FieldLabel>
                  <div className="flex items-center gap-2">
                    <NativeSelect
                      aria-label="From"
                      value={schedule.from}
                      onChange={(e) => setSchedule({ ...schedule, from: e.target.value })}
                    >
                      {ACTIVE_HOURS.map((hour) => (
                        <NativeSelectOption key={hour} value={hour}>
                          {formatTime(hour)}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <span className="text-sm text-muted-foreground">and</span>
                    <NativeSelect
                      aria-label="Until"
                      value={schedule.to}
                      onChange={(e) => setSchedule({ ...schedule, to: e.target.value })}
                    >
                      {ACTIVE_HOURS.map((hour) => (
                        <NativeSelectOption key={hour} value={hour}>
                          {formatTime(hour)}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  {scheduleError && <FieldError>{scheduleError}</FieldError>}
                </Field>
              </>
            ) : (
              <Field data-invalid={Boolean(scheduleError)}>
                <FieldLabel>Times</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TIME_PRESETS.map(({ label, time }) => {
                    const on = schedule.times.includes(time)
                    return (
                      <Button
                        key={time}
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-pressed={on}
                        onClick={() => toggleTime(time)}
                        className={cn(on && 'bg-accent text-accent-foreground')}
                      >
                        {label} · {formatTime(time)}
                      </Button>
                    )
                  })}
                  {/* Times picked by hand (not one of the named moments) */}
                  {schedule.times
                    .filter((t) => !TIME_PRESETS.some((p) => p.time === t))
                    .map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTime(time)}
                        className="bg-accent text-accent-foreground"
                        aria-label={`Remove ${formatTime(time)}`}
                      >
                        {formatTime(time)}
                        <X />
                      </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    aria-label="Another time"
                    className="w-36"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!customTime || schedule.times.includes(customTime) || schedule.times.length >= 8}
                    onClick={() => {
                      toggleTime(customTime)
                      setCustomTime('')
                    }}
                  >
                    <Plus />
                    Add time
                  </Button>
                </div>
                {scheduleError && <FieldError>{scheduleError}</FieldError>}
              </Field>
            )}

            <WeekdaySelector value={values.days} onChange={(days) => set({ days })} error={daysError} />

            <Field>
              <FieldLabel htmlFor="reminder-habit">Stop when this habit is checked (optional)</FieldLabel>
              <NativeSelect
                id="reminder-habit"
                value={values.habitId ?? ''}
                disabled={!habits.data}
                onChange={(e) => set({ habitId: e.target.value || null })}
              >
                <NativeSelectOption value="">Don’t link — remind on schedule</NativeSelectOption>
                {groupByTab(habits.data ?? []).map(([tabName, options]) => (
                  <NativeSelectOptGroup key={tabName} label={tabName}>
                    {options.map((habit) => (
                      <NativeSelectOption key={habit.id} value={habit.id}>
                        {habit.icon ? `${habit.icon} ` : ''}
                        {habit.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelectOptGroup>
                ))}
              </NativeSelect>
              <FieldDescription>
                e.g. “Eat something healthy” stops for the day once your “Eat healthy” habit is done.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter className="sm:justify-between">
            {reminder ? (
              <Button type="button" variant="ghost" className="text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!canSave}>
                {saving && <Spinner />}
                {reminder ? 'Save' : 'Add reminder'}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {reminder && (
          <ConfirmDialog
            open={confirmingDelete}
            title={`Delete “${reminder.title}”?`}
            message="Little nudges keep good routines on track. Want some quiet instead? Switch it off and turn it back on any time."
            keepFirst
            icon={<BellRing />}
            iconClassName="bg-primary/15 text-primary"
            cancelLabel="Keep my reminder"
            confirmLabel="Delete reminder"
            loading={remove.isPending}
            onConfirm={() => remove.mutate(reminder.id, { onSuccess: onClose })}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
