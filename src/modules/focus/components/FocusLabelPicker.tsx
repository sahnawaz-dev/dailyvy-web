/**
 * "Focusing on…" — optional. Pick one of today's unfinished tasks or habits,
 * or type something else (see utils/focusChoice.ts).
 */
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { FocusChoice, FocusOption } from '../utils/focusChoice'

interface FocusLabelPickerProps {
  value: FocusChoice
  onChange: (value: FocusChoice) => void
  tasks: FocusOption[]
  habits: FocusOption[]
}

function OptionGroup({ label, options }: { label: string; options: FocusOption[] }) {
  if (options.length === 0) return null
  return (
    <SelectGroup>
      <SelectSeparator />
      <SelectLabel>{label}</SelectLabel>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectGroup>
  )
}

export function FocusLabelPicker({ value, onChange, tasks, habits }: FocusLabelPickerProps) {
  return (
    <Field>
      <FieldLabel htmlFor="focus-on">Focusing on (optional)</FieldLabel>
      <Select value={value.value} onValueChange={(next) => onChange({ ...value, value: next })}>
        <SelectTrigger id="focus-on" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nothing specific</SelectItem>
          <OptionGroup label="Today's tasks" options={tasks} />
          <OptionGroup label="Today's habits" options={habits} />
          <SelectSeparator />
          <SelectItem value="custom">Something else…</SelectItem>
        </SelectContent>
      </Select>
      {value.value === 'custom' && (
        <Input
          aria-label="What are you focusing on?"
          placeholder="e.g. Study chapter 4"
          maxLength={200}
          value={value.customText}
          onChange={(e) => onChange({ ...value, customText: e.target.value })}
          autoFocus
        />
      )}
    </Field>
  )
}
