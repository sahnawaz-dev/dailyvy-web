/**
 * Mon–Sun checkboxes (habit days, focus days). Any combination may be
 * unchecked, but at least one day must stay checked (the parent passes `error`).
 */
import { useId } from 'react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/shared/components/ui/field'
import { WEEKDAY_LONG, WEEKDAY_SHORT } from '@/shared/utils/date'

interface WeekdaySelectorProps {
  value: boolean[]
  onChange: (value: boolean[]) => void
  error?: string
  legend?: string
  description?: string
}

export function WeekdaySelector({
  value,
  onChange,
  error,
  legend = 'Days',
  description,
}: WeekdaySelectorProps) {
  const id = useId()
  const toggle = (index: number, checked: boolean) => onChange(value.map((day, i) => (i === index ? checked : day)))

  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_SHORT.map((label, index) => (
          <Field key={label} className="items-center gap-1.5" title={WEEKDAY_LONG[index]}>
            <FieldLabel htmlFor={`${id}-${index}`} className="justify-center text-xs">
              {label}
            </FieldLabel>
            <Checkbox
              id={`${id}-${index}`}
              // `!` beats Field's "children are full width" rule.
              className="size-6! rounded-md"
              checked={value[index]}
              onCheckedChange={(checked) => toggle(index, checked === true)}
            />
          </Field>
        ))}
      </div>
      {error ? <FieldError>{error}</FieldError> : description && <FieldDescription>{description}</FieldDescription>}
    </FieldSet>
  )
}
