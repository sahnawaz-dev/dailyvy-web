/**
 * Color theme picker. Each option renders a tiny app preview with
 * `data-color-theme` set to that theme, so it shows the theme's real colors
 * straight from global.css.
 */
import { Check } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { COLOR_THEMES, useThemeStore, type ColorTheme } from '@/shared/theme/themeStore'

export function ColorThemePicker() {
  const colorTheme = useThemeStore((state) => state.colorTheme)
  const setColorTheme = useThemeStore((state) => state.setColorTheme)

  return (
    <ToggleGroup
      type="single"
      value={colorTheme}
      // Radix sends '' when the active item is clicked again — ignore that.
      onValueChange={(value) => value && setColorTheme(value as ColorTheme)}
      aria-label="Color theme"
      className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {COLOR_THEMES.map((theme) => {
        const selected = theme.id === colorTheme
        return (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            aria-label={theme.label}
            className="h-auto flex-col items-stretch gap-2 rounded-lg border p-2 data-[state=on]:border-primary data-[state=on]:bg-transparent data-[state=on]:ring-2 data-[state=on]:ring-primary/30"
          >
            {/* Mini preview rendered in this theme */}
            <div
              data-color-theme={theme.id}
              aria-hidden="true"
              className="flex gap-1.5 rounded-md border bg-background p-1.5"
            >
              <div className="flex w-5 flex-col gap-1 rounded-sm bg-sidebar p-1">
                <span className="size-3 rounded-sm bg-primary" />
                <span className="h-1 rounded-full bg-accent" />
                <span className="h-1 rounded-full bg-muted" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="h-1.5 w-3/4 rounded-full bg-foreground/70" />
                <span className="h-1.5 w-1/2 rounded-full bg-muted-foreground/40" />
                <div className="mt-auto flex gap-1">
                  <span className="h-3 flex-1 rounded-sm bg-primary" />
                  <span className="h-3 w-4 rounded-sm bg-accent" />
                </div>
              </div>
            </div>
            <span className="flex items-center justify-between px-0.5 text-sm font-medium">
              {theme.label}
              {selected && <Check className="size-4 text-primary" />}
            </span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
