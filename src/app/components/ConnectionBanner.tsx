/**
 * A slim banner at the top of the app while the connection is a problem:
 *  - offline:      "You're offline" — changes are kept and saved when you're back
 *  - unreachable:  "Can't reach Dailyvy" — with Try again
 * When the connection comes back, a short "Back online" toast instead.
 */
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CloudOff, RefreshCw, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { useConnectionStore, useIsOnline } from '@/shared/lib/connection'

export function ConnectionBanner() {
  const online = useIsOnline()
  const unreachable = useConnectionStore((state) => state.serverUnreachable)
  const queryClient = useQueryClient()

  // "Back online" once, after having been offline
  const wasOffline = useRef(false)
  useEffect(() => {
    if (!online) {
      wasOffline.current = true
    } else if (wasOffline.current) {
      wasOffline.current = false
      toast.success('Back online — your changes are syncing.')
    }
  }, [online])

  if (online && !unreachable) return null

  const retry = () => queryClient.refetchQueries({ type: 'active' })

  return (
    <div
      role="status"
      className="flex shrink-0 items-center gap-2 border-b border-warning/30 bg-warning/15 px-4 py-2 text-sm text-foreground"
    >
      {!online ? (
        <>
          <WifiOff className="size-4 shrink-0 text-warning" />
          <span className="min-w-0 flex-1">
            <strong className="font-medium">You’re offline.</strong>{' '}
            <span className="text-muted-foreground">
              Changes you make are kept and saved when you’re back online — keep Dailyvy open.
            </span>
          </span>
        </>
      ) : (
        <>
          <CloudOff className="size-4 shrink-0 text-warning" />
          <span className="min-w-0 flex-1">
            <strong className="font-medium">Can’t reach Dailyvy right now.</strong>{' '}
            <span className="text-muted-foreground">Your last loaded data is shown.</span>
          </span>
          <Button variant="outline" size="xs" onClick={retry}>
            <RefreshCw />
            Try again
          </Button>
        </>
      )}
    </div>
  )
}
