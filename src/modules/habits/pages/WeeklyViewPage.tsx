import { useParams, useSearchParams } from 'react-router'
import { addDays, formatWeekRange, startOfWeek } from '@/shared/utils/date'
import { HabitBoard } from '../components/HabitBoard/HabitBoard'
import { useWeeklyView } from '../services/habits.queries'

/** /habits/:tabId/weekly?week=YYYY-MM-DD (no ?week = current week) */
export function WeeklyViewPage() {
  const { tabId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const requestedWeek = params.get('week') ?? undefined

  const query = useWeeklyView(tabId, requestedWeek)
  const weekStart = query.data?.weekStart ?? requestedWeek
  const currentWeek = query.data ? startOfWeek(query.data.today) : undefined

  const goToWeek = (week?: string) => setParams(week && week !== currentWeek ? { week } : {})

  return (
    <HabitBoard
      tabId={tabId}
      variant="weekly"
      viewQuery={query}
      navigator={{
        label: weekStart ? formatWeekRange(weekStart) : 'This week',
        onPrevious: () => weekStart && goToWeek(addDays(weekStart, -7)),
        onNext: () => weekStart && goToWeek(addDays(weekStart, 7)),
        onToday: () => goToWeek(undefined),
        isCurrent: !requestedWeek || requestedWeek === currentWeek,
        previousLabel: 'Previous week',
        nextLabel: 'Next week',
      }}
    />
  )
}
