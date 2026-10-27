/**
 * React Query hooks for the profile module.
 * The current user lives in the auth store; profile mutations keep it in sync.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/apiError'
import { toast } from 'sonner'
import { authApi, useAuthStore, type AuthUser } from '@/modules/auth'
import { profileApi } from './profile.api'

export const profileKeys = {
  devices: ['devices'] as const,
}

function useSyncUser() {
  const setUser = useAuthStore((state) => state.setUser)
  return (user: AuthUser) => setUser(user)
}

export function useUpdateProfile() {
  const syncUser = useSyncUser()
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (user) => {
      syncUser(user)
      toast.success('Profile saved')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useUploadAvatar() {
  const syncUser = useSyncUser()
  return useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (user) => {
      syncUser(user)
      toast.success('Avatar updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed. Other devices were logged out.')
      queryClient.invalidateQueries({ queryKey: profileKeys.devices })
    },
  })
}

// ---- Devices -------------------------------------------------------------------

export function useDevices() {
  return useQuery({ queryKey: profileKeys.devices, queryFn: authApi.listDevices })
}

export function useRevokeDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.revokeDevice,
    onSuccess: () => {
      toast.success('Device logged out')
      queryClient.invalidateQueries({ queryKey: profileKeys.devices })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useRevokeOtherDevices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.revokeOtherDevices,
    onSuccess: (result) => {
      toast.success(result.message)
      queryClient.invalidateQueries({ queryKey: profileKeys.devices })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
