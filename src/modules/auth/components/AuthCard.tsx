import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Centered card used by every auth page (login, register, reset...). */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 p-4 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-heading font-semibold">
          <img src="/icons/icon-192.png" alt="" width={36} height={36} className="size-9" />
          <span className="text-lg">Dailyvy</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
          {footer && (
            <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">{footer}</CardFooter>
          )}
        </Card>
      </div>
    </main>
  )
}
