import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/shared/components/ui/sonner'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { restoreSession, useAuthStore } from '@/modules/auth'
import { queryClient } from './queryClient'
import { router } from './router'

export function App() {
  // Recover the session from the refresh cookie once on load.
  useEffect(() => {
    void restoreSession()
  }, [])

  // Never show one user's cached data to another: wipe the cache when the user changes.
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (state.user?.id !== previous.user?.id) queryClient.clear()
      }),
    [],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
