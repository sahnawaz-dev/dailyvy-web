/**
 * Base HTTP client used by every module's `services/*.api.ts`.
 *
 *   const tabs = await api.get<Tab[]>('/tabs')
 *
 * - Unwraps the `{ success, data, error }` envelope and returns `data`.
 * - Throws `AppError` on failure (see apiError.ts).
 * - Attaches the access token and transparently refreshes it once on 401.
 *
 * `shared/` never imports a feature module, so the auth module plugs itself in
 * at startup through `configureAuthBridge()` (see modules/auth/setup.ts).
 */
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '@/shared/types/api'
import { toAppError } from './apiError'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

console.log('API_BASE_URL', API_BASE_URL)

export interface AuthBridge {
  getAccessToken: () => string | null
  /** Returns a fresh access token, or null if the session is gone. */
  refreshAccessToken: () => Promise<string | null>
  /** Called when the session can't be recovered (logged out elsewhere, expired...). */
  onSessionLost: () => void
}

let authBridge: AuthBridge | null = null

export function configureAuthBridge(bridge: AuthBridge) {
  authBridge = bridge
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

httpClient.interceptors.request.use((config) => {
  const token = authBridge?.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const REFRESHABLE_CODES = new Set(['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'])

httpClient.interceptors.response.use(undefined, async (error) => {
  const appError = toAppError(error)
  const config = error.config as RetriableConfig | undefined
  const isAuthEndpoint = config?.url?.startsWith('/auth/') && !config.url.startsWith('/auth/devices')

  if (appError.status !== 401 || !config || isAuthEndpoint || !authBridge) throw appError

  if (REFRESHABLE_CODES.has(appError.code) && !config._retried) {
    config._retried = true
    const token = await authBridge.refreshAccessToken()
    if (token) return httpClient(config)
  }

  authBridge.onSessionLost()
  throw appError
})

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.request<ApiEnvelope<T>>(config)
  return response.data.data
}

export const api = {
  get: <T>(url: string, params?: object) => request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ method: 'POST', url, data, ...config }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown) => request<T>({ method: 'PATCH', url, data }),
  delete: <T>(url: string, data?: unknown) => request<T>({ method: 'DELETE', url, data }),
}
