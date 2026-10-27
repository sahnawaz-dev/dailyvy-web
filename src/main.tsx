import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupAuth } from '@/modules/auth'
import { registerServiceWorker } from '@/shared/lib/webPush'
import { listenForInstallPrompt } from '@/shared/lib/pwaInstall'
import { initTheme } from '@/shared/theme/themeStore'
import { App } from '@/app/App'
import '@/app/styles/global.css'

// Connect the auth module to the shared HTTP client before anything renders.
setupAuth()
// Keep <html data-color-theme> in sync with the user's color theme.
initTheme()
// Installable app (PWA): offline page + notifications, and the browser's install offer.
registerServiceWorker()
listenForInstallPrompt()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
