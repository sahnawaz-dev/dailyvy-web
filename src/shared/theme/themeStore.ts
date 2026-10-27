/**
 * Appearance, saved per browser:
 *  - color theme → <html data-color-theme="...">
 *  - mode        → system / light / dark; dark adds <html class="dark">
 * The palettes (light + dark for every color theme) live in app/styles/global.css.
 *
 * index.html applies the saved settings before the app loads (no flash), and
 * initTheme() keeps <html> in sync with the store and with the OS setting.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Must match the [data-color-theme='...'] blocks in global.css. */
export const COLOR_THEMES = [
  { id: 'pink', label: 'Pink' },
  { id: 'green', label: 'Green' },
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' },
  { id: 'sky', label: 'Sky blue' },
  { id: 'violet', label: 'Violet' },
  { id: 'orange', label: 'Orange' },
  { id: 'mono', label: 'Mono' },
] as const

export type ColorTheme = (typeof COLOR_THEMES)[number]['id']
export const DEFAULT_COLOR_THEME: ColorTheme = 'green'

export const THEME_MODES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const

export type ThemeMode = (typeof THEME_MODES)[number]['id']

/** Also read by the inline script in index.html — keep them in sync. */
export const THEME_STORAGE_KEY = 'habit-tracker:theme'

interface ThemeState {
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorTheme: DEFAULT_COLOR_THEME,
      setColorTheme: (colorTheme) => set({ colorTheme }),
      mode: 'dark',
      setMode: (mode) => set({ mode }),
    }),
    { name: THEME_STORAGE_KEY, partialize: ({ colorTheme, mode }) => ({ colorTheme, mode }) },
  ),
)

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

/** 'light' | 'dark' after resolving "system" against the OS setting. */
export function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return darkQuery().matches ? 'dark' : 'light'
  return mode
}

function applyTheme({ colorTheme, mode }: Pick<ThemeState, 'colorTheme' | 'mode'>) {
  const root = document.documentElement
  root.dataset.colorTheme = colorTheme
  root.classList.toggle('dark', resolveMode(mode) === 'dark')
}

/** Call once at startup (main.tsx). */
export function initTheme() {
  applyTheme(useThemeStore.getState())
  useThemeStore.subscribe(applyTheme)
  // "System" follows the OS live (e.g. automatic dark mode at night).
  darkQuery().addEventListener('change', () => applyTheme(useThemeStore.getState()))
}
