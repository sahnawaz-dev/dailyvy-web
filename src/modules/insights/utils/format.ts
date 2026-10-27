/** Small formatting helpers for the weekly review. */

/** 0.825 → '83%' */
export const percent = (rate: number | null) => (rate === null ? '—' : `${Math.round(rate * 100)}%`)

/** 125 → '2h 5m', 45 → '45m', 0 → '0m' */
export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export type Trend = { text: string; direction: 'up' | 'down' | 'same' } | null

/** Change in percentage points: 0.7 → 0.82 → '+12 pts'. Null when there's nothing to compare. */
export function rateTrend(current: number | null, previous: number | null): Trend {
  if (current === null || previous === null) return null
  const diff = Math.round((current - previous) * 100)
  if (diff === 0) return { text: 'same as last week', direction: 'same' }
  return { text: `${diff > 0 ? '+' : ''}${diff} pts vs last week`, direction: diff > 0 ? 'up' : 'down' }
}

/** Change in an amount: minutes or a count. */
export function amountTrend(current: number, previous: number, format: (n: number) => string = String): Trend {
  if (current === 0 && previous === 0) return null
  const diff = current - previous
  if (diff === 0) return { text: 'same as last week', direction: 'same' }
  return {
    text: `${diff > 0 ? '+' : '−'}${format(Math.abs(diff))} vs last week`,
    direction: diff > 0 ? 'up' : 'down',
  }
}
