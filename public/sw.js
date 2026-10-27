/**
 * Service worker (registered on every visit by src/shared/lib/webPush.ts):
 *  - makes Dailyvy installable and shows /offline.html when it's opened with no
 *    connection (pages always come from the network first — never stale)
 *  - shows reminder notifications sent by the server (Web Push) and opens the
 *    right page when one is clicked.
 * Payload: { title, body, url, tag, silent?, actionToken? }
 *  - silent: no sound / vibration (the user's own gentle reminders)
 *  - actionToken: shows "Done" / "Snooze 15 min" buttons; a click sends the
 *    token to the API (which this worker learns from its ?api= URL)
 */
const API = new URL(self.location.href).searchParams.get('api')

const CACHE = 'dailyvy-shell-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png', '/favicon.ico']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older versions of this worker
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
      await self.clients.claim()
    })(),
  )
})

// Page loads: network first; offline → the friendly offline page. Nothing else is
// intercepted (API calls, scripts and styles go straight to the network).
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
  )
})

self.addEventListener('push', (event) => {
  let message = {}
  try {
    message = event.data ? event.data.json() : {}
  } catch {
    message = { body: event.data ? event.data.text() : '' }
  }
  const { title = 'Dailyvy', body = '', url = '/today', tag, silent = false, actionToken } = message
  const withActions = Boolean(actionToken && API)

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag, // same tag replaces an older notification instead of stacking
      silent,
      icon: '/icons/icon-192.png',
      badge: '/icons/favicon-32.png',
      data: { url, actionToken },
      actions: withActions
        ? [
            { action: 'done', title: '✓ Done' },
            { action: 'snooze', title: 'Snooze 15 min' },
          ]
        : [],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // A button: tell the API, no window needed
  if (event.action === 'done' || event.action === 'snooze') {
    const token = event.notification.data?.actionToken
    if (token && API) {
      event.waitUntil(
        fetch(`${API}/reminders/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: event.action }),
        }).catch(() => {}),
      )
    }
    return
  }

  const url = new URL(event.notification.data?.url ?? '/today', self.location.origin).href

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      // Reuse an open tab of the app if there is one
      const tab = windows.find((client) => new URL(client.url).origin === self.location.origin)
      if (tab) {
        await tab.focus()
        if ('navigate' in tab) await tab.navigate(url)
        return
      }
      await self.clients.openWindow(url)
    })(),
  )
})
