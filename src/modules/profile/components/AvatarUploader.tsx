import { useRef } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { useCurrentUser } from '@/modules/auth'
import { useUploadAvatar } from '../services/profile.queries'

const MAX_SIZE_MB = 2
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AvatarUploader() {
  const user = useCurrentUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar()

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return toast.error('Please choose a PNG, JPEG or WEBP image.')
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return toast.error(`Image must be under ${MAX_SIZE_MB} MB.`)
    upload.mutate(file)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
        <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-1">
        <Button variant="outline" size="sm" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
          {upload.isPending && <Spinner />}
          Change avatar
        </Button>
        <span className="text-xs text-muted-foreground">PNG, JPEG or WEBP, up to {MAX_SIZE_MB} MB.</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        aria-label="Upload avatar"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
