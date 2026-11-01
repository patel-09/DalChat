import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

export async function searchStudents(search) {
  const response = await apiClient.get('/users', { params: { search } })
  return response.data
}

export function useStudents(search, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['students', search],
    queryFn: () => searchStudents(search),
    placeholderData: keepPreviousData,
    enabled,
  })
}