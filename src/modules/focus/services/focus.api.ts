/** Raw calls to /api/v1/focus */
import { api } from '@/shared/api/httpClient'
import type { DateString } from '@/shared/types/api'
import type {
  DaySessions,
  FocusDays,
  FocusSession,
  FocusSettings,
  FocusSummary,
  StartFocusInput,
} from '../types/focus.types'

export const focusApi = {
  getSettings: () => api.get<FocusSettings>('/focus/settings'),
  updateSettings: (changes: Partial<FocusSettings>) => api.put<FocusSettings>('/focus/settings', changes),

  getActive: () => api.get<{ session: FocusSession | null }>('/focus/sessions/active'),
  listSessions: (date: DateString) => api.get<DaySessions>('/focus/sessions', { date }),
  start: (input: StartFocusInput) => api.post<FocusSession>('/focus/sessions', input),
  pause: (sessionId: string) => api.post<FocusSession>(`/focus/sessions/${sessionId}/pause`),
  resume: (sessionId: string) => api.post<FocusSession>(`/focus/sessions/${sessionId}/resume`),
  end: (sessionId: string) => api.post<FocusSession>(`/focus/sessions/${sessionId}/end`),

  summary: () => api.get<FocusSummary>('/focus/summary'),
  days: (from: DateString, to: DateString) => api.get<FocusDays>('/focus/days', { from, to }),
}
