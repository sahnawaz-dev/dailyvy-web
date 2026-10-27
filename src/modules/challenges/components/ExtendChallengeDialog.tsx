/** Extend the challenge to a longer goal (45 / 90 / custom) — progress so far is kept. */
import { useState, type FormEvent } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { cn } from '@/shared/lib/utils'
import { MAX_DAYS, PRESET_LENGTHS } from '../constants'
import { useExtendChallenge } from '../services/challenges.queries'
import type { ActiveChallenge } from '../types/challenges.types'

const PICKED = 'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'

export function ExtendChallengeDialog({ challenge, onClose }: { challenge: ActiveChallenge; onClose: () => void }) {
  const presets = PRESET_LENGTHS.filter((days) => days > challenge.lengthDays)
  const [choice, setChoice] = useState<string>(presets[0] ? String(presets[0]) : 'custom')
  const [customDays, setCustomDays] = useState(String(Math.min(MAX_DAYS, challenge.lengthDays + 30)))
  const extend = useExtendChallenge()

  const lengthDays = choice === 'custom' ? Number(customDays) : Number(choice)
  const valid = Number.isInteger(lengthDays) && lengthDays > challenge.lengthDays && lengthDays <= MAX_DAYS

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (valid) extend.mutate(lengthDays, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Extend the challenge</DialogTitle>
            <DialogDescription>
              Your {challenge.doneCount} days so far count. Same rules: every day, miss one and it starts again.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel>New goal</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={choice}
              onValueChange={(value) => value && setChoice(value)}
              className="w-full"
              aria-label="New goal"
            >
              {presets.map((days) => (
                <ToggleGroupItem key={days} value={String(days)} className={cn('flex-1', PICKED)}>
                  {days} days
                </ToggleGroupItem>
              ))}
              <ToggleGroupItem value="custom" className={cn('flex-1', PICKED)}>
                Custom
              </ToggleGroupItem>
            </ToggleGroup>
            {choice === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={challenge.lengthDays + 1}
                  max={MAX_DAYS}
                  aria-label="Number of days"
                  aria-invalid={!valid}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  days (more than {challenge.lengthDays})
                </span>
              </div>
            )}
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!valid || extend.isPending}>
              {extend.isPending ? <Spinner /> : <CalendarClock />}
              Extend to {valid ? lengthDays : '…'} days
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
