/**
 * Habits due today, one card per habit tab (tabs with nothing due are hidden).
 * Checking them here is the same as on the Habits page — same today-only rule,
 * same habit colors, same celebration. "Times per week" habits show this
 * week's progress and are listed until the week's target is met.
 * Each habit can carry a short note for today ("ran 5 km"), shown in the calendar too.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import { AlertCircle, ArrowRight, SkipForward, StickyNote } from 'lucide-react'
import { ListSkeleton } from '@/shared/components'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import { HabitCheckbox, useSetHabitNote, useTodayHabits, useToggleLog } from '@/modules/habits'
import { HabitNoteEditor } from './HabitNoteEditor'

export function TodayHabits() {
  const view = useTodayHabits()
  const toggleLog = useToggleLog()
  const setNote = useSetHabitNote()
  /** The habit whose note is being written (one at a time). */
  const [noting, setNoting] = useState<string | null>(null)

  if (view.isPending) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <ListSkeleton rows={2} />
        </CardContent>
      </Card>
    )
  }
  if (view.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{getErrorMessage(view.error)}</AlertDescription>
      </Alert>
    )
  }
  if (view.data.tabs.length === 0) {
    return <p className="px-1 text-sm text-muted-foreground">No habits are scheduled for today.</p>
  }

  const { today } = view.data
  return (
    <>
      {view.data.tabs.map(({ tab, habits }) => {
        const done = habits.filter((h) => h.completed).length
        // Skipped habits are left out of "x of y done", and so are "times per week" habits
        // not done today (they aren't due on any particular day)
        const counted = habits.filter((h) => !h.skipped && (!h.week || h.completed)).length
        return (
          <Card key={tab.id}>
            <CardHeader>
              <CardTitle>{tab.name}</CardTitle>
              <CardDescription>Habits due today</CardDescription>
              <CardAction className="flex items-center gap-2">
                <Badge variant={counted > 0 && done === counted ? 'default' : 'secondary'}>
                  {done}/{counted} done
                </Badge>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link to={`/habits/${tab.id}/weekly`} aria-label={`Open ${tab.name}`} title="Open tab">
                    <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {habits.map((habit) => (
                  <li key={habit.id} className="group/habit flex flex-col rounded-md px-2 hover:bg-accent/50">
                    <div className="flex items-center gap-3 py-2">
                      <HabitCheckbox
                        compact
                        className="mx-0 shrink-0"
                        color={habit.color}
                        label={habit.name}
                        state={{ kind: 'today', checked: habit.completed, editable: true, skipped: habit.skipped }}
                        onToggle={() =>
                          toggleLog.mutate({
                            tabId: tab.id,
                            habitId: habit.id,
                            date: today,
                            status: habit.completed ? 'none' : 'done',
                          })
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sm',
                            (habit.completed || habit.skipped) && 'text-muted-foreground',
                          )}
                        >
                          {habit.name}
                        </span>
                        {habit.note && noting !== habit.id && (
                          <button
                            type="button"
                            onClick={() => setNoting(habit.id)}
                            className="flex max-w-full items-start gap-1 text-left text-xs text-muted-foreground italic hover:text-foreground"
                            title="Edit note"
                          >
                            <StickyNote className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                            <span className="line-clamp-2">{habit.note}</span>
                          </button>
                        )}
                      </span>
                      {!habit.note && noting !== habit.id && (
                        // Shown on row hover / keyboard focus (always on touch devices)
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground opacity-0 group-hover/habit:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                          onClick={() => setNoting(habit.id)}
                          aria-label={`Add a note to ${habit.name}`}
                          title="Add a note (e.g. ran 5 km)"
                        >
                          <StickyNote />
                        </Button>
                      )}
                      {habit.week ? (
                        <Badge
                          variant={habit.week.done >= habit.week.target ? 'default' : 'outline'}
                          className="tabular-nums"
                          title="Times per week — any days count"
                        >
                          {Math.min(habit.week.done, habit.week.target)} of {habit.week.target} this week
                        </Badge>
                      ) : habit.skipped ? (
                        <>
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <SkipForward />
                            Skipped
                          </Badge>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => toggleLog.mutate({ tabId: tab.id, habitId: habit.id, date: today, status: 'none' })}
                          >
                            Undo
                          </Button>
                        </>
                      ) : (
                        !habit.completed && (
                          // Shown on row hover / keyboard focus (always on touch devices)
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground opacity-0 group-hover/habit:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                            onClick={() =>
                              toggleLog.mutate({ tabId: tab.id, habitId: habit.id, date: today, status: 'skipped' })
                            }
                            title="Skip today — doesn't break your streak"
                          >
                            <SkipForward />
                            Skip
                          </Button>
                        )
                      )}
                    </div>
                    {noting === habit.id && (
                      <HabitNoteEditor
                        habitName={habit.name}
                        initial={habit.note}
                        onCancel={() => setNoting(null)}
                        onSave={(note) => {
                          setNote.mutate({ habitId: habit.id, date: today, note })
                          setNoting(null)
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
