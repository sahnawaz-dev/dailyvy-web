/**
 * "Missed items" — unfinished tasks and habits from the last 7 days.
 * Opens automatically at most once a day (first load of the day) when there is
 * something to show; the bell (MissedBell) reopens it any time.
 * Each item: "Add to task" (adds it to today) or dismiss. The History tab lists
 * what was already handled (last 7 days).
 */
import { useEffect, useState } from 'react'
import { BellRing, CheckCheck, Clock, ListTodo, Plus, X } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/components/ui/item'
import { addDays, formatDisplay, todayInTimezone } from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { useAddMissedToToday, useDismissMissed, useMissedItems } from '../services/todos.queries'
import { useMissedUiStore } from '../store/missedUiStore'
import type { MissedItem } from '../types/todos.types'
import { formatTime } from '../utils/time'
import { MissedHistoryList } from './MissedHistoryList'

/** Remembers the last day it opened by itself (per user, per browser). */
const SHOWN_KEY = 'habit-tracker:missed-shown-on:'

/** Opens the dialog at most once a day if there are missed items — never nags. */
function useAutoOpenOncePerDay(userId: string, today: string, count: number | undefined) {
  const setOpen = useMissedUiStore((state) => state.setOpen)
  useEffect(() => {
    if (!count) return
    try {
      if (localStorage.getItem(SHOWN_KEY + userId) === today) return
      localStorage.setItem(SHOWN_KEY + userId, today)
    } catch {
      return // storage unavailable: rely on the bell instead of popping up every load
    }
    setOpen(true)
  }, [userId, today, count, setOpen])
}

function groupByDate(items: MissedItem[]) {
  const groups = new Map<string, MissedItem[]>()
  for (const item of items) groups.set(item.date, [...(groups.get(item.date) ?? []), item])
  return [...groups.entries()]
}

export function MissedItemsDialog() {
  const user = useCurrentUser()
  const open = useMissedUiStore((state) => state.open)
  const setOpen = useMissedUiStore((state) => state.setOpen)
  const missed = useMissedItems()
  const addToToday = useAddMissedToToday()
  const dismiss = useDismissMissed()
  const [view, setView] = useState<'review' | 'history'>('review')

  const items = missed.data?.items ?? []
  const today = todayInTimezone(user.timezone)
  useAutoOpenOncePerDay(user.id, today, missed.data?.items.length)

  const yesterday = addDays(today, -1)
  const dayLabel = (date: string) =>
    date === yesterday ? 'Yesterday' : formatDisplay(date, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="size-5 text-primary" />
            Missed items
          </DialogTitle>
          <DialogDescription>
            These tasks you missed to complete in the last {missed.data?.windowDays ?? 7} days. Add any of them to
            today.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={view} onValueChange={(next) => setView(next as 'review' | 'history')}>
          <TabsList>
            <TabsTrigger value="review">To review{items.length > 0 ? ` (${items.length})` : ''}</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === 'history' ? (
          <MissedHistoryList />
        ) : items.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCheck />
              </EmptyMedia>
              <EmptyTitle>You're all caught up</EmptyTitle>
              <EmptyDescription>Nothing missed recently. Keep it up!</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {groupByDate(items).map(([date, dayItems]) => (
              <section key={date} className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{dayLabel(date)}</h3>
                <ItemGroup className="gap-2">
                  {dayItems.map((item) => {
                    const ref = { kind: item.kind, refId: item.refId, date: item.date }
                    return (
                      <Item key={`${item.kind}:${item.refId}:${item.date}`} variant="outline" size="sm">
                        <ItemMedia>
                          {item.kind === 'task' ? (
                            <ListTodo className="size-4 text-muted-foreground" />
                          ) : (
                            <span
                              className="size-3 rounded-[3px]"
                              style={{ background: item.color ?? 'var(--primary)' }}
                            />
                          )}
                        </ItemMedia>
                        <ItemContent className="min-w-0">
                          <ItemTitle className="truncate">{item.title}</ItemTitle>
                          <ItemDescription className="flex flex-wrap items-center gap-1.5">
                            {item.kind === 'task' ? 'Task' : 'Habit'}
                            {item.tabName && <Badge variant="outline">{item.tabName}</Badge>}
                            {item.dueTime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" />
                                {formatTime(item.dueTime)}
                              </span>
                            )}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Button size="sm" variant="outline" onClick={() => addToToday.mutate(ref)}>
                            <Plus />
                            Add to task
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => dismiss.mutate([ref])}
                            aria-label={`Dismiss ${item.title}`}
                            title="Dismiss"
                          >
                            <X />
                          </Button>
                        </ItemActions>
                      </Item>
                    )
                  })}
                </ItemGroup>
              </section>
            ))}
          </div>
        )}

        <DialogFooter>
          {view === 'review' && items.length > 0 && (
            <Button
              variant="ghost"
              className="sm:mr-auto"
              onClick={() => dismiss.mutate(items.map(({ kind, refId, date }) => ({ kind, refId, date })))}
            >
              Dismiss all
            </Button>
          )}
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
