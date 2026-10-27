/**
 * One reminder's settings: on / off switch, what it does, and a choice of
 * times (or "minutes before" for tasks). Saved on the server — the mobile app
 * uses the same settings.
 */
import { BellRing } from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Switch } from '@/shared/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'

interface ReminderCardProps<T extends string | number> {
  title: string
  subtitle: string
  enabled: boolean
  value: T
  options: readonly T[]
  formatOption: (option: T) => string
  /** What happens with the chosen option, e.g. "At 8:00 PM, if …". */
  describe: (label: string) => string
  onEnabledChange: (enabled: boolean) => void
  onValueChange: (value: T) => void
}

export function ReminderCard<T extends string | number>({
  title,
  subtitle,
  enabled,
  value,
  options,
  formatOption,
  describe,
  onEnabledChange,
  onValueChange,
}: ReminderCardProps<T>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
        <CardAction>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={title} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <BellRing className="mt-0.5 size-4 shrink-0" />
          {enabled ? describe(formatOption(value)) : 'This reminder is off.'}
        </p>
        {enabled && (
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(value)}
            // Radix sends '' when the active item is clicked again — ignore that.
            onValueChange={(next) => {
              const option = options.find((o) => String(o) === next)
              if (option !== undefined) onValueChange(option)
            }}
            className="flex-wrap"
            aria-label={`${title} time`}
          >
            {options.map((option) => (
              <ToggleGroupItem
                key={String(option)}
                value={String(option)}
                className="px-3 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                {formatOption(option)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </CardContent>
    </Card>
  )
}
