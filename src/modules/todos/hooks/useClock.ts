import { useEffect, useState } from 'react'
import { nowInTimezone } from '../utils/time'

/** Current 'HH:mm' in the given timezone, refreshed every 30 seconds (for "overdue"). */
export function useClock(timeZone: string) {
  const [now, setNow] = useState(() => nowInTimezone(timeZone))

  useEffect(() => {
    const id = setInterval(() => setNow(nowInTimezone(timeZone)), 30_000)
    return () => clearInterval(id)
  }, [timeZone])

  return now
}
