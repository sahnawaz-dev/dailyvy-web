/**
 * Shown when logging in on a 3rd device: the user picks which device to log out.
 */
import { Monitor } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/components/ui/item'
import { Spinner } from '@/shared/components/ui/spinner'
import { formatRelativeTime } from '@/shared/utils/date'
import type { DeviceLimitDetails } from '../types/auth.types'

interface DeviceLimitDialogProps {
  details: DeviceLimitDetails | null
  pendingSessionId: string | null
  onChoose: (sessionId: string) => void
  onCancel: () => void
}

export function DeviceLimitDialog({ details, pendingSessionId, onChoose, onCancel }: DeviceLimitDialogProps) {
  return (
    <Dialog open={details !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Too many devices</DialogTitle>
          <DialogDescription>
            You're already logged in on {details?.maxDevices ?? 2} devices. Log out of one to continue on this
            device.
          </DialogDescription>
        </DialogHeader>
        <ItemGroup>
          {details?.devices.map((device) => (
            <Item key={device.id} variant="outline" size="sm">
              <ItemMedia variant="icon">
                <Monitor />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{device.deviceName}</ItemTitle>
                <ItemDescription>Last active {formatRelativeTime(device.lastActiveAt)}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingSessionId !== null}
                  onClick={() => onChoose(device.id)}
                >
                  {pendingSessionId === device.id && <Spinner />}
                  Log out
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </DialogContent>
    </Dialog>
  )
}
