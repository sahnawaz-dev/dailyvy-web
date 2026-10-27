/**
 * Authenticated app shell built on shadcn's Sidebar:
 *  - collapses to icons (toggle button / Ctrl+B), remembered per browser
 *  - becomes a slide-over sheet on mobile
 * The page renders in <Outlet />; the shell itself never scrolls.
 */
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Download, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/shared/components/ui/sidebar'
import { promptInstall, usePwaInstallStore } from '@/shared/lib/pwaInstall'
import { logout, useCurrentUser } from '@/modules/auth'
import { FocusWatcher } from '@/modules/focus'
import { MissedBellButton, MissedItemsDialog, MissedMenuItem } from '@/modules/todos'
import { ConnectionBanner } from '../components/ConnectionBanner'
import { SidebarMiniCalendar } from '@/modules/calendar'
import { NAV_ITEMS } from '../navigation'
import { useAppUiStore } from '../store/appUiStore'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AppLayout() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sidebarOpen = useAppUiStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppUiStore((state) => state.setSidebarOpen)
  // The browser offers to install Dailyvy as an app (Chrome / Edge)
  const canInstall = usePwaInstallStore((state) => state.promptEvent !== null)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} className="h-svh">
      <Sidebar collapsible="icon">
        {/*
          Expanded: [logo  Dailyvy ........ toggle]
          Collapsed: just the logo; hovering the sidebar (or focusing the toggle)
          shows the toggle on top of the logo. Ctrl/Cmd+B also toggles.
        */}
        <SidebarHeader>
          <div className="relative flex h-10 items-center gap-2">
            <Link
              to="/today"
              aria-label="Dailyvy home"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              {/* Collapsed: hidden while the toggle shows in its place (hover / keyboard focus) */}
              <img
                src="/icons/icon-192.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 group-data-[collapsible=icon]:group-hover:opacity-0 group-data-[collapsible=icon]:group-has-[[data-sidebar=trigger]:focus-visible]:opacity-0"
              />
              <span className="truncate font-heading font-semibold group-data-[collapsible=icon]:hidden">
                Dailyvy
              </span>
            </Link>
            <SidebarTrigger
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="size-8 shrink-0 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:inset-0 group-data-[collapsible=icon]:bg-sidebar group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover:opacity-100 group-data-[collapsible=icon]:focus-visible:opacity-100"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to} className="mb-1">
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.to)} tooltip={item.label}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                    {item.badge && <item.badge />}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* This month at a glance (hidden when collapsed to icons) */}
          <SidebarGroup className="mt-auto">
            <SidebarMiniCalendar />
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {canInstall && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => promptInstall()} tooltip="Install Dailyvy as an app">
                  <Download />
                  <span>Install app</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {/* Bell: missed tasks & habits from the last 7 days */}
            <MissedMenuItem />
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild isActive={pathname.startsWith('/profile')} tooltip="Account">
                <NavLink to="/profile">
                  <Avatar className="size-8">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{user.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset id="main" className="min-h-0 overflow-hidden">
        {/* Mobile only: the sidebar is an off-canvas sheet there, so it needs an opener. */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
          <SidebarTrigger aria-label="Open menu" />
          <img src="/icons/icon-192.png" alt="" width={24} height={24} className="size-6" />
          <span className="flex-1 font-heading font-semibold">Dailyvy</span>
          <MissedBellButton />
        </header>
        {/* Offline / server unreachable — only shown while there's a problem */}
        <ConnectionBanner />
        {/* Pages that fill the height (habits) scroll inside; others scroll here. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 *:w-full">
          <Outlet />
        </div>
      </SidebarInset>

      {/* Opens automatically on first load when something was missed; the bell reopens it. */}
      <MissedItemsDialog />
      {/* Focus countdown in the tab title, end-of-session alerts, goal celebration */}
      <FocusWatcher />
    </SidebarProvider>
  )
}
