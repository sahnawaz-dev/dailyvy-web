import { API_BASE_URL } from '@/shared/api/httpClient'

/**
 * A file from public/ (icons, the service worker…). Works when the site lives in
 * a subfolder — GitHub Pages serves it from /dailyvy-web/ (VITE_BASE).
 */
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/**
 * An uploaded file served by the API (e.g. an avatar at "/uploads/avatars/…").
 * In development the Vite proxy serves it from this site; in production it
 * comes from the API's own address.
 */
export function uploadUrl(path: string) {
  if (/^https?:\/\//.test(path) || !/^https?:\/\//.test(API_BASE_URL)) return path
  return new URL(path, API_BASE_URL).href
}
