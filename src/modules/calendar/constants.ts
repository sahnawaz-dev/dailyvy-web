import type { DayStatus } from './types/calendar.types'

export const STATUS_LABEL: Record<DayStatus, string> = {
  complete: 'All done',
  partial: 'Partially done',
  missed: 'Missed',
  'n/a': 'Nothing to track',
}

/** Tailwind classes for each day status (calendar cells + legend). */
export const STATUS_CLASS: Record<DayStatus, string> = {
  complete: 'bg-success text-success-foreground hover:bg-success/90 hover:text-success-foreground',
  partial: 'bg-warning/20 text-warning hover:bg-warning/30 hover:text-warning',
  missed: 'bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive',
  'n/a': 'bg-muted/60 text-muted-foreground',
}
