/**
 * reminders module — public API. Reminder settings are stored on the server
 * and shared with the mobile app; this browser gets them as Web Push
 * notifications once turned on (Account → Reminders).
 */
// RemindersPage is loaded lazily by the profile routes (@/modules/reminders/pages/RemindersPage),
// so it isn't exported here (that would pull it into the main bundle).
export { useReminderSettings } from './services/reminders.queries'
export type { ReminderSettings } from './types/reminders.types'
