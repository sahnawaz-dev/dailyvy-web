/**
 * Habits × days grid (shadcn Table), used by both the weekly and monthly views.
 * Rows = habits, columns = days. Cell state comes from utils/cellState.ts.
 * Only the table scrolls; the day header row and the habit column stay pinned.
 * Rows can be dragged by their grip handle to reorder the habits.
 */
import { createContext, useContext, type ReactNode } from 'react'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Archive, GripVertical, Pencil, SkipForward, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useReorderSensors } from '@/shared/hooks/useReorderSensors'
import { cn } from '@/shared/lib/utils'
import { dayOfMonth, formatDisplay } from '@/shared/utils/date'
import { MAX_HABITS_PER_TAB, WEEKDAY_SHORT } from '../../constants'
import type { GridHabit, GridView, HabitLogStatus, WeekProgress } from '../../types/habits.types'
import { getCellState } from '../../utils/cellState'
import { HabitGridCell } from './HabitGridCell'

interface HabitGridProps {
  view: GridView
  variant: 'weekly' | 'monthly'
  /** Mark a day: 'done' | 'skipped' | 'none' (only today is accepted). */
  onToggle: (habit: GridHabit, date: string, status: HabitLogStatus) => void
  onEdit: (habit: GridHabit) => void
  onDelete: (habit: GridHabit) => void
  /** Archive (pause) the habit — restorable from "Archived". */
  onArchive: (habit: GridHabit) => void
  /** Drag to reorder: every habit id, in the new order. */
  onReorder: (ids: string[]) => void
}

const longDate = (date: string) => formatDisplay(date, { weekday: 'long', day: 'numeric', month: 'long' })

