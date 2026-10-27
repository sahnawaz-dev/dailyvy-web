import { isAxiosError } from 'axios'
import type { ApiEnvelope } from '@/shared/types/api'

/** Normalised error thrown by every API call. */
export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error

  if (isAxiosError<ApiEnvelope<unknown>>(error)) {
    const body = error.response?.data?.error
    if (body) {
      return new AppError(error.response?.status ?? 0, body.code, body.message, body.details)
    }
    if (!error.response) {
      return new AppError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.')
    }
    return new AppError(error.response.status, 'HTTP_ERROR', error.message)
  }

  return new AppError(0, 'UNKNOWN', error instanceof Error ? error.message : 'Something went wrong')
}

/** Human-readable message for toasts / form errors. */
export function getErrorMessage(error: unknown): string {
  const appError = toAppError(error)
  if (appError.code === 'VALIDATION_ERROR' && Array.isArray(appError.details)) {
    const first = appError.details[0] as { message?: string } | undefined
    if (first?.message) return first.message
  }
  return appError.message
}
