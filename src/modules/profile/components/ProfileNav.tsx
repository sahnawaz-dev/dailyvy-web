import { Link, useLocation } from 'react-router'
import { Bell, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

const SECTIONS: { value: string; to: string; label: string; icon: LucideIcon }[] = [
  { value: 'profile', to: '/profile', label: 'Profile', icon: UserRound },
  { value: 'security', to: '/profile/security', label: 'Security', icon: ShieldCheck },
  { value: 'reminders', to: '/profile/reminders', label: 'Reminders', icon: Bell },
]

/**
 * Profile / Security / Reminders sub-navigation: a rounded bar with icons; the
 * current section gets the soft accent highlight used for "active" across the
 * app. Radii are concentric: bar 12px − 4px padding = 8px tabs.
 */
export function ProfileNav() {
  const { pathname } = useLocation()
  const value = pathname.startsWith('/profile/security')
    ? 'security'
    : pathname.startsWith('/profile/reminders')
      ? 'reminders'
      : 'profile'

  return (
    <Tabs value={value} className="mb-5">
      <TabsList className="w-full gap-1 rounded-xl border bg-card/70 p-1 group-data-horizontal/tabs:h-auto sm:w-fit">
        {SECTIONS.map(({ value: section, to, label, icon: Icon }) => (
          <TabsTrigger
            key={section}
            value={section}
            asChild
            className="h-9 gap-2 rounded-lg px-4 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground data-active:bg-accent data-active:text-accent-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-accent dark:data-active:text-accent-foreground"
          >
            <Link to={to}>
              <Icon className="size-4" />
              {label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
