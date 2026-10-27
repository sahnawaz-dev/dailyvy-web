/**
 * Today — the home page, everything for today in one place:
 *   0. The active challenge (or an invitation to take one) — challenges module
 *   1. Tasks for today (one-off to-dos)
 *   2. Habits due today, grouped by habit tab
 *   3. Today's focus (goal progress + one-click start) — from the focus module
 * "Add task" (in the tasks card) adds a to-do for today or turns it into a habit.
 */
import { useState } from 'react'
import { PageHeader } from '@/shared/components'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { formatDisplay } from '@/shared/utils/date'
import { ChallengeCard } from '@/modules/challenges'
import { FocusTodayCard } from '@/modules/focus'
import { CelebrationOverlay } from '@/modules/habits'
import { AddTaskDialog } from '../components/AddTaskDialog'
import { TodayHabits } from '../components/TodayHabits'
import { TodayTasks } from '../components/TodayTasks'
import { useTodayTodos } from '../services/todos.queries'

export function TodosPage() {
  useDocumentTitle('Today')
  const [adding, setAdding] = useState(false)
  const { data } = useTodayTodos()

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={data ? formatDisplay(data.today, { weekday: 'long', day: 'numeric', month: 'long' }) : undefined}
      />

      <div className="mb-4">
        <ChallengeCard />
      </div>

      {/* Desktop: tasks + habits on the left, focus on the right. Mobile: focus last. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <TodayTasks onAdd={() => setAdding(true)} />
          <TodayHabits />
        </div>
        <div className="lg:sticky lg:top-0">
          <FocusTodayCard />
        </div>
      </div>

      {adding && <AddTaskDialog onClose={() => setAdding(false)} />}
      {/* Checking off the last habit due today here also earns the 🎉 */}
      <CelebrationOverlay />
    </>
  )
}
