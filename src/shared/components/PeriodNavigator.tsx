import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ButtonGroup } from '@/shared/components/ui/button-group'

interface PeriodNavigatorProps {
  label: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  /** Already showing the current period → "Today" is disabled. */
  isCurrent: boolean
  previousLabel: string
  nextLabel: string
  disablePrevious?: boolean
  disableNext?: boolean
}

/** ‹ › 5 – 11 Oct 2026 [Today] — used by the habit grids. */
export function PeriodNavigator({
  label,
  onPrevious,
  onNext,
  onToday,
  isCurrent,
  previousLabel,
  nextLabel,
  disablePrevious = false,
  disableNext = false,
}: PeriodNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <ButtonGroup>
        <Button variant="outline" size="icon" onClick={onPrevious} disabled={disablePrevious} aria-label={previousLabel}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} disabled={disableNext} aria-label={nextLabel}>
          <ChevronRight />
        </Button>
      </ButtonGroup>
      <h2 className="min-w-40 font-heading text-base font-semibold" aria-live="polite">
        {label}
      </h2>
      <Button variant="outline" size="sm" onClick={onToday} disabled={isCurrent}>
        Today
      </Button>
    </div>
  )
}
