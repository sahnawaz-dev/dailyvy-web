/**
 * Ready-made reminders (one click fills the form; everything stays editable)
 * and the choices offered in the reminder form. Copy is short and kind — no
 * "don't forget!!!", no guilt.
 */
import type { CustomReminderInput } from './types/reminders.types'

const EVERY_DAY = Array(7).fill(true) as boolean[]
const WEEKDAYS = [true, true, true, true, true, false, false]

export const REMINDER_PRESETS: { id: string; label: string; reminder: CustomReminderInput }[] = [
  {
    id: 'water',
    label: 'Drink water',
    reminder: {
      icon: '💧',
      title: 'Time for some water',
      body: 'A glass now keeps you going.',
      schedule: { kind: 'interval', everyMinutes: 60, from: '09:00', to: '21:00' },
      days: EVERY_DAY,
      enabled: true,
      habitId: null,
    },
  },
  {
    id: 'healthy-food',
    label: 'Eat something healthy',
    reminder: {
      icon: '🥗',
      title: 'Healthy bite time',
      body: 'Something fresh will feel good.',
      schedule: { kind: 'times', times: ['08:00', '13:00', '19:00'] },
      days: EVERY_DAY,
      enabled: true,
      habitId: null,
    },
  },
  {
    id: 'stretch',
    label: 'Stretch & move',
    reminder: {
      icon: '🧘',
      title: 'Quick stretch',
      body: 'Stand up and loosen your shoulders.',
      schedule: { kind: 'interval', everyMinutes: 90, from: '10:00', to: '18:00' },
      days: WEEKDAYS,
      enabled: true,
      habitId: null,
    },
  },
  {
    id: 'eyes',
    label: 'Rest your eyes',
    reminder: {
      icon: '👀',
      title: 'Look away for a moment',
      body: '20 seconds at something far away.',
      schedule: { kind: 'interval', everyMinutes: 45, from: '10:00', to: '18:00' },
      days: WEEKDAYS,
      enabled: true,
      habitId: null,
    },
  },
]

export const BLANK_REMINDER: CustomReminderInput = {
  icon: '🔔',
  title: '',
  body: '',
  schedule: { kind: 'interval', everyMinutes: 60, from: '09:00', to: '21:00' },
  days: EVERY_DAY,
  enabled: true,
  habitId: null,
}

export const INTERVAL_OPTIONS = [30, 45, 60, 90, 120] as const

/** Named moments for "At set times". */
export const TIME_PRESETS = [
  { label: 'Morning', time: '08:00' },
  { label: 'Afternoon', time: '13:00' },
  { label: 'Evening', time: '19:00' },
  { label: 'Before bed', time: '22:00' },
] as const

export const ICON_CHOICES = ['💧', '🥗', '🧘', '👀', '💊', '🚶', '🍎', '😴', '🌿', '🔔'] as const

/** Hours offered for "active from / until" (05:00 … 23:00). */
export const ACTIVE_HOURS = Array.from({ length: 19 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`)
