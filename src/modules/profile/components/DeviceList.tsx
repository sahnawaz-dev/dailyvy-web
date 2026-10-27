import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { ConfirmDialog, ListSkeleton } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { ItemGroup } from '@/shared/components/ui/item'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { authApi, logout, useAuthStore, type Device } from '@/modules/auth'
import { useDevices, useRevokeDevice, useRevokeOtherDevices } from '../services/profile.queries'
import { DeviceListItem } from './DeviceListItem'

export function DeviceList() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clear)
  const devices = useDevices()
  const revoke = useRevokeDevice()
  const revokeOthers = useRevokeOtherDevices()
  const [confirmAll, setConfirmAll] = useState(false)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  const handleLogout = async (device: Device) => {
    if (device.isCurrent) {
      await logout()
      navigate('/login', { replace: true })
      return
    }
    revoke.mutate(device.id)
  }

  const handleLogoutAll = async () => {
    setLoggingOutAll(true)
    try {
      await authApi.logoutAll()
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
      setLoggingOutAll(false)
    }
  }

  if (devices.isPending) return <ListSkeleton rows={2} tall />
  if (devices.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{getErrorMessage(devices.error)}</AlertDescription>
      </Alert>
    )
  }

  const hasOthers = devices.data.some((d) => !d.isCurrent)

  return (
    <div className="flex flex-col gap-4">
      <ItemGroup className="gap-2">
        {devices.data.map((device) => (
          <DeviceListItem
            key={device.id}
            device={device}
            onLogout={handleLogout}
            loggingOut={revoke.isPending && revoke.variables === device.id}
          />
        ))}
      </ItemGroup>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          disabled={!hasOthers || revokeOthers.isPending}
          onClick={() => revokeOthers.mutate()}
        >
          {revokeOthers.isPending && <Spinner />}
          Log out other devices
        </Button>
        <Button variant="destructive" onClick={() => setConfirmAll(true)}>
          Log out of all devices
        </Button>
      </div>

      <ConfirmDialog
        open={confirmAll}
        title="Log out on every device?"
        message="Handy if you've lost a device or used a shared computer. You'll need to log in again everywhere, including here. Your habits and progress stay safe."
        cancelLabel="Not now"
        confirmLabel="Log out everywhere"
        destructive
        loading={loggingOutAll}
        onConfirm={handleLogoutAll}
        onCancel={() => setConfirmAll(false)}
      />
    </div>
  )
}
