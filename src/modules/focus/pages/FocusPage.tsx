/**
 * Focus page:
 *   timer (start / running / break)  |  today's goal ring + streak
 *   4 key stats
 *   History (folded by default — kept simple):
 *     more stats · week chart · focus calendar (pick a day) | sessions of that day
 */
import { useState } from 'react'
import { AlertCircle, ChevronDown, Settings2 } from 'lucide-react'
import { PageHeader } from '@/shared/components'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import type { DateString } from '@/shared/types/api'
import { dateInTimezone, formatDisplay } from '@/shared/utils/date'
import { useCurrentUser } from '@/modules/auth'
import { DaySessionsCard } from '../components/DaySessionsCard'
import { FocusCalendar } from '../components/FocusCalendar'
import { FocusSettingsDialog } from '../components/FocusSettingsDialog'
import { FocusStats } from '../components/FocusStats'
import { FocusTimerCard } from '../components/FocusTimerCard'
import { GoalProgressCard } from '../components/GoalProgressCard'
import { FocusChart } from '../components/FocusChart'
import { useFocusSettings, useFocusSummary } from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'

export function FocusPage() {
  useDocumentTitle('Focus')
  const user = useCurrentUser()
  const summary = useFocusSummary()
  const settings = useFocusSettings()
  const [editingSettings, setEditingSettings] = useState(false)
  const [pickedDate, setPickedDate] = useState<DateString | null>(null)
  const historyOpen = useFocusUiStore((state) => state.historyOpen)
  const setHistoryOpen = useFocusUiStore((state) => state.setHistoryOpen)

  // Loading: the page's cards in placeholder form (timer + goal, then stats)
  if (summary.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-label="Loading focus" aria-busy>
        <Skeleton className="h-9 w-48" />
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }
  if (summary.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{getErrorMessage(summary.error)}</AlertDescription>
      </Alert>
    )
  }

  const { today } = summary.data
  const selectedDate = pickedDate ?? today
  const openSettings = () => setEditingSettings(true)

  return (
    <>
      <PageHeader
        title="Focus"
        subtitle={formatDisplay(today, { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <Button variant="outline" onClick={openSettings} disabled={!settings.data}>
            <Settings2 />
            Focus settings
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <FocusTimerCard />
          <GoalProgressCard onEditGoal={openSettings} />
        </div>

        <FocusStats show="main" />

        <section className="flex flex-col gap-4" aria-label="Focus history">
          <Button
            variant="ghost"
            className="self-start"
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen(!historyOpen)}
          >
            <ChevronDown className={cn('transition-transform', !historyOpen && '-rotate-90')} />
            {historyOpen ? 'Hide history' : 'Show history'}
          </Button>

          {historyOpen && (
            <>
              <FocusStats show="more" />
              <FocusChart today={today} registeredOn={dateInTimezone(new Date(user.registeredAt), user.timezone)} />
              {/* Pick a day on the left → its sessions on the right */}
              <div className="grid items-start gap-4 lg:grid-cols-2">
                <FocusCalendar
                  today={today}
                  registeredOn={dateInTimezone(new Date(user.registeredAt), user.timezone)}
                  selectedDate={selectedDate}
                  onSelect={setPickedDate}
                />
                <DaySessionsCard date={selectedDate} today={today} />
              </div>
            </>
          )}
        </section>
      </div>

      {editingSettings && settings.data && (
        <FocusSettingsDialog settings={settings.data} onClose={() => setEditingSettings(false)} />
      )}
    </>
  )
}
