import { useNavigate } from 'react-router'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import type { ViewMode } from '../../types/habits.types'

/** Weekly | Monthly switch. The URL is the source of truth for the view mode. */
export function ViewToggle({ tabId, viewMode }: { tabId: string; viewMode: ViewMode }) {
  const navigate = useNavigate()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={viewMode}
      onValueChange={(mode) => mode && navigate(`/habits/${tabId}/${mode}`)}
      aria-label="View mode"
    >
      <ToggleGroupItem value="weekly" className="px-3">
        Weekly
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" className="px-3">
        Monthly
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
