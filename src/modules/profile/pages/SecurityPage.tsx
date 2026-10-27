import { PageHeader } from '@/shared/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { AccountDataCard } from '../components/AccountDataCard'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { DeviceList } from '../components/DeviceList'
import { ProfileNav } from '../components/ProfileNav'

export function SecurityPage() {
  useDocumentTitle('Security')

  return (
    <>
      <PageHeader title="Account" subtitle="Manage your profile and security." />
      <ProfileNav />
      {/* Desktop: Change password on the left, Logged-in devices on the right */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Other devices will be logged out.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Logged-in devices</CardTitle>
            <CardDescription>You can be logged in on up to 3 devices at a time.</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceList />
          </CardContent>
        </Card>
        {/* Export my data / delete account — full width below */}
        <div className="lg:col-span-2">
          <AccountDataCard />
        </div>
      </div>
    </>
  )
}
