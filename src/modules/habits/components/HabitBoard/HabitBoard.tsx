/**
 * Everything below the tab bar for one view: tab stats, period navigation +
 * "Add habit", the grid, loading / error / empty states, and the habit dialogs.
 * Weekly and monthly pages only differ in which period they load.
 */
import { useState, type ComponentProps } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AlertCircle, Archive, ListPlus, Plus } from 'lucide-react'
import { PeriodNavigator, TableSkeleton } from '@/shared/components'
import { Alert, AlertAction, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { getErrorMessage } from '@/shared/api/apiError'
import { MAX_HABITS_PER_TAB, SUGGESTIONS_UNTIL_HABITS } from '../../constants'
import {
  useArchiveHabit,
  useArchivedHabits,
  useDeleteHabit,
  useReorderHabits,
  useToggleLog,
} from '../../services/habits.queries'
import type { GridView, Habit } from '../../types/habits.types'
import { AddEditHabitModal } from '../AddEditHabitModal/AddEditHabitModal'
import { ArchivedHabitsDialog } from '../ArchivedHabitsDialog/ArchivedHabitsDialog'
import { DeleteHabitDialog } from '../DeleteHabitDialog/DeleteHabitDialog'
import { HabitGrid } from '../HabitGrid/HabitGrid'
import { HabitSuggestions } from '../HabitSuggestions/HabitSuggestions'
import { TabStatsSummary } from '../TabStatsSummary/TabStatsSummary'

interface HabitBoardProps {
  tabId: string
  variant: 'weekly' | 'monthly'
  viewQuery: UseQueryResult<GridView>
  navigator: ComponentProps<typeof PeriodNavigator>
}

/** undefined = dialog closed, null = creating, Habit = editing */
type EditingState = Habit | null | undefined

export function HabitBoard({ tabId, variant, viewQuery, navigator }: HabitBoardProps) {
  const toggleLog = useToggleLog()
  const reorderHabits = useReorderHabits(tabId)
  const deleteHabit = useDeleteHabit(tabId)
  const archiveHabit = useArchiveHabit(tabId)
  const archived = useArchivedHabits(tabId)
  const archivedCount = archived.data?.length ?? 0
  const [editing, setEditing] = useState<EditingState>(undefined)
  const [deleting, setDeleting] = useState<Habit | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const view = viewQuery.data
  const habitCount = view?.habits.length ?? 0
  const canAdd = habitCount < MAX_HABITS_PER_TAB
  const habitNames = view?.habits.map((habit) => habit.name) ?? []

  return (
    // Takes the remaining page height; the grid inside shrinks and scrolls.
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <TabStatsSummary tabId={tabId} />

      {/* Period navigation on the left, "Add habit" lined up with the table's right edge */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        <PeriodNavigator {...navigator} />
        {habitCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={canAdd ? undefined : 0}>
                <Button onClick={() => setEditing(null)} disabled={!canAdd}>
                  <Plus />
                  New habit
                </Button>
              </span>
            </TooltipTrigger>
            {!canAdd && <TooltipContent>A tab can have at most {MAX_HABITS_PER_TAB} habits</TooltipContent>}
          </Tooltip>
        )}
        {archivedCount > 0 && (
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setShowArchived(true)}>
            <Archive />
            Archived ({archivedCount})
          </Button>
        )}
      </div>

      {viewQuery.isPending && <TableSkeleton />}

      {viewQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(viewQuery.error)}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => viewQuery.refetch()}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {view && habitCount === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListPlus />
            </EmptyMedia>
            <EmptyTitle>Every journey starts with one habit</EmptyTitle>
            <EmptyDescription>Start your first one here. Pick something small you can do today.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-lg gap-4">
            <Button onClick={() => setEditing(null)}>
              <Plus />
              Start your first habit
            </Button>
            <HabitSuggestions tabId={tabId} existingNames={habitNames} layout="centered" />
          </EmptyContent>
        </Empty>
      )}

      {view && habitCount > 0 && (
        <HabitGrid
          view={view}
          variant={variant}
          onEdit={(habit) => setEditing(habit)}
          onDelete={(habit) => setDeleting(habit)}
          onArchive={(habit) => archiveHabit.mutate(habit.id)}
          onReorder={(ids) => reorderHabits.mutate(ids)}
          onToggle={(habit, date, status) => toggleLog.mutate({ tabId, habitId: habit.id, date, status })}
        />
      )}

      {/* Keep offering quick starts until the tab has a few habits */}
      {view && habitCount > 0 && habitCount < SUGGESTIONS_UNTIL_HABITS && (
        <HabitSuggestions tabId={tabId} existingNames={habitNames} layout="inline" />
      )}

      {editing !== undefined && (
        <AddEditHabitModal key={editing?.id ?? 'new'} tabId={tabId} habit={editing} onClose={() => setEditing(undefined)} />
      )}

      <DeleteHabitDialog
        habit={deleting}
        deleting={deleteHabit.isPending}
        archiving={archiveHabit.isPending}
        onKeep={() => setDeleting(null)}
        onArchive={() => deleting && archiveHabit.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onDelete={() => deleting && deleteHabit.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />

      {showArchived && (
        <ArchivedHabitsDialog tabId={tabId} canRestore={canAdd} onClose={() => setShowArchived(false)} />
      )}
    </section>
  )
}
