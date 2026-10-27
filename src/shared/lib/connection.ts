/**
 * Connection status for the banner (app/components/ConnectionBanner.tsx):
 *  - offline:     the browser has no internet (TanStack Query's onlineManager)
 *  - unreachable: online, but the API didn't answer (a request failed with a
 *                 network error); cleared by the next successful request
 *
 * While offline, React Query pauses requests and sends queued changes when the
 * connection returns — so changes made offline are kept while the app stays open.
 */
import { useSyncExternalStore } from 'react'
import { onlineManager } from '@tanstack/react-query'
import { create } from 'zustand'

interface ConnectionState {
  serverUnreachable: boolean
}

export const useConnectionStore = create<ConnectionState>(() => ({ serverUnreachable: false }))

/** Is this error "the server didn't answer" (no HTTP response at all)? */
export function isNetworkError(error: unknown) {
  const status = (error as { status?: number } | null)?.status
  return status === 0 && (error as { code?: string }).code === 'NETWORK_ERROR'
}

/** Called by the query client after every request. */
export function reportRequestResult(error: unknown | null) {
  const unreachable = error !== null && isNetworkError(error) && onlineManager.isOnline()
  if (useConnectionStore.getState().serverUnreachable !== unreachable) {
    // Only network errors set it; any answer from the server (success or a 4xx) clears it
    if (unreachable || error === null || !isNetworkError(error)) {
      useConnectionStore.setState({ serverUnreachable: unreachable })
    }
  }
}

export function useIsOnline() {
  return useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () => onlineManager.isOnline())
}
