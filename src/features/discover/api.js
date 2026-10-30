import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

// 1. The request itself
export async function searchStudents(search) {
  const response = await apiClient.get('/users', { params: { search } })
  return response.data
}

// 2. A hook that components use to get the data
export function useStudents(search, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['students', search],
    queryFn: () => searchStudents(search),
    placeholderData: keepPreviousData,
    enabled,
  })
}