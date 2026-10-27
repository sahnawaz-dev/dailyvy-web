import { PageHeader } from '@/shared/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { ColorThemePicker } from '../components/ColorThemePicker'
import { ProfileForm } from '../components/ProfileForm'
import { ProfileNav } from '../components/ProfileNav'
import { ThemeModePicker } from '../components/ThemeModePicker'

export function ProfilePage() {
  useDocumentTitle('Profile')

  return (
    <>
      <PageHeader title="Account" subtitle="Manage your profile and security." />
      <ProfileNav />
      {/* Desktop: Details on the left, Appearance on the right */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {/* Avatar upload is hidden for now (initials are shown instead). To bring it back,
              render <AvatarUploader /> (components/AvatarUploader.tsx) in a card here. */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Pick light or dark mode and a color theme — backgrounds, buttons, accents and text follow them.
              Saved on this browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Mode</FieldLabel>
                <ThemeModePicker />
              </Field>
              <Field>
                <FieldLabel>Color theme</FieldLabel>
                <ColorThemePicker />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
