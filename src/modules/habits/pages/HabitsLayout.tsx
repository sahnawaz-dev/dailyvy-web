/**
 * Shell of the habits module: header (title, view toggle, calendar link),
 * tab bar, then the active view via <Outlet />. The page fills the viewport height so
 * only the habit table scrolls.
 *
 * Routes: /habits/:tabId/weekly and /habits/:tabId/monthly (see ../routes.tsx)
 */
import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { AlertCircle, CalendarDays, FolderPlus, Plus } from 'lucide-react'
import { PageHeader, TableSkeleton, TabsSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { getErrorMessage } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { CelebrationOverlay } from '../components/CelebrationOverlay/CelebrationOverlay'
import { TabBar } from '../components/TabBar/TabBar'
import { TabFormModal } from '../components/TabFormModal/TabFormModal'
import { ViewToggle } from '../components/ViewToggle/ViewToggle'
import { useTabs } from '../services/habits.queries'
import { useHabitsUiStore } from '../store/habitsUiStore'
import type { Tab, ViewMode } from '../types/habits.types'

/** undefined = closed, null = creating, Tab = editing */
type TabModalState = Tab | null | undefined

export function HabitsLayout() {
  const { tabId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const tabs = useTabs()
  const rememberLocation = useHabitsUiStore((state) => state.rememberLocation)
  const [tabModal, setTabModal] = useState<TabModalState>(undefined)

  const viewMode: ViewMode = location.pathname.endsWith('/monthly') ? 'monthly' : 'weekly'
  const activeTab = tabs.data?.find((tab) => tab.id === tabId)
  useDocumentTitle(activeTab ? `${activeTab.name} · Habits` : 'Habits')

  useEffect(() => {
    if (activeTab) rememberLocation(activeTab.id, viewMode)
  }, [activeTab, viewMode, rememberLocation])

  if (tabs.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <TabsSkeleton />
        <TableSkeleton />
      </div>
    )
  }
  if (tabs.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{getErrorMessage(tabs.error)}</AlertDescription>
      </Alert>
    )
  }

  // A deleted / unknown tab in the URL → back to the default tab.
  if (tabId && !activeTab) return <Navigate to="/habits" replace />

  const tabModalElement = tabModal !== undefined && (
    <TabFormModal
      key={tabModal?.id ?? 'new'}
      tab={tabModal}
      onClose={() => setTabModal(undefined)}
      onCreated={(tab) => navigate(`/habits/${tab.id}/${viewMode}`)}
      onDeleted={() => navigate('/habits', { replace: true })}
    />
  )

  if (tabs.data.length === 0) {
    return (
      <>
        <PageHeader title="Habits" />
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderPlus />
            </EmptyMedia>
            <EmptyTitle>Create your first tab</EmptyTitle>
            <EmptyDescription>Tabs group your habits — for example "Health", "Work" or "Learning".</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setTabModal(null)}>
              <Plus />
              New tab
            </Button>
          </EmptyContent>
        </Empty>
        {tabModalElement}
      </>
    )
  }

  return (
    // Fills the content area's height; the habit table inside takes what's left.
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Habits"
        subtitle="You can only check off today. Past days are read-only."
        actions={
          activeTab && (
            <>
              <ViewToggle tabId={activeTab.id} viewMode={viewMode} />
              <Button variant="outline" size="icon" asChild>
                <Link
                  to={`/calendar?scope=tab&tabId=${activeTab.id}`}
                  aria-label="Open calendar history"
                  title="Calendar history"
                >
                  <CalendarDays />
                </Link>
              </Button>
            </>
          )
        }
      />

      <TabBar
        tabs={tabs.data}
        activeTabId={activeTab?.id}
        viewMode={viewMode}
        onAddTab={() => setTabModal(null)}
        onEditTab={(tab) => setTabModal(tab)}
      />

      {/* Stats, Add habit, period navigation and the grid live in HabitBoard. */}
      <Outlet />

      {tabModalElement}
      <CelebrationOverlay />
    </div>
  )
}
