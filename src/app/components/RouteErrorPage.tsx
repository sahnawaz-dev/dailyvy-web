/**
 * Shown instead of a blank screen when a page crashes (React Router's
 * errorElement). Offers Reload and Go to Today; the technical details are
 * folded away for bug reports.
 */
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Home, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function RouteErrorPage() {
  const error = useRouteError()
  const details = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error)

  return (
    <main className="grid min-h-svh place-items-center bg-background p-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <img src="/icons/icon-192.png" alt="" width={64} height={64} className="size-16" />
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            This page hit an unexpected error. Your habits and tasks are safe — reloading usually fixes it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw />
            Reload
          </Button>
          <Button variant="outline" onClick={() => window.location.assign('/today')}>
            <Home />
            Go to Today
          </Button>
        </div>
        <details className="w-full text-left text-xs text-muted-foreground">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 whitespace-pre-wrap">{details}</pre>
        </details>
      </div>
    </main>
  )
}
