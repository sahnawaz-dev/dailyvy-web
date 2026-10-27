/**
 * App-level compositions shared by 2+ modules, built FROM shadcn/ui parts.
 *
 * UI primitives are shadcn components — import them directly from their file:
 *   import { Button } from '@/shared/components/ui/button'
 * Add new ones with:  npx shadcn@latest add <component>
 * Toasts:             import { toast } from 'sonner'
 * Icons:              import { Plus } from 'lucide-react'
 */
export { CelebrationOverlay } from './CelebrationOverlay'
export { ConfirmDialog } from './ConfirmDialog'
export { PageHeader } from './PageHeader'
export { PageLoader } from './PageLoader'
export { PasswordInput } from './PasswordInput'
export { PeriodNavigator } from './PeriodNavigator'
export { ListSkeleton, MonthSkeleton, TableSkeleton, TabsSkeleton } from './Skeletons'
export { WeekdaySelector } from './WeekdaySelector'
