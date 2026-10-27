/**
 * Focus settings: daily goal (hours + minutes), focus weekdays, and the
 * end-of-session sound. Goal changes apply from today — past days keep the
 * goal they had, so old progress and streaks never change.
 */
import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { WeekdaySelector } from '@/shared/components'
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/shared/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { GOAL_MAX_MINUTES, GOAL_MIN_MINUTES } from '../constants'
import { useUpdateFocusSettings } from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'
import type { FocusSettings } from '../types/focus.types'
import { formatMinutes } from '../utils/time'

const HOURS = Array.from({ length: GOAL_MAX_MINUTES / 60 + 1 }, (_, h) => h)
const MINUTES = [0, 15, 30, 45]

interface FocusSettingsDialogProps {
  settings: FocusSettings
  onClose: () => void
}

export function FocusSettingsDialog({ settings, onClose }: FocusSettingsDialogProps) {
  const [hours, setHours] = useState(Math.floor(settings.dailyGoalMinutes / 60))
  const [minutes, setMinutes] = useState(settings.dailyGoalMinutes % 60)
  const [focusDays, setFocusDays] = useState(settings.focusDays)
  const soundEnabled = useFocusUiStore((state) => state.soundEnabled)
  const setSoundEnabled = useFocusUiStore((state) => state.setSoundEnabled)
  const update = useUpdateFocusSettings()

  const goal = hours * 60 + minutes
  const goalError =
    goal < GOAL_MIN_MINUTES
      ? `The goal must be at least ${GOAL_MIN_MINUTES} minutes`
      : goal > GOAL_MAX_MINUTES
        ? `The goal can be at most ${formatMinutes(GOAL_MAX_MINUTES)}`
        : undefined
  const daysError = focusDays.some(Boolean) ? undefined : 'Pick at least one focus day'
  const changed =
    goal !== settings.dailyGoalMinutes || focusDays.some((day, i) => day !== settings.focusDays[i])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (goalError || daysError) return
    if (!changed) return onClose()
    update.mutate({ dailyGoalMinutes: goal, focusDays }, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Focus settings</DialogTitle>
            <DialogDescription>Set how much you want to focus, and on which days.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {update.isError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{getErrorMessage(update.error)}</AlertDescription>
              </Alert>
            )}

            <FieldSet data-invalid={Boolean(goalError)}>
              <FieldLegend variant="label">Daily focus goal</FieldLegend>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="goal-hours" className="text-xs text-muted-foreground">
                    Hours
                  </FieldLabel>
                  <Select value={String(hours)} onValueChange={(value) => setHours(Number(value))}>
                    <SelectTrigger id="goal-hours" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h} h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="goal-minutes" className="text-xs text-muted-foreground">
                    Minutes
                  </FieldLabel>
                  <Select value={String(minutes)} onValueChange={(value) => setMinutes(Number(value))}>
                    <SelectTrigger id="goal-minutes" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {goalError ? (
                <FieldError>{goalError}</FieldError>
              ) : (
                <FieldDescription>Changes apply from today — past days keep their goal.</FieldDescription>
              )}
            </FieldSet>

            <WeekdaySelector
              legend="Focus days"
              value={focusDays}
              onChange={setFocusDays}
              error={daysError}
              description="Your goal and streak count only these days. Other days are rest days."
            />

            <Field orientation="horizontal">
              <Checkbox
                id="focus-sound"
                checked={soundEnabled}
                onCheckedChange={(checked) => setSoundEnabled(checked === true)}
              />
              <FieldLabel htmlFor="focus-sound" className="font-normal">
                Play a sound when a session or break ends
              </FieldLabel>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={Boolean(goalError || daysError) || update.isPending}>
              {update.isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
