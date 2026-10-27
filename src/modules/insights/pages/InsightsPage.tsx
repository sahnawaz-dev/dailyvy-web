/**
 * Insights — the weekly review: headline numbers vs last week, the week day by
 * day, and the habits going strong / needing a little love. Browse back week by
 * week (to the week you joined).
 */
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { PageHeader, PeriodNavigator } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getErrorMessage } from '@/shared/api/apiError'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import type { DateString } from '@/shared/types/api'
import { addDays, formatWeekRange } from '@/shared/utils/date'
import { HabitHighlights } from '../components/HabitHighlights'
import { SummaryTiles } from '../components/SummaryTiles'
import { WeekBars } from '../components/WeekBars'
import { useWeeklyInsights } from '../services/insights.queries'
import { ChallengeTrophyShelf } from '@/modules/challenges'

export function InsightsPage() {
  useDocumentTitle('Insights')
  // undefined = this week (the server picks it in the user's timezone)
  const [weekStart, setWeekStart] = useState<DateString | undefined>(undefined)
  const insights = useWeeklyInsights(weekStart)
  const week = insights.data

  return (
    <>
      <PageHeader
        title="Weekly review"
        subtitle={week ? (week.isCurrentWeek ? 'This week so far' : 'A look back') : undefined}
      />

      {insights.isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(insights.error)}</AlertDescription>
        </Alert>
      )}

      {!week && !insights.isError && (
        <div className="flex flex-col gap-4" aria-busy aria-label="Loading insights">
          <Skeleton className="h-9 w-64" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {week && (
        <div className="flex flex-col gap-4">
          <PeriodNavigator
            label={formatWeekRange(week.weekStart)}
            onPrevious={() => setWeekStart(addDays(week.weekStart, -7))}
            onNext={() => setWeekStart(addDays(week.weekStart, 7))}
            onToday={() => setWeekStart(undefined)}
            isCurrent={week.isCurrentWeek}
            disablePrevious={week.weekStart <= week.firstWeekStart}
            disableNext={week.isCurrentWeek}
            previousLabel="Previous week"
            nextLabel="Next week"
          />
          <SummaryTiles week={week} />
          <WeekBars week={week} />
          <HabitHighlights best={week.habits.best} attention={week.habits.attention} />
          {/* Completed challenges (not tied to the week) */}
          <ChallengeTrophyShelf />
        </div>
      )}
    </>
  )
}
