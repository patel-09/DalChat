import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'

export const MAX_POST_LENGTH = 500

// ---- Requests ----
export async function getFeed() {
  const response = await apiClient.get('/feed')
  return response.data
}

export async function getMyPosts() {
  const response = await apiClient.get('/profile/posts')
  return response.data
}

export async function createPostRequest(content) {
  const response = await apiClient.post('/posts', { content })
  return response.data
}

export async function deletePostRequest(postId) {
  await apiClient.delete(`/posts/${postId}`)
}

// ---- Cache helpers ----
function addToTop(newPost) {
  return (old) => (Array.isArray(old) ? [newPost, ...old] : old)
}

function removeById(postId) {
  return (old) => (Array.isArray(old) ? old.filter((post) => post.id !== postId) : old)
}

// ---- Hooks ----
export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })
}

export function useMyPosts() {
  return useQuery({
    queryKey: ['my-posts'],
    queryFn: getMyPosts,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPostRequest,
    // Put the new post at the top of both lists, without reloading them
    onSuccess: (newPost) => {
      queryClient.setQueryData(['feed'], addToTop(newPost))
      queryClient.setQueryData(['my-posts'], addToTop(newPost))
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePostRequest,
    // Remove the post from both lists
    onSuccess: (_data, postId) => {
      queryClient.setQueryData(['feed'], removeById(postId))
      queryClient.setQueryData(['my-posts'], removeById(postId))
    },
  })
}