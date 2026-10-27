/**
 * Take a challenge: what you'll do every day, for how long (21 / 45 / 90 or a
 * custom number of days), then read the rules and accept them.
 */
import { useState, type FormEvent } from 'react'
import { AlertCircle, Flame } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { getErrorMessage } from '@/shared/api/apiError'
import { cn } from '@/shared/lib/utils'
import { useStartChallenge } from '../services/challenges.queries'
import { CHALLENGE_IDEAS, CHALLENGE_RULES, MAX_DAYS, MIN_DAYS, PRESET_LENGTHS } from '../constants'

const PICKED = 'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'

export function StartChallengeDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('')
  const [length, setLength] = useState<string>('21')
  const [customDays, setCustomDays] = useState('30')
  const [accepted, setAccepted] = useState(false)
  const start = useStartChallenge()

  const lengthDays = length === 'custom' ? Number(customDays) : Number(length)
  const lengthValid = Number.isInteger(lengthDays) && lengthDays >= MIN_DAYS && lengthDays <= MAX_DAYS
  const canStart = title.trim().length > 0 && lengthValid && accepted && !start.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canStart) return
    start.mutate({ title: title.trim(), icon: icon.trim() || null, lengthDays }, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="size-5 text-warning" />
              Take a challenge
            </DialogTitle>
            <DialogDescription>One promise to yourself, kept every single day. You can do this.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {start.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(start.error)}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="challenge-title">Every day I will…</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="challenge-title"
                  placeholder="e.g. Work out for 30 minutes"
                  value={title}
                  maxLength={80}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  aria-label="Icon (optional)"
                  placeholder="💪"
                  value={icon}
                  maxLength={4}
                  className="w-16 text-center"
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CHALLENGE_IDEAS.map((idea) => (
                  <Button
                    key={idea.title}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setTitle(idea.title)
                      setIcon(idea.icon)
                    }}
                  >
                    <span aria-hidden="true">{idea.icon}</span>
                    {idea.title}
                  </Button>
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel>For how long</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={length}
                onValueChange={(value) => value && setLength(value)}
                className="w-full"
                aria-label="Challenge length"
              >
                {PRESET_LENGTHS.map((days) => (
                  <ToggleGroupItem key={days} value={String(days)} className={cn('flex-1', PICKED)}>
                    {days} days
                  </ToggleGroupItem>
                ))}
                <ToggleGroupItem value="custom" className={cn('flex-1', PICKED)}>
                  Custom
                </ToggleGroupItem>
              </ToggleGroup>
              {length === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={MIN_DAYS}
                    max={MAX_DAYS}
                    aria-label="Number of days"
                    aria-invalid={!lengthValid}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    days ({MIN_DAYS}–{MAX_DAYS})
                  </span>
                </div>
              )}
            </Field>

            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
              <p className="mb-2 text-sm font-semibold">The rules of the game</p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                {CHALLENGE_RULES(lengthValid ? lengthDays : null).map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <Field orientation="horizontal">
              <Checkbox
                id="challenge-accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <FieldLabel htmlFor="challenge-accept" className="font-normal">
                I'm committed. If I miss a day, I start again from Day 1.
              </FieldLabel>
            </Field>
            {!accepted && <FieldDescription className="-mt-4">Commit to the rules to begin.</FieldDescription>}
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canStart}>
              {start.isPending ? <Spinner /> : <Flame />}
              I'm in — start today
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
