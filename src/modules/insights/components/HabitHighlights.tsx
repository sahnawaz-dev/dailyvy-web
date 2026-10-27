/**
 * "Going strong" (best habits) and "Needs a little love" (lowest rates) — each
 * habit with its tab, a progress bar and done / due. Kind wording, no guilt.
 */
import { Sparkles, Sprout } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { HabitInsight } from '../types/insights.types'
import { percent } from '../utils/format'

function HabitRow({ habit }: { habit: HabitInsight }) {
  const color = habit.color ?? 'var(--primary)'
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1 truncate font-medium">
          {habit.icon && <span aria-hidden="true">{habit.icon} </span>}
          {habit.name}
        </span>
        {habit.tabName && <Badge variant="outline">{habit.tabName}</Badge>}
        <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">
          {habit.done}/{habit.due} · {percent(habit.rate)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full" style={{ width: `${(habit.rate ?? 0) * 100}%`, background: color }} />
      </div>
    </li>
  )
}

export function HabitHighlights({ best, attention }: { best: HabitInsight[]; attention: HabitInsight[] }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-success" />
            Going strong
          </CardTitle>
          <CardDescription>Your most consistent habits this week.</CardDescription>
        </CardHeader>
        <CardContent>
          {best.length ? (
            <ul className="flex flex-col gap-4">
              {best.map((habit) => (
                <HabitRow key={habit.id} habit={habit} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Check off a habit and it will show up here.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="size-4 text-warning" />
            Needs a little love
          </CardTitle>
          <CardDescription>A small step on these next week goes a long way.</CardDescription>
        </CardHeader>
        <CardContent>
          {attention.length ? (
            <ul className="flex flex-col gap-4">
              {attention.map((habit) => (
                <HabitRow key={habit.id} habit={habit} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing here — every habit got done. 🎉</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
