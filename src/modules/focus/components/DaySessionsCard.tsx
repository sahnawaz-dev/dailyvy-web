/** The focus sessions of one day — what the time was spent on. */
import { CircleCheck, CircleStop, Hourglass, Timer } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/shared/components/ui/item'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { DateString } from '@/shared/types/api'
import { addDays, formatDisplay } from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { useDaySessions } from '../services/focus.queries'
import type { FocusSession } from '../types/focus.types'
import { formatMinutes } from '../utils/time'

const STATUS_ICON = {
  running: Hourglass,
  paused: Hourglass,
  completed: CircleCheck,
  ended: CircleStop,
} as const

export function DaySessionsCard({ date, today }: { date: DateString; today: DateString }) {
  const { timezone } = useCurrentUser()
  const { data } = useDaySessions(date)
  const sessions = data?.sessions ?? []
  const total = sessions.reduce((sum, s) => sum + s.creditedMinutes, 0)

  const time = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(iso))

  const title =
    date === today
      ? "Today's sessions"
      : date === addDays(today, -1)
        ? "Yesterday's sessions"
        : formatDisplay(date, { weekday: 'long', day: 'numeric', month: 'short' })

  const describe = (session: FocusSession) => {
    const range = session.endedAt ? `${time(session.startedAt)} – ${time(session.endedAt)}` : `Started ${time(session.startedAt)}`
    return `${range} · ${session.plannedMinutes}-min session`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">{formatMinutes(total)}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!data ? (
          <Skeleton className="h-24" />
        ) : sessions.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Timer />
              </EmptyMedia>
              <EmptyTitle>No focus sessions</EmptyTitle>
              <EmptyDescription>
                {date === today ? 'Start one above — even 15 minutes counts.' : 'Nothing was tracked on this day.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-2">
            {sessions.map((session) => {
              const Icon = STATUS_ICON[session.status]
              const active = session.status === 'running' || session.status === 'paused'
              return (
                <Item key={session.id} variant="outline" size="sm">
                  <ItemMedia>
                    <Icon className={session.status === 'completed' ? 'size-4 text-success' : 'size-4 text-muted-foreground'} />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="truncate">{session.label ?? 'Focus session'}</ItemTitle>
                    <ItemDescription>{describe(session)}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {active ? (
                      <Badge>In progress</Badge>
                    ) : session.creditedMinutes > 0 ? (
                      <span className="text-sm font-semibold tabular-nums">{formatMinutes(session.creditedMinutes)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground" title="Ended before 5 minutes">
                        Not counted
                      </span>
                    )}
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
