/**
 * Main navigation entries. `badge` renders live status next to the label
 * (e.g. the focus countdown).
 */
import type { ComponentType } from 'react'
import { ChartNoAxesColumn, ListChecks, Sun, Timer, type LucideIcon } from 'lucide-react'
import { FocusNavBadge } from '@/modules/focus'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: ComponentType
}

export const NAV_ITEMS: NavItem[] = [
  // Home: today's tasks, habits and focus on one page
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  // { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/focus', label: 'Focus', icon: Timer, badge: FocusNavBadge },
  // Weekly review: habits, focus and tasks vs last week
  { to: '/insights', label: 'Insights', icon: ChartNoAxesColumn },
]
