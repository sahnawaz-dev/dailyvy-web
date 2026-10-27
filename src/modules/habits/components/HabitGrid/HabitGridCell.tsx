/**
 * One cell of the habit grid. Only the "today" cell is interactive (a shadcn
 * Checkbox); every other state is a read-only marker that is still announced
 * to screen readers. Checked / done cells use the habit's own color.
 * Skipped days show a muted ⏭ marker; today's skipped cell is a button that
 * marks the habit done instead.
 */
import type { CSSProperties } from 'react'
import { Check, SkipForward } from 'lucide-react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/utils'
import { describeCell, type CellKind, type CellState } from '../../utils/cellState'

interface HabitGridCellProps {
  state: CellState
  /** e.g. "Run, Monday 5 October" */
  label: string
  /** The habit's color (hex); falls back to the theme's primary color. */
  color?: string | null
  compact?: boolean
  /** Extra classes (e.g. `mx-0` when used outside the grid). */
  className?: string
  onToggle: () => void
}

const READ_ONLY_STYLES: Record<Exclude<CellKind, 'today'>, string> = {
  done: 'bg-(--habit-color) text-white',
  missed: 'border-2 border-muted-foreground/40',
  future: 'border-2 border-dashed border-border',
  'not-applicable': 'bg-muted',
  skipped: 'border-2 border-dashed border-muted-foreground/40 text-muted-foreground',
  open: 'border border-border',
}

export function HabitGridCell({ state, label, color, compact = false, className, onToggle }: HabitGridCellProps) {
  const ariaLabel = `${label}: ${describeCell(state)}`
  // Same rounded-square shape in weekly and monthly views, just smaller in monthly.
  const size = compact ? 'size-5 rounded-[5px]' : 'size-7 rounded-md'
  const style = { '--habit-color': color ?? 'var(--primary)' } as CSSProperties

  // Skipped today: a muted ⏭ — clicking marks it done after all
  if (state.editable && state.skipped) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        title="Skipped today — click to mark done"
        style={style}
        className={cn(
          'mx-auto grid place-items-center transition-transform hover:scale-110 active:scale-95',
          size,
          READ_ONLY_STYLES.skipped,
          className,
        )}
      >
        <SkipForward className={compact ? 'size-3' : 'size-3.5'} />
      </button>
    )
  }

  if (state.editable) {
    return (
      <Checkbox
        checked={state.checked}
        onCheckedChange={onToggle}
        aria-label={ariaLabel}
        style={style}
        className={cn(
          size,
          'mx-auto border-2 border-(--habit-color) transition-transform hover:scale-110 active:scale-95',
          'data-checked:border-(--habit-color) data-checked:bg-(--habit-color) data-checked:text-white',
          // The shadcn Checkbox sets `dark:data-checked:bg-primary`, which outranks the line above in dark mode.
          'dark:data-checked:bg-(--habit-color)',
          compact ? '[&_svg]:size-3' : '[&_svg]:size-4',
          className,
        )}
      />
    )
  }

  const kind = state.kind as Exclude<CellKind, 'today'>
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={describeCell(state)}
      style={style}
      className={cn('mx-auto grid place-items-center', size, READ_ONLY_STYLES[kind], className)}
    >
      {kind === 'done' && <Check className={compact ? 'size-3' : 'size-4'} />}
      {kind === 'skipped' && <SkipForward className={compact ? 'size-3' : 'size-3.5'} />}
      {kind === 'not-applicable' && <span aria-hidden="true" className="h-0.5 w-2.5 rounded bg-muted-foreground/60" />}
    </span>
  )
}
