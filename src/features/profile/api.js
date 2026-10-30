import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

// ---- Requests ----
export async function getProfile() {
  const response = await apiClient.get('/profile')
  return response.data
}

export async function updateProfileRequest(details) {
  const response = await apiClient.put('/profile', details)
  return response.data
}

export async function getProfileRequests() {
  const response = await apiClient.get('/profile/requests')
  return response.data
}

export async function respondToRequest({ id, action }) {
  const response = await apiClient.post(`/profile/requests/${id}/${action}`)
  return response.data
}

// ---- Hooks ----
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfileRequest,
    // The server sends back the updated profile, so put it straight into the cache
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile)
    },
  })
}

export function useProfileRequests() {
  return useQuery({
    queryKey: ['profile-requests'],
    queryFn: getProfileRequests,
  })
}

export function useRespondToRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: respondToRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-requests'] })
    },
  })
}