import { Link } from 'react-router'
import { SearchX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'

export function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center p-4">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>The page you're looking for doesn't exist.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/today">Go to today</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
