/**
 * App-shell UI state (not tied to any feature module).
 * Remembered per browser; the sidebar starts expanded.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppUiState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppUiStore = create<AppUiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'habit-tracker:app-ui' },
  ),
)
