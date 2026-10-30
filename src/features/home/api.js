import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

export async function getFeed() {
  const response = await apiClient.get('/feed')
  return response.data
}

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })
}