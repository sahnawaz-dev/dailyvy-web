/**
 * The habit-specific part of a habit form: how often (specific weekdays, or
 * "X times per week" on any days), checkbox color, icon.
 * Shared by the Add/Edit habit dialog and the To-Dos "Make it a habit" option,
 * so both always offer exactly the same choices.
 */
import { WeekdaySelector } from '@/shared/components'
import { Field, FieldDescription, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { cn } from '@/shared/lib/utils'
import { HABIT_COLORS } from '../../constants'
import { hasActiveDay, isWeeklyHabit, type HabitFieldValues } from '../../utils/habitFields'

const TIMES_PER_WEEK = [1, 2, 3, 4, 5, 6]

/** The picked option stands out in the theme color. */
const PICKED = 'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'

interface HabitFormFieldsProps {
  value: HabitFieldValues
  onChange: (value: HabitFieldValues) => void
  /** Note under the weekdays (e.g. when editing an existing habit). */
  daysNote?: string
}

export function HabitFormFields({ value, onChange, daysNote }: HabitFormFieldsProps) {
  const set = <K extends keyof HabitFieldValues>(key: K, next: HabitFieldValues[K]) =>
    onChange({ ...value, [key]: next })

  const weekly = isWeeklyHabit(value)
  const timesPerWeek = value.frequency?.timesPerWeek ?? 3

  return (
    <>
      <Field>
        <FieldLabel>How often</FieldLabel>
        <ToggleGroup
          type="single"
          variant="outline"
          value={weekly ? 'weekly' : 'days'}
          onValueChange={(kind) =>
            kind &&
            set('frequency', kind === 'weekly' ? { kind: 'weekly', timesPerWeek } : { kind: 'days', timesPerWeek: null })
          }
          className="w-full"
          aria-label="How often"
        >
          <ToggleGroupItem value="days" className={cn('flex-1', PICKED)}>
            Specific days
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className={cn('flex-1', PICKED)}>
            Times per week
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      {weekly ? (
        <Field>
          <FieldLabel>Times each week</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(timesPerWeek)}
            onValueChange={(n) => n && set('frequency', { kind: 'weekly', timesPerWeek: Number(n) })}
            className="justify-start"
            aria-label="Times each week"
          >
            {TIMES_PER_WEEK.map((n) => (
              <ToggleGroupItem key={n} value={String(n)} className={cn('w-10', PICKED)} aria-label={`${n} times a week`}>
                {n}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription>
            Do it on any days you like — {timesPerWeek}× between Monday and Sunday. A day without it is never
            &ldquo;missed&rdquo;; your streak counts weeks where you hit the target.
          </FieldDescription>
        </Field>
      ) : (
        <WeekdaySelector
          value={value.activeDays}
          onChange={(activeDays) => set('activeDays', activeDays)}
          error={hasActiveDay(value) ? undefined : 'Select at least one day'}
          legend="Track on"
          description="This habit will only be tracked on the checked days."
        />
      )}
      {daysNote && <FieldDescription className="-mt-4">{daysNote}</FieldDescription>}

      <Field>
        <FieldLabel>Checkbox color</FieldLabel>
        <ToggleGroup
          type="single"
          value={value.color ?? ''}
          onValueChange={(color) => color && set('color', color)}
          className="flex-wrap justify-start"
          aria-label="Checkbox color"
        >
          {HABIT_COLORS.map((color) => (
            <ToggleGroupItem
              key={color}
              value={color}
              aria-label={`Color ${color}`}
              className="size-8 rounded-full p-0 data-[state=on]:ring-2 data-[state=on]:ring-ring data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-background"
            >
              <span className="size-6 rounded-full" style={{ background: color }} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>Fills this habit's checkbox when it's done.</FieldDescription>
      </Field>

      <Field className="max-w-40">
        <FieldLabel htmlFor="habit-icon">Icon (optional)</FieldLabel>
        <Input
          id="habit-icon"
          placeholder="An emoji, e.g. 💧"
          value={value.icon ?? ''}
          maxLength={4}
          onChange={(e) => set('icon', e.target.value)}
        />
      </Field>
    </>
  )
}
