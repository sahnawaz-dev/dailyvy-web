/** System / Light / Dark. Works together with the color theme (each has a dark version). */
import { Monitor, Moon, Sun } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { THEME_MODES, useThemeStore, type ThemeMode } from '@/shared/theme/themeStore'

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const

export function ThemeModePicker() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={mode}
      // Radix sends '' when the active item is clicked again — ignore that.
      onValueChange={(value) => value && setMode(value as ThemeMode)}
      aria-label="Theme mode"
    >
      {THEME_MODES.map(({ id, label }) => {
        const Icon = ICONS[id]
        return (
          <ToggleGroupItem key={id} value={id} className="gap-1.5 px-3 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            <Icon />
            {label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
