/**
 * React Query hooks for reminder settings (['reminders', 'settings']) and the
 * user's own reminders (['reminders', 'custom']). Changes apply instantly
 * (optimistic) and roll back if the server says no.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/apiError'
import type {
  CustomReminder,
  CustomReminderInput,
  ReminderSettings,
  ReminderSettingsChanges,
} from '../types/reminders.types'
import { remindersApi } from './reminders.api'

export const reminderKeys = {
  settings: ['reminders', 'settings'] as const,
  custom: ['reminders', 'custom'] as const,
  habitOptions: ['reminders', 'habit-options'] as const,
}

export function useReminderSettings() {
  return useQuery({ queryKey: reminderKeys.settings, queryFn: remindersApi.getSettings })
}

function applyChanges(settings: ReminderSettings, changes: ReminderSettingsChanges): ReminderSettings {
  return {
    task: { ...settings.task, ...changes.task },
    habit: { ...settings.habit, ...changes.habit },
    streak: { ...settings.streak, ...changes.streak },
    focus: { ...settings.focus, ...changes.focus },
    weekly: { ...settings.weekly, ...changes.weekly },
    challenge: { ...settings.challenge, ...changes.challenge },
    nudges: { ...settings.nudges, ...changes.nudges },
  }
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: remindersApi.updateSettings,
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.settings })
      const previous = queryClient.getQueryData<ReminderSettings>(reminderKeys.settings)
      if (previous) queryClient.setQueryData(reminderKeys.settings, applyChanges(previous, changes))
      return { previous }
    },
    onError: (err, _changes, context) => {
      if (context?.previous) queryClient.setQueryData(reminderKeys.settings, context.previous)
      toast.error(getErrorMessage(err))
    },
    onSuccess: (settings) => queryClient.setQueryData(reminderKeys.settings, settings),
  })
}

// ---- The user's own reminders --------------------------------------------------

export function useCustomReminders() {
  return useQuery({ queryKey: reminderKeys.custom, queryFn: remindersApi.listCustom })
}

/** Habits a reminder can be linked to (loaded when the reminder form opens). */
export function useHabitOptions() {
  return useQuery({ queryKey: reminderKeys.habitOptions, queryFn: remindersApi.habitOptions })
}

export function useCreateCustomReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomReminderInput) => remindersApi.createCustom(input),
    onSuccess: (reminder) => {
      toast.success(`"${reminder.title}" reminder added`)
      return queryClient.invalidateQueries({ queryKey: reminderKeys.custom })
    },
  })
}

/** Edit any fields; the list updates right away (e.g. the on / off switch). */
export function useUpdateCustomReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<CustomReminderInput> }) =>
      remindersApi.updateCustom(id, changes),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.custom })
      const previous = queryClient.getQueryData<CustomReminder[]>(reminderKeys.custom)
      queryClient.setQueryData<CustomReminder[]>(reminderKeys.custom, (list) =>
        list?.map((r) => (r.id === id ? { ...r, ...changes } : r)),
      )
      return { previous }
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(reminderKeys.custom, context?.previous)
      toast.error(getErrorMessage(err))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reminderKeys.custom }),
  })
}

export function useDeleteCustomReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => remindersApi.deleteCustom(id),
    onSuccess: () => {
      toast.success('Reminder removed')
      return queryClient.invalidateQueries({ queryKey: reminderKeys.custom })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
