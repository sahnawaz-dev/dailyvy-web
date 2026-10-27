/** Live countdown next to "Focus" in the sidebar while a session (or break) is on. */
import { SidebarMenuBadge } from '@/shared/components/ui/sidebar'
import { useLiveSession } from '../hooks/useLiveSession'
import { useFocusUiStore } from '../store/focusUiStore'
import { formatClock } from '../utils/time'

export function FocusNavBadge() {
  const { session, remainingSeconds } = useLiveSession()
  const onBreak = useFocusUiStore((state) => Boolean(state.breakEndsAt))

  if (session) {
    return (
      <SidebarMenuBadge className="tabular-nums">
        {session.status === 'paused' ? '⏸ ' : ''}
        {formatClock(remainingSeconds)}
      </SidebarMenuBadge>
    )
  }
  if (onBreak) return <SidebarMenuBadge aria-label="On a break">☕</SidebarMenuBadge>
  return null
}