export function HabitGrid({ view, variant, onToggle, onEdit, onDelete, onArchive, onReorder }: HabitGridProps) {
  const compact = variant === 'monthly'
  const sensors = useReorderSensors()
  const ids = view.habits.map((habit) => habit.id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    // Shrinks to the space left on the page; the table container scrolls.
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-surface-fixed">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table
          containerClassName="min-h-36 flex-1 overflow-auto"
          // `separate` keeps borders attached to the sticky cells while scrolling.
          className="border-separate border-spacing-0 [&_td]:border-b [&_th]:border-b [&_tbody_tr:last-child>*]:border-b-0"
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className={cn(
                  'sticky top-0 left-0 z-20 border-r bg-surface-fixed text-xs tracking-wide text-muted-foreground uppercase',
                  compact ? 'w-60 px-3' : 'px-4',
                )}
              >
                Habit
              </TableHead>
              {view.days.map(({ date, weekday }) => (
                <TableHead
                  key={date}
                  aria-label={longDate(date)}
                  className={cn(
                    'sticky top-0 z-10 h-auto py-2 text-center',
                    // Monthly: 31 narrow columns (24px) so the whole month fits next to the open sidebar
                    compact ? 'min-w-6 px-0' : 'min-w-14',
                    // Sticky → needs an opaque background that matches the table behind it
                    date === view.today ? 'bg-today-fixed' : 'bg-surface-fixed',
                  )}
                >
                  <span className="block text-xs font-normal text-muted-foreground">
                    {compact ? WEEKDAY_SHORT[weekday][0] : WEEKDAY_SHORT[weekday]}
                  </span>
                  <span className={cn('block font-semibold', date === view.today && 'text-primary')}>
                    {dayOfMonth(date)}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {view.habits.map((habit) => {
                const completed = new Set(habit.completedDates)
                const skipped = new Set(habit.skippedDates ?? [])
                const todayState = getCellState(habit, view.today, view.today, completed.has(view.today))
                // "Skip today" is offered while today is applicable and not done yet (not for "times per week")
                const canSkip = todayState.kind === 'today' && !todayState.checked && !habit.week
                const skippedToday = skipped.has(view.today)
                return (
                  <SortableRow key={habit.id} id={habit.id}>
                    <TableCell
                      className={cn(
                        'group/name sticky left-0 z-10 border-r bg-surface-fixed',
                        // Monthly: a fixed, narrower name column (long names are shortened, full name on hover)
                        compact ? 'w-60 max-w-60 min-w-60 px-3 py-1.5' : 'max-w-64 min-w-48 px-4 py-3',
                      )}
                    >
                      <div className={cn('flex items-center', compact ? 'gap-1.5' : 'gap-2')}>
                        <RowDragHandle name={habit.name} />
                        {/* Name, then the habit's icon (if any) right after it */}
                        <span className="flex min-w-0 flex-1 items-center gap-1.5" title={habit.name}>
                          <span className="truncate font-medium">{habit.name.toLocaleUpperCase()}</span>
                          {habit.icon && (
                            <span aria-hidden="true" className="shrink-0">
                              {habit.icon}
                            </span>
                          )}
                        </span>
                        {habit.week && <WeekCounter week={habit.week} />}
                        {/* Shown while hovering this habit's name cell / keyboard focus (always on touch devices). Monthly: the narrow
                            name column keeps its full width — the buttons float over the end of the name. */}
                        <span
                          className={cn(
                            'flex shrink-0 gap-0.5 opacity-0 group-hover/name:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100',
                            compact &&
                              'absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md bg-surface-fixed pl-1',
                          )}
                        >
                          {canSkip && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className={cn(skippedToday && 'text-primary')}
                              onClick={() => onToggle(habit, view.today, skippedToday ? 'none' : 'skipped')}
                              aria-pressed={skippedToday}
                              aria-label={skippedToday ? `Undo skip for ${habit.name}` : `Skip ${habit.name} today`}
                              title={skippedToday ? 'Undo skip' : 'Skip today (keeps your streak)'}
                            >
                              <SkipForward />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEdit(habit)}
                            aria-label={`Edit ${habit.name}`}
                            title="Edit"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onArchive(habit)}
                            aria-label={`Archive ${habit.name}`}
                            title="Archive (pause) — restore it any time"
                          >
                            <Archive />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(habit)}
                            aria-label={`Delete ${habit.name}`}
                            title="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      </div>
                    </TableCell>

                    {view.days.map(({ date }) => {
                      const state = getCellState(habit, date, view.today, completed.has(date), skipped.has(date))
                      return (
                        <TableCell
                          key={date}
                          className={cn('text-center', compact ? 'px-0 py-1.5' : 'py-3', date === view.today && 'bg-today')}
                        >
                          <HabitGridCell
                            state={state}
                            color={habit.color}
                            compact={compact}
                            // Monthly: a little smaller than the shared compact size (16px)
                            className={compact ? 'size-4 rounded-[4px] [&_svg]:size-2.5' : undefined}
                            label={`${habit.name}, ${longDate(date)}`}
                            onToggle={() => onToggle(habit, date, state.checked ? 'none' : 'done')}
                          />
                        </TableCell>
                      )
                    })}
                  </SortableRow>
                )
              })}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <div className="flex flex-wrap items-center gap-3 border-t bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {view.habits.length}/{MAX_HABITS_PER_TAB} habits
        </span>
        <Legend />
      </div>
    </div>
  )
}

type SortableHandle = Pick<ReturnType<typeof useSortable>, 'attributes' | 'listeners' | 'setActivatorNodeRef'>
const RowHandleContext = createContext<SortableHandle | null>(null)

/** A table row that can be dragged up and down by its RowDragHandle. */
function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
  })
  return (
    <RowHandleContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
      <TableRow
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
        className={cn('hover:bg-transparent', isDragging && 'relative z-30 shadow-lg [&>td]:bg-surface-fixed')}
      >
        {children}
      </TableRow>
    </RowHandleContext.Provider>
  )
}

/** The grip that drags its row: mouse drag, press and hold on touch, or focus it → Space, arrows, Space. */
function RowDragHandle({ name }: { name: string }) {
  const handle = useContext(RowHandleContext)
  if (!handle) return null
  const { setActivatorNodeRef, attributes, listeners } = handle
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${name}`}
      title="Drag to reorder"
      className="-ml-1 flex shrink-0 cursor-grab touch-none items-center rounded text-muted-foreground/50 hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  )
}

/** "2/3" — a "times per week" habit's progress this week. */
function WeekCounter({ week }: { week: WeekProgress }) {
  const met = week.done >= week.target
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold tabular-nums',
        met ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
      )}
      title={`${week.done} of ${week.target} this week`}
      aria-label={`${week.done} of ${week.target} this week`}
    >
      {Math.min(week.done, week.target)}/{week.target}
    </span>
  )
}

function Legend() {
  const items = [
    { label: 'Done (habit color)', className: 'bg-primary' },
    { label: 'Missed', className: 'border-2 border-muted-foreground/40' },
    { label: 'Skipped', className: 'border-2 border-dashed border-muted-foreground/40' },
    { label: 'Not tracked', className: 'bg-muted' },
  ]
  return (
    <ul className="ml-auto flex flex-wrap gap-3" aria-label="Legend">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn('size-3 rounded-[3px]', item.className)} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
