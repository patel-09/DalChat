import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

export async function getClubs({ search, category }) {
  const response = await apiClient.get('/clubs', { params: { search, category } })
  return response.data
}

export function useClubs({ search, category }) {
  return useQuery({
    queryKey: ['clubs', search, category],
    queryFn: () => getClubs({ search, category }),
    placeholderData: keepPreviousData,
  })
}

export async function createSocietyRequest(formData) {
  const response = await apiClient.post('/clubs/applications', formData)
  return response.data
}

export async function getMemberSuggestions({ search, topic }) {
  const response = await apiClient.get('/clubs/member-suggestions', {
    params: { search, topic },
  })
  return response.data
}

export function useMemberSuggestions({ search, topic, enabled }) {
  return useQuery({
    queryKey: ['member-suggestions', search, topic],
    queryFn: () => getMemberSuggestions({ search, topic }),
    enabled,
    placeholderData: keepPreviousData,
  })
}