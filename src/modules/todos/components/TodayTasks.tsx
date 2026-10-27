/**
 * "Tasks for today" — one-off to-dos sorted by due time. Tick / untick any
 * number of times today; edit (title + due time) or delete from the row.
 * Adding: a centered "Add task" button when the list is empty, otherwise a
 * small "Add task" button next to the title.
 */
import { useState } from 'react'
import { AlertCircle, Clock, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react'
import { ListSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import { useCurrentUser } from '@/modules/auth'
import { useClock } from '../hooks/useClock'
import { useDeleteTodo, useTodayTodos, useToggleTodo } from '../services/todos.queries'
import type { Todo } from '../types/todos.types'
import { formatTime, isOverdue } from '../utils/time'
import { EditTaskDialog } from './EditTaskDialog'

/** `onAdd` opens the Add task dialog (owned by the page). */
export function TodayTasks({ onAdd }: { onAdd: () => void }) {
  const user = useCurrentUser()
  const now = useClock(user.timezone)
  const todos = useTodayTodos()
  const toggle = useToggleTodo()
  const remove = useDeleteTodo()
  const [editing, setEditing] = useState<Todo | null>(null)

  const list = todos.data?.todos ?? []
  const done = list.filter((t) => t.completed).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tasks for today
          {list.length > 0 && (
            <Button size="sm" onClick={onAdd}>
              <Plus />
              Add task
            </Button>
          )}
        </CardTitle>
        {list.length > 0 && (
          <CardAction>
            <Badge variant="secondary">
              {done}/{list.length} done
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {todos.isPending && <ListSkeleton rows={3} />}
        {todos.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{getErrorMessage(todos.error)}</AlertDescription>
          </Alert>
        )}

        {todos.data && list.length === 0 && (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodo />
              </EmptyMedia>
              <EmptyTitle>Nothing planned yet</EmptyTitle>
              <EmptyDescription>Plan something for today — or turn it into a habit.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAdd}>
                <Plus />
                Add task
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {list.length > 0 && (
          <ul className="flex flex-col">
            {list.map((todo) => {
              const overdue = isOverdue(todo.dueTime, todo.completed, now)
              return (
                <li
                  key={todo.id}
                  className="group/todo flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50"
                >
                  <Checkbox
                    id={`todo-${todo.id}`}
                    className="size-5 rounded-[5px]"
                    checked={todo.completed}
                    onCheckedChange={(checked) => toggle.mutate({ todoId: todo.id, completed: checked === true })}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn(
                      'min-w-0 flex-1 cursor-pointer truncate text-sm transition-colors',
                      todo.completed && 'text-muted-foreground line-through',
                    )}
                    title={todo.title}
                  >
                    {todo.title}
                  </label>

                  {todo.dueTime && (
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 text-xs tabular-nums',
                        overdue ? 'font-medium text-destructive' : 'text-muted-foreground',
                        todo.completed && 'line-through',
                      )}
                      title={overdue ? 'Overdue' : 'Due time'}
                    >
                      <Clock className="size-3.5" />
                      {formatTime(todo.dueTime)}
                    </span>
                  )}
                  {overdue && (
                    <Badge variant="destructive" className="shrink-0">
                      Overdue
                    </Badge>
                  )}

                  <span className="flex shrink-0 gap-0.5 opacity-0 group-hover/todo:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setEditing(todo)}
                      aria-label={`Edit ${todo.title}`}
                      title="Edit"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove.mutate(todo.id)}
                      aria-label={`Delete ${todo.title}`}
                      title="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      {editing && <EditTaskDialog key={editing.id} todo={editing} onClose={() => setEditing(null)} />}
    </Card>
  )
}
