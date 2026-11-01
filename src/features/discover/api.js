import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

// ---- Requests ----
export async function searchStudents(search) {
  const response = await apiClient.get('/users', { params: { search } })
  return response.data
}

export async function sendFriendRequest(userId) {
  const response = await apiClient.post('/friends/requests', { userId })
  return response.data
}

// ---- Hooks ----
export function useStudents(search, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['students', search],
    queryFn: () => searchStudents(search),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendFriendRequest,
    // Mark this student as "Requested" in every cached search result
    onSuccess: (_data, userId) => {
      queryClient.setQueriesData({ queryKey: ['students'] }, (old) =>
        Array.isArray(old)
          ? old.map((student) =>
              student.id === userId ? { ...student, friendStatus: 'REQUESTED' } : student
            )
          : old
      )
    },
  })
}