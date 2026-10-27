import { useSyncExternalStore } from 'react'

/**
 * A once-per-second clock shared by every subscriber (one interval for the
 * whole app). Only ticks while something is subscribed with `enabled`.
 */
let now = Date.now()
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((notify) => notify())
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

const noSubscription = () => () => {}

/** Current time (ms), updated every second while `enabled`; 0 otherwise. */
export function useNow(enabled: boolean): number {
  return useSyncExternalStore(enabled ? subscribe : noSubscription, () => (enabled ? now : 0))
}
