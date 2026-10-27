import { useParams, useSearchParams } from 'react-router'
import { addMonths, formatMonth, monthOf } from '@/shared/utils/date'
import { HabitBoard } from '../components/HabitBoard/HabitBoard'
import { useMonthlyView } from '../services/habits.queries'

/** /habits/:tabId/monthly?month=YYYY-MM (no ?month = current month) */
export function MonthlyViewPage() {
  const { tabId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const requestedMonth = params.get('month') ?? undefined

  const query = useMonthlyView(tabId, requestedMonth)
  const month = query.data?.month ?? requestedMonth
  const currentMonth = query.data ? monthOf(query.data.today) : undefined

  const goToMonth = (target?: string) => setParams(target && target !== currentMonth ? { month: target } : {})

  return (
    <HabitBoard
      tabId={tabId}
      variant="monthly"
      viewQuery={query}
      navigator={{
        label: month ? formatMonth(month) : 'This month',
        onPrevious: () => month && goToMonth(addMonths(month, -1)),
        onNext: () => month && goToMonth(addMonths(month, 1)),
        onToday: () => goToMonth(undefined),
        isCurrent: !requestedMonth || requestedMonth === currentMonth,
        previousLabel: 'Previous month',
        nextLabel: 'Next month',
      }}
    />
  )
}
