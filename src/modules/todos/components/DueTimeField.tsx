/** Optional due-time input ('HH:mm') with a clear button. Habits never use this. */
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import type { TimeString } from '../types/todos.types'

interface DueTimeFieldProps {
  id: string
  value: TimeString | null
  onChange: (value: TimeString | null) => void
}

export function DueTimeField({ id, value, onChange }: DueTimeFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Due time (optional)</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="time"
          className="w-36"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
        {value && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Clear due time">
            <X />
          </Button>
        )}
      </div>
      <FieldDescription>Today, in your timezone. You can tick it off any time today.</FieldDescription>
    </Field>
  )
}
