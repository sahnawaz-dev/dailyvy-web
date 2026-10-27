/** Raw calls to /api/v1/auth/* */
import { api } from '@/shared/api/httpClient'
import type { MessageResponse } from '@/shared/types/api'
import type { AccessRequestPayload, Device, LoginPayload, SessionResponse } from '../types/auth.types'

export const authApi = {
  /** Asks the admin for an account (sign-up is closed). */
  requestAccess: (payload: AccessRequestPayload) => api.post<MessageResponse>('/access-requests', payload),

  /** Right code: logged in — or `{ verified: true }` if the account is already on its maximum devices. */
  verifyEmail: (payload: { email: string; code: string }) =>
    api.post<SessionResponse | { verified: true; message: string }>('/auth/verify-email', payload),

  resendVerification: (email: string) =>
    api.post<MessageResponse>('/auth/resend-verification', { email }),

  login: (payload: LoginPayload) => api.post<SessionResponse>('/auth/login', payload),

  refresh: () => api.post<SessionResponse>('/auth/refresh'),

  logout: () => api.post<MessageResponse>('/auth/logout'),

  logoutAll: () => api.post<MessageResponse>('/auth/logout-all'),

  forgotPassword: (email: string) => api.post<MessageResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<MessageResponse>('/auth/reset-password', { token, password }),

  // Devices (sessions)
  listDevices: () => api.get<Device[]>('/auth/devices'),
  revokeDevice: (sessionId: string) => api.delete<MessageResponse>(`/auth/devices/${sessionId}`),
  revokeOtherDevices: () => api.delete<MessageResponse & { count: number }>('/auth/devices'),
}
