export interface AuthUser {
  id: string
  email: string
  name: string
  bio: string
  avatarUrl: string | null
  emailVerified: boolean
  timezone: string
  registeredAt: string
}

/** A logged-in device (session). */
export interface Device {
  id: string
  deviceName: string
  ip: string
  createdAt: string
  lastActiveAt: string
  isCurrent: boolean
}

export interface SessionResponse {
  accessToken: string
  user: AuthUser
  sessionId: string
}

export interface LoginPayload {
  email: string
  password: string
  /** Device to log out when the 2-device limit was hit (409 DEVICE_LIMIT). */
  revokeSessionId?: string
}

/** "Request access" (sign-up is closed: Dailyvy is invite-only). */
export interface AccessRequestPayload {
  name: string
  email: string
  /** How they know about Dailyvy. */
  source: string
}

/** `error.details` of a 409 DEVICE_LIMIT response. */
export interface DeviceLimitDetails {
  maxDevices: number
  devices: Device[]
}

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'
