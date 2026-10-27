/**
 * "Quick start" chips while a tab has fewer than SUGGESTIONS_UNTIL_HABITS
 * habits: one click adds a common habit (every day, with its own color and
 * icon). Users still pick what they want — nothing is added for them.
 *  - 'centered': inside the empty-tab message
 *  - 'inline':   a compact row under the table once the first habits exist
 * Suggestions already in the tab (same name) are hidden.
 */
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { DEFAULT_ACTIVE_DAYS, HABIT_SUGGESTIONS } from '../../constants'
import { useCreateHabit } from '../../services/habits.queries'

interface HabitSuggestionsProps {
  tabId: string
  /** Names of the habits already in the tab. */
  existingNames: string[]
  layout: 'centered' | 'inline'
}

export function HabitSuggestions({ tabId, existingNames, layout }: HabitSuggestionsProps) {
  const createHabit = useCreateHabit()
  const taken = new Set(existingNames.map((name) => name.trim().toLowerCase()))
  const suggestions = HABIT_SUGGESTIONS.filter((s) => !taken.has(s.name.toLowerCase()))
  if (suggestions.length === 0) return null

  const centered = layout === 'centered'
  return (
    <div className={cn('flex gap-2', centered ? 'flex-col items-center' : 'flex-wrap items-center')}>
      <p className="text-xs text-muted-foreground">{centered ? 'Or start with one of these:' : 'Quick add:'}</p>
      <ul
        className={cn('flex flex-wrap gap-2', centered && 'max-w-lg justify-center')}
        aria-label="Suggested habits"
      >
        {suggestions.map((suggestion) => (
          <li key={suggestion.name}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={createHabit.isPending}
              onClick={() =>
                createHabit.mutate({
                  tabId,
                  values: {
                    name: suggestion.name,
                    icon: suggestion.icon,
                    color: suggestion.color,
                    activeDays: DEFAULT_ACTIVE_DAYS,
                  },
                })
              }
            >
              <span aria-hidden="true">{suggestion.icon}</span>
              {suggestion.name}
              <Plus className="text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
