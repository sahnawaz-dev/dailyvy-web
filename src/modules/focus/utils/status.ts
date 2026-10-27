import type { FocusDayStatus } from '../types/focus.types'

export const STATUS_LABEL: Record<FocusDayStatus, string> = {
  met: 'Goal reached',
  'in-progress': 'In progress',
  partial: 'Under goal',
  missed: 'No focus',
  rest: 'Rest day',
  none: '',
}

/** Calendar cells + legend. */
export const STATUS_CELL_CLASS: Record<FocusDayStatus, string> = {
  met: 'bg-success text-success-foreground hover:bg-success/90 hover:text-success-foreground',
  'in-progress': 'bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary',
  partial: 'bg-warning/20 text-warning hover:bg-warning/30 hover:text-warning',
  missed: 'bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive',
  rest: 'bg-muted/60 text-muted-foreground',
  none: 'text-muted-foreground/50',
}

/** Week chart bars. */
export const STATUS_BAR_CLASS: Record<FocusDayStatus, string> = {
  met: 'bg-success',
  'in-progress': 'bg-primary',
  partial: 'bg-warning',
  missed: 'bg-destructive/40',
  rest: 'bg-muted-foreground/40',
  none: 'bg-muted',
}
