import { Monitor } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/shared/components/ui/item'
import { Spinner } from '@/shared/components/ui/spinner'
import { formatRelativeTime } from '@/shared/utils/date'
import type { Device } from '@/modules/auth'

interface DeviceListItemProps {
  device: Device
  onLogout: (device: Device) => void
  loggingOut: boolean
}

export function DeviceListItem({ device, onLogout, loggingOut }: DeviceListItemProps) {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <Monitor />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {device.deviceName}
          {device.isCurrent && <Badge variant="secondary">This device</Badge>}
        </ItemTitle>
        <ItemDescription>
          Last active {formatRelativeTime(device.lastActiveAt)}
          {device.ip && ` · ${device.ip}`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" disabled={loggingOut} onClick={() => onLogout(device)}>
          {loggingOut && <Spinner />}
          Log out
        </Button>
      </ItemActions>
    </Item>
  )
}
