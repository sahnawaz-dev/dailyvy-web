/**
 * Loading placeholders shaped like the content that's coming (instead of a
 * spinner), built from shadcn's <Skeleton>.
 *   <ListSkeleton rows={3} />     rows of [circle] [line]  (tasks, devices, day details)
 *   <TableSkeleton rows={4} />    habit grid: name + 7 day cells
 *   <MonthSkeleton />             calendar month (5 × 7)
 *   <TabsSkeleton />              a row of tab pills
 */
import { Skeleton } from '@/shared/components/ui/skeleton'

export function ListSkeleton({ rows = 3, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className={tall ? 'size-9 rounded-lg' : 'size-5 rounded-full'} />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4" style={{ width: `${70 - i * 12}%` }} />
            {tall && <Skeleton className="h-3 w-1/3" />}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4" aria-label="Loading" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32 shrink-0" />
          <div className="flex flex-1 justify-between gap-2">
            {Array.from({ length: 7 }, (__, day) => (
              <Skeleton key={day} className="size-7 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MonthSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2" aria-label="Loading" aria-busy>
      {Array.from({ length: 35 }, (_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-2" aria-label="Loading" aria-busy>
      <Skeleton className="h-9 w-28 rounded-lg" />
      <Skeleton className="h-9 w-24 rounded-lg" />
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  )
}
