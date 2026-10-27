/**
 * "Fire once per day per scope" bookkeeping for the celebration overlay.
 * Toggling a habit off and on again the same day must NOT celebrate twice.
 */
import type { ToggleLogResult } from '../types/habits.types'

const PREFIX = 'habit-tracker:celebrated:'

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function celebrationKey(date: string, scope: 'tab' | 'all', tabId: string): string {
  return `${PREFIX}${date}:${scope === 'tab' ? tabId : 'all'}`
}

/** Removes markers from previous days so storage doesn't grow forever. */
function pruneOldMarkers(storage: Storage, today: string) {
  const stale: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (key?.startsWith(PREFIX) && !key.startsWith(`${PREFIX}${today}:`)) stale.push(key)
  }
  stale.forEach((key) => storage.removeItem(key))
}

/**
 * Returns true exactly once per day+scope, the first time everything is complete.
 * Records the celebration so later calls the same day return false.
 */
export function shouldCelebrate(
  result: ToggleLogResult,
  scope: 'tab' | 'all',
  storage: Storage | null = safeStorage(),
): boolean {
  const complete = scope === 'tab' ? result.dayComplete : result.allTabsComplete
  if (!result.completed || !complete) return false

  const key = celebrationKey(result.date, scope, result.tabId)
  try {
    if (storage?.getItem(key)) return false
    storage?.setItem(key, '1')
    if (storage) pruneOldMarkers(storage, result.date)
  } catch {
    // Storage unavailable (private mode...): still celebrate.
  }
  return true
}
