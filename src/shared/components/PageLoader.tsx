import { Spinner } from '@/shared/components/ui/spinner'

/** Centered spinner for a page / section that is loading. */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-48 place-items-center text-muted-foreground">
      <Spinner className="size-6" aria-label={label} />
    </div>
  )
}
