/** Raw calls to /api/v1/profile/* */
import { api } from '@/shared/api/httpClient'
import type { MessageResponse } from '@/shared/types/api'
import type { AuthUser } from '@/modules/auth'
import type { ChangePasswordPayload, UpdateProfilePayload } from '../types/profile.types'

export const profileApi = {
  get: () => api.get<AuthUser>('/profile'),

  update: (payload: UpdateProfilePayload) => api.patch<AuthUser>('/profile', payload),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post<AuthUser>('/profile/avatar', form)
  },

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<MessageResponse>('/profile/change-password', payload),

  /** Everything stored about the user ("Export my data"). */
  exportData: () => api.get<Record<string, unknown>>('/profile/export'),
  /** Permanently deletes the account and all its data. */
  deleteAccount: (password: string) =>
    api.post<MessageResponse>('/profile/delete', { password, confirm: 'DELETE' }),
}
