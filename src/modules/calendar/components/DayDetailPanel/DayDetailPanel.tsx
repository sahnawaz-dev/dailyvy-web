/** Drill-down for one day: which habits were done or missed. */
import { AlertCircle, Check, SkipForward, StickyNote, X } from 'lucide-react'
import { ListSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/shared/components/ui/item'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import { formatDisplay } from '@/shared/utils/date'
import { STATUS_LABEL } from '../../constants'
import { useDayDetail } from '../../services/calendar.queries'
import type { CalendarFilter } from '../../types/calendar.types'

interface DayDetailPanelProps {
  filter: CalendarFilter
  date: string | null
  tabNames: Map<string, string>
}

export function DayDetailPanel({ filter, date, tabNames }: DayDetailPanelProps) {
  const detail = useDayDetail(filter, date)

  if (!date) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Select a day to see which habits were done.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card aria-live="polite" className="lg:h-full lg:min-h-0">
      <CardHeader>
        <CardTitle>{formatDisplay(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</CardTitle>
        {detail.data && (
          <CardDescription>
            {STATUS_LABEL[detail.data.status]} · {detail.data.completed} of {detail.data.applicable}
          </CardDescription>
        )}
      </CardHeader>
      {/* Only the list scrolls (desktop); the date + summary stay in view */}
      <CardContent className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {detail.isPending && <ListSkeleton rows={3} />}
        {detail.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(detail.error)}</AlertDescription>
          </Alert>
        )}
        {detail.data && (
          <ItemGroup className="gap-1">
            {detail.data.habits.map((habit) => (
              <Item key={habit.id} size="sm" className="px-0 py-1.5">
                <ItemMedia>
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full',
                      habit.completed
                        ? 'bg-success text-success-foreground'
                        : habit.skipped
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    {habit.completed ? (
                      <Check className="size-3.5" />
                    ) : habit.skipped ? (
                      <SkipForward className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {habit.icon && <span aria-hidden="true">{habit.icon}</span>}
                    {habit.name}
                    <span className="sr-only">
                      {habit.completed ? ' — done' : habit.skipped ? ' — skipped' : ' — missed'}
                    </span>
                  </ItemTitle>
                  {habit.note && (
                    <ItemDescription className="flex items-start gap-1 italic">
                      <StickyNote className="mt-0.5 size-3 shrink-0 not-italic" aria-label="Note" />
                      {habit.note}
                    </ItemDescription>
                  )}
                </ItemContent>
                {filter.scope === 'all' && (
                  <ItemActions>
                    <Badge variant="outline">{tabNames.get(habit.tabId) ?? 'Deleted tab'}</Badge>
                  </ItemActions>
                )}
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
