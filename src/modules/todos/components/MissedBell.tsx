/**
 * The bell that opens "Missed items", with a count badge.
 *  - MissedMenuItem: sidebar entry (desktop; shows a dot when the sidebar is collapsed)
 *  - MissedBellButton: icon button for the mobile top bar
 */
import { Bell } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar'
import { useMissedItems } from '../services/todos.queries'
import { useMissedUiStore } from '../store/missedUiStore'

function useMissedCount() {
  const { data } = useMissedItems()
  return data?.items.length ?? 0
}

const label = (count: number) => (count ? `Missed items (${count})` : 'Missed items')

export function MissedMenuItem() {
  const count = useMissedCount()
  const setOpen = useMissedUiStore((state) => state.setOpen)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen(true)} tooltip={label(count)} className="relative">
        <Bell />
        <span>Missed items</span>
        {count > 0 && (
          // Visible only when collapsed (the number badge is hidden then)
          <span className="absolute top-1.5 left-5 hidden size-2 rounded-full bg-destructive group-data-[collapsible=icon]:block" />
        )}
      </SidebarMenuButton>
      {count > 0 && (
        <SidebarMenuBadge className="bg-destructive text-white peer-hover/menu-button:text-white">
          {count > 99 ? '99+' : count}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

export function MissedBellButton() {
  const count = useMissedCount()
  const setOpen = useMissedUiStore((state) => state.setOpen)

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)} aria-label={label(count)}>
      <Bell />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  )
}
