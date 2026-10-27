import { useEffect } from 'react'

const APP_NAME = 'Dailyvy'

// The tab title is "<prefix> · <page> · Dailyvy". The prefix is optional
// live status shown on every page (e.g. a running focus countdown).
let pageTitle = APP_NAME
let prefix = ''

function applyTitle() {
  document.title = prefix ? `${prefix} · ${pageTitle}` : pageTitle
}

/** Sets the browser tab title for the current page. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    pageTitle = title ? `${title} · ${APP_NAME}` : APP_NAME
    applyTitle()
  }, [title])
}

/** Shows live status in front of the page title on every page; pass null to clear it. */
export function setDocumentTitlePrefix(value: string | null) {
  prefix = value ?? ''
  applyTitle()
}
