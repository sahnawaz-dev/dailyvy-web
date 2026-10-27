/** Raw calls to /api/v1/reminders */
import { api } from '@/shared/api/httpClient'
import type {
  CustomReminder,
  CustomReminderInput,
  HabitOption,
  ReminderSettings,
  ReminderSettingsChanges,
} from '../types/reminders.types'

export const remindersApi = {
  getSettings: () => api.get<ReminderSettings>('/reminders/settings'),
  updateSettings: (changes: ReminderSettingsChanges) => api.put<ReminderSettings>('/reminders/settings', changes),

  // The user's own reminders
  listCustom: () => api.get<CustomReminder[]>('/reminders/custom'),
  createCustom: (input: CustomReminderInput) => api.post<CustomReminder>('/reminders/custom', input),
  updateCustom: (id: string, changes: Partial<CustomReminderInput>) =>
    api.patch<CustomReminder>(`/reminders/custom/${id}`, changes),
  deleteCustom: (id: string) => api.delete<{ message: string }>(`/reminders/custom/${id}`),
  habitOptions: () => api.get<HabitOption[]>('/reminders/custom/habit-options'),
}
