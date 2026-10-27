import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select'
import { Spinner } from '@/shared/components/ui/spinner'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentUser } from '@/modules/auth'
import { useUpdateProfile } from '../services/profile.queries'

const TIMEZONES: string[] =
  typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC']

export function ProfileForm() {
  const user = useCurrentUser()
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio)
  const [timezone, setTimezone] = useState(user.timezone)
  const update = useUpdateProfile()

  const isDirty = name !== user.name || bio !== user.bio || timezone !== user.timezone

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({ name: name.trim(), bio: bio.trim(), timezone })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <Input id="profile-email" value={user.email} readOnly disabled />
          <FieldDescription>Your email can't be changed.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
          <Input id="profile-name" value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
          <Textarea id="profile-bio" value={bio} maxLength={280} onChange={(e) => setBio(e.target.value)} />
          <FieldDescription>{bio.length}/280</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-timezone">Timezone</FieldLabel>
          <NativeSelect id="profile-timezone" className="w-full" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {(TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES]).map((tz) => (
              <NativeSelectOption key={tz} value={tz}>
                {tz}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldDescription>Decides when your "today" starts and ends.</FieldDescription>
        </Field>
        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={!isDirty || !name.trim() || update.isPending}>
            {update.isPending && <Spinner />}
            Save changes
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
