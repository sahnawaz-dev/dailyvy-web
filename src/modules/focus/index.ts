/** focus module — public API. */
export { focusRoutes } from './routes'

// Mounted in the app shell: keeps a session tracked on every page (tab title,
// end-of-session alerts, goal celebration) + the live countdown in the sidebar.
export { FocusWatcher } from './components/FocusWatcher'
export { FocusNavBadge } from './components/FocusNavBadge'

// The focus card on the Today page
export { FocusTodayCard } from './components/FocusTodayCard'
