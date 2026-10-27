export interface UpdateProfilePayload {
  name?: string
  bio?: string
  timezone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
