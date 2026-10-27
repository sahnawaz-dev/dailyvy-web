/**
 * Inline editor for today's note on a habit ("ran 5 km", "read chapter 3").
 * Enter saves, Escape cancels; an empty note removes it.
 */
import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const NOTE_MAX = 200

interface HabitNoteEditorProps {
  habitName: string
  initial: string | null
  onSave: (note: string | null) => void
  onCancel: () => void
}

export function HabitNoteEditor({ habitName, initial, onSave, onCancel }: HabitNoteEditorProps) {
  const [text, setText] = useState(initial ?? '')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSave(text.trim() || null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 pb-2 pl-9">
      <Input
        autoFocus
        value={text}
        maxLength={NOTE_MAX}
        placeholder="How did it go? e.g. ran 5 km"
        aria-label={`Note for ${habitName}`}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        className="h-8 min-w-48 flex-1 text-sm"
      />
      <Button type="submit" size="sm">
        Save note
      </Button>
      {initial && (
        <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onSave(null)}>
          Remove
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}
