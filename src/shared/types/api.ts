/** Every API response uses this envelope (see server/src/common/utils/response.js). */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  error: ApiErrorBody | null
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

/** A calendar day as 'YYYY-MM-DD' (always in the user's timezone). */
export type DateString = string

/** A month as 'YYYY-MM'. */
export type MonthString = string

export interface MessageResponse {
  message: string
}
