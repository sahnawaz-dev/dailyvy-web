/**
 * UI-only state for the habits module (server data lives in React Query).
 *  - celebration overlay visibility
 *  - last opened tab + view mode (remembered across visits)
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ViewMode } from '../types/habits.types'

interface HabitsUiState {
  celebrationVisible: boolean
  showCelebration: () => void
  hideCelebration: () => void

  lastTabId: string | null
  lastViewMode: ViewMode
  rememberLocation: (tabId: string, viewMode: ViewMode) => void
}

export const useHabitsUiStore = create<HabitsUiState>()(
  persist(
    (set) => ({
      celebrationVisible: false,
      showCelebration: () => set({ celebrationVisible: true }),
      hideCelebration: () => set({ celebrationVisible: false }),

      lastTabId: null,
      lastViewMode: 'weekly',
      rememberLocation: (lastTabId, lastViewMode) => set({ lastTabId, lastViewMode }),
    }),
    {
      name: 'habit-tracker:habits-ui',
      storage: createJSONStorage(() => localStorage),
      // Only persist navigation memory, never the transient overlay state.
      partialize: ({ lastTabId, lastViewMode }) => ({ lastTabId, lastViewMode }),
    },
  ),
)
