/**
 * History of missed items the user already handled — "Added to today" or
 * "Dismissed" — over the last 7 days, grouped by the day it was handled.
 */
import { CheckCircle2, History, ListTodo, XCircle } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/shared/components/ui/item'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatDisplay } from '@/shared/utils/date'
import { useMissedHistory } from '../services/todos.queries'
import type { MissedHistoryItem } from '../types/todos.types'

/** Handled-on day (local) → items, newest first. */
function groupByHandledDay(items: MissedHistoryItem[]) {
  const groups = new Map<string, MissedHistoryItem[]>()
  for (const item of items) {
    const day = new Date(item.handledAt).toDateString()
    groups.set(day, [...(groups.get(day) ?? []), item])
  }
  return [...groups.entries()]
}

function dayLabel(day: string) {
  const date = new Date(day)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
}

export function MissedHistoryList() {
  const history = useMissedHistory(true)

  if (history.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading history">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  const items = history.data?.items ?? []
  if (items.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>No history yet</EmptyTitle>
          <EmptyDescription>
            Items you add to today or dismiss show up here for {history.data?.historyDays ?? 7} days.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {groupByHandledDay(items).map(([day, dayItems]) => (
        <section key={day} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{dayLabel(day)}</h3>
          <ItemGroup className="gap-2">
            {dayItems.map((item) => {
              const added = item.action === 'added'
              return (
                <Item key={`${item.kind}:${item.refId}:${item.date}`} variant="outline" size="sm">
                  <ItemMedia>
                    {item.kind === 'task' ? (
                      <ListTodo className="size-4 text-muted-foreground" />
                    ) : (
                      <span className="size-3 rounded-[3px]" style={{ background: item.color ?? 'var(--primary)' }} />
                    )}
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="truncate">{item.title}</ItemTitle>
                    <ItemDescription className="flex flex-wrap items-center gap-1.5">
                      {item.kind === 'task' ? 'Task' : 'Habit'} · missed{' '}
                      {formatDisplay(item.date, { day: 'numeric', month: 'short' })}
                      {item.tabName && <Badge variant="outline">{item.tabName}</Badge>}
                    </ItemDescription>
                  </ItemContent>
                  <Badge variant={added ? 'secondary' : 'outline'} className="shrink-0 gap-1">
                    {added ? <CheckCircle2 className="text-primary" /> : <XCircle className="text-muted-foreground" />}
                    {added ? 'Added to today' : 'Dismissed'}
                  </Badge>
                </Item>
              )
            })}
          </ItemGroup>
        </section>
      ))}
    </div>
  )
}
