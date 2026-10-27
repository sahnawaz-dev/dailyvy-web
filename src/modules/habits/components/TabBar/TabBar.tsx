import { useNavigate } from 'react-router'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { useReorderSensors } from '@/shared/hooks/useReorderSensors'
import { cn } from '@/shared/lib/utils'
import { MAX_TABS } from '../../constants'
import { useReorderTabs } from '../../services/habits.queries'
import type { Tab, ViewMode } from '../../types/habits.types'

interface TabBarProps {
  tabs: Tab[]
  activeTabId?: string
  viewMode: ViewMode
  onAddTab: () => void
  onEditTab: (tab: Tab) => void
}

/**
 * Habit tabs (shadcn Tabs used as navigation) + edit / add buttons.
 * Drag a tab sideways to reorder (mouse, or press and hold on touch).
 */
export function TabBar({ tabs, activeTabId, viewMode, onAddTab, onEditTab }: TabBarProps) {
  const navigate = useNavigate()
  const canAdd = tabs.length < MAX_TABS
  const activeTab = tabs.find((tab) => tab.id === activeTabId)
  const reorder = useReorderTabs()
  // Tabs keep their own keys (arrows move between tabs, Enter/Space select) — no keyboard drag
  const sensors = useReorderSensors({ keyboard: false })

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = tabs.map((tab) => tab.id)
    reorder.mutate(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    // Underlined page tabs with roomy spacing; the bar's bottom border is the track.
    <div className="mb-4 flex items-center gap-2 border-b">
      <Tabs
        value={activeTabId ?? ''}
        onValueChange={(tabId) => navigate(`/habits/${tabId}/${viewMode}`)}
        className="min-w-0"
      >
        <div className="overflow-x-auto pb-px [scrollbar-width:none]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tabs.map((tab) => tab.id)} strategy={horizontalListSortingStrategy}>
              <TabsList variant="line" aria-label="Habit tabs" className="h-11 gap-2 p-0">
                {tabs.map((tab) => (
                  <SortableTab key={tab.id} tab={tab} />
                ))}
              </TabsList>
            </SortableContext>
          </DndContext>
        </div>
      </Tabs>

      {activeTab && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEditTab(activeTab)}
          aria-label={`Edit tab ${activeTab.name}`}
          title="Edit tab"
        >
          <Pencil />
        </Button>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span wrapper so the tooltip still works when the button is disabled */}
          <span tabIndex={canAdd ? undefined : 0}>
            <Button variant="ghost" size="icon-sm" onClick={onAddTab} disabled={!canAdd} aria-label="Add tab">
              <Plus />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{canAdd ? 'Add tab' : `You can have at most ${MAX_TABS} tabs`}</TooltipContent>
      </Tooltip>
    </div>
  )
}

/** One tab that can be dragged sideways. Only the pointer listeners are used — the tab keeps its own role and keys. */
function SortableTab({ tab }: { tab: Tab }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: tab.id })
  return (
    <TabsTrigger
      ref={setNodeRef}
      value={tab.id}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform && { ...transform, y: 0 }), transition }}
      className={cn(
        'max-w-52 flex-none rounded-md px-4 py-2 text-[0.9rem] hover:bg-accent/60 after:bottom-[-6px] after:bg-primary data-active:font-semibold data-active:text-primary',
        isDragging && 'relative z-10 cursor-grabbing bg-accent shadow-md',
      )}
    >
      <span className="truncate">{tab.name}</span>
    </TabsTrigger>
  )
}
