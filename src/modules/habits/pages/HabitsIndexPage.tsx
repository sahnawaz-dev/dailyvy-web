import { Navigate } from 'react-router'
import { useTabs } from '../services/habits.queries'
import { useHabitsUiStore } from '../store/habitsUiStore'

/** /habits → the last opened tab (or the first one), in the last used view mode. */
export function HabitsIndexPage() {
  const { data: tabs } = useTabs()
  const lastTabId = useHabitsUiStore((state) => state.lastTabId)
  const lastViewMode = useHabitsUiStore((state) => state.lastViewMode)

  if (!tabs?.length) return null // HabitsLayout renders the empty state

  const tab = tabs.find((t) => t.id === lastTabId) ?? tabs[0]
  return <Navigate to={`/habits/${tab.id}/${lastViewMode}`} replace />
}
