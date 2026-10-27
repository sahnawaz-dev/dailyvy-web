/**
 * Browser notifications via Web Push: the server sends reminders to this
 * browser even when no tab is open (public/sw.js shows them).
 *
 *   await enablePush()   // asks permission, subscribes, tells the server
 *   await disablePush()  // unsubscribes this browser (also done on logout)
 *
 * Lives in shared/ so the auth module can turn it off on logout.
 */
import { API_BASE_URL, api } from '@/shared/api/httpClient'

export type PushState =
  /** This browser can't do Web Push (or the page isn't https / localhost). */
  | 'unsupported'
  /** The server has no push keys configured. */
  | 'unavailable'
  /** The user blocked notifications for this site (only browser settings can undo it). */
  | 'blocked'
  | 'off'
  | 'on'

const SW_URL = '/sw.js'

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * (Re-)registers the service worker, telling it where the API is — the
 * notification buttons ("Done" / "Snooze") call it directly.
 */
async function registration() {
  const api = new URL(API_BASE_URL, window.location.origin).href
  return navigator.serviceWorker.register(`${SW_URL}?api=${encodeURIComponent(api)}`)
}

/**
 * Called once on app start: registers (or updates) the service worker — it makes
 * Dailyvy installable, shows the offline page and handles notifications.
 * Never throws.
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !window.isSecureContext || !('serviceWorker' in navigator)) return
  try {
    await registration()
  } catch {
    // not critical — the app works without it (no install / offline page)
  }
}

/** The VAPID public key (base64url) → the bytes PushManager expects. */
function keyBytes(base64url: string) {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

async function publicKey() {
  return (await api.get<{ publicKey: string | null }>('/reminders/push/public-key')).publicKey
}

export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  const existing = await (await navigator.serviceWorker.getRegistration(SW_URL))?.pushManager.getSubscription()
  return existing && Notification.permission === 'granted' ? 'on' : 'off'
}

/** Turns notifications on for this browser. Returns the resulting state. */
export async function enablePush(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported'
  const permission = await Notification.requestPermission()
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'off'

  const key = await publicKey()
  if (!key) return 'unavailable'

  const reg = await registration()
  await navigator.serviceWorker.ready
  let subscription = await reg.pushManager.getSubscription()
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes(key),
    })
  }
  const { endpoint, keys } = subscription.toJSON()
  await api.post('/reminders/push/subscriptions', { endpoint, keys })
  return 'on'
}

/** Turns notifications off for this browser (server + browser). Never throws. */
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return
  try {
    const subscription = await (await navigator.serviceWorker.getRegistration(SW_URL))?.pushManager.getSubscription()
    if (!subscription) return
    await api.delete('/reminders/push/subscriptions', { endpoint: subscription.endpoint }).catch(() => {})
    await subscription.unsubscribe()
  } catch {
    // best effort — the server also drops subscriptions of logged-out sessions
  }
}

/** Asks the server to send a test notification to this user's browsers. */
export async function sendTestPush() {
  return api.post<{ sent: number }>('/reminders/push/test')
}
