import type { ReactNode } from 'react'
import { PageHeader } from '@/shared/components'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { BrowserNotificationsCard } from '../components/BrowserNotificationsCard'
import { MyRemindersCard } from '../components/MyRemindersCard'
import { ReminderSettingsCards } from '../components/ReminderSettingsCards'

/**
 * Account → Reminders. `nav` is the Account sub-navigation (owned by the
 * profile module, passed in by its route).
 */
export function RemindersPage({ nav }: { nav: ReactNode }) {
  useDocumentTitle('Reminders')

  return (
    <>
      <PageHeader title="Account" subtitle="Manage your profile and security." />
      {nav}
      <div>
        {/* This browser on / off — a full-width banner under the tabs */}
        <BrowserNotificationsCard />
        {/* The four reminders: a 2 × 2 grid of equal-height cards */}
        <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-2">
          <ReminderSettingsCards />
        </div>
        {/* The user's own reminders (water, meals…) */}
        <MyRemindersCard />
      </div>
    </>
  )
}
