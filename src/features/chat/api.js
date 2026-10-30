import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'
import { useAuthStore } from '../auth/authStore'

// ---- Requests ----
export async function getConversations() {
  const response = await apiClient.get('/conversations')
  return response.data
}

export async function getMessages(conversationId) {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`)
  return response.data
}

export async function sendMessageRequest(conversationId, content) {
  const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
    content,
  })
  return response.data
}

export async function markConversationReadRequest(conversationId) {
  await apiClient.post(`/conversations/${conversationId}/read`)
}

// ---- Hooks ----
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  })
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
  })
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const messagesKey = ['messages', conversationId]

  return useMutation({
    mutationFn: (content) => sendMessageRequest(conversationId, content),

    // 1. Before the request: show the message straight away
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: messagesKey })
      const previous = queryClient.getQueryData(messagesKey)

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        sender: { id: user.id, name: `${user.firstName} ${user.lastName}` },
        isMine: true,
        status: 'sending',
      }

      queryClient.setQueryData(messagesKey, (old) =>
        old ? { ...old, messages: [...old.messages, tempMessage] } : old
      )

      return { previous }
    },

    // 2. If it fails: put the chat back the way it was
    onError: (_error, _content, context) => {
      queryClient.setQueryData(messagesKey, context.previous)
    },

    // 3. Either way: reload the real data from the server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markConversationReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}