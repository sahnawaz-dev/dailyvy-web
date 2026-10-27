/**
 * UI-only state for the focus module (server data lives in React Query).
 *  - last chosen duration, sound on/off, History section open/closed and the
 *    history chart's Week / Month range (remembered)
 *  - the break after a session, and the "session complete" offer
 *  - goal-reached celebration
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BREAK_MINUTES, type FocusDuration } from '../constants'

interface FocusUiState {
  duration: FocusDuration
  setDuration: (duration: FocusDuration) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  historyOpen: boolean
  setHistoryOpen: (open: boolean) => void
  chartRange: 'week' | 'month'
  setChartRange: (range: 'week' | 'month') => void

  /** Minutes earned by the session that just completed (shows the break offer). */
  justCompleted: { sessionId: string; minutes: number } | null
  setJustCompleted: (value: FocusUiState['justCompleted']) => void

  /** When the current break ends (epoch ms), or null. Survives a refresh. */
  breakEndsAt: number | null
  startBreak: () => void
  endBreak: () => void

  celebrationVisible: boolean
  showCelebration: () => void
  hideCelebration: () => void
}

export const useFocusUiStore = create<FocusUiState>()(
  persist(
    (set) => ({
      duration: 30,
      setDuration: (duration) => set({ duration }),
      soundEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      historyOpen: false,
      setHistoryOpen: (historyOpen) => set({ historyOpen }),
      chartRange: 'week',
      setChartRange: (chartRange) => set({ chartRange }),

      justCompleted: null,
      setJustCompleted: (justCompleted) => set({ justCompleted }),

      breakEndsAt: null,
      startBreak: () => set({ breakEndsAt: Date.now() + BREAK_MINUTES * 60_000, justCompleted: null }),
      endBreak: () => set({ breakEndsAt: null }),

      celebrationVisible: false,
      showCelebration: () => set({ celebrationVisible: true }),
      hideCelebration: () => set({ celebrationVisible: false }),
    }),
    {
      name: 'habit-tracker:focus-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ duration, soundEnabled, historyOpen, chartRange, breakEndsAt }) => ({
        duration,
        soundEnabled,
        historyOpen,
        chartRange,
        breakEndsAt,
      }),
    },
  ),
)
