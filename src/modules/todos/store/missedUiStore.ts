/** Open/close state of the "Missed items" dialog (opened by the bell or automatically on load). */
import { create } from 'zustand'

interface MissedUiState {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useMissedUiStore = create<MissedUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
