/**
 * "Install Dailyvy" — the browser's install offer for the installable app (PWA).
 *
 * Chrome / Edge fire `beforeinstallprompt` when the app can be installed; we keep
 * that event and show our own "Install app" button, which opens the browser's
 * install dialog. Hidden once installed, or when already running as the app.
 * (Safari has no install event: there it's Share → "Add to Home Screen" / Dock.)
 */
import { create } from 'zustand'

/** The non-standard event Chrome / Edge send (not in the DOM typings yet). */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PwaInstallState {
  /** Set while the browser allows installing (and we're not installed). */
  promptEvent: InstallPromptEvent | null
}

export const usePwaInstallStore = create<PwaInstallState>(() => ({ promptEvent: null }))

const runningAsApp = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Called once on app start. */
export function listenForInstallPrompt() {
  if (typeof window === 'undefined' || runningAsApp()) return
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault() // we show our own button instead of the mini-infobar
    usePwaInstallStore.setState({ promptEvent: event as InstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => usePwaInstallStore.setState({ promptEvent: null }))
}

/** Opens the browser's install dialog. Returns true if the user installed it. */
export async function promptInstall() {
  const event = usePwaInstallStore.getState().promptEvent
  if (!event) return false
  await event.prompt()
  const { outcome } = await event.userChoice
  usePwaInstallStore.setState({ promptEvent: null }) // a prompt can only be used once
  return outcome === 'accepted'
}
