import type { Tab } from '@/modules/habits'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import type { CalendarFilter } from '../../types/calendar.types'

interface ScopeToggleProps {
  filter: CalendarFilter
  tabs: Tab[]
  onChange: (filter: CalendarFilter) => void
}

/** "All tabs" vs. one specific tab. */
export function ScopeToggle({ filter, tabs, onChange }: ScopeToggleProps) {
  const selectedTabId = filter.tabId ?? tabs[0]?.id

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        value={filter.scope}
        onValueChange={(scope) => {
          if (scope === 'all') onChange({ scope: 'all' })
          if (scope === 'tab' && selectedTabId) onChange({ scope: 'tab', tabId: selectedTabId })
        }}
        aria-label="Calendar scope"
      >
        <ToggleGroupItem value="all" className="px-3">
          All tabs
        </ToggleGroupItem>
        <ToggleGroupItem value="tab" className="px-3" disabled={tabs.length === 0}>
          One tab
        </ToggleGroupItem>
      </ToggleGroup>

      {filter.scope === 'tab' && (
        <Select value={selectedTabId} onValueChange={(tabId) => onChange({ scope: 'tab', tabId })}>
          <SelectTrigger className="w-44" aria-label="Tab">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
