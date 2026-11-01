import { useState } from 'react'
import { getInitials } from '../../../lib/getInitials'
import { useAuthStore } from '../../auth/authStore'
import { MAX_POST_LENGTH, useCreatePost } from '../api'

function CreatePost() {
  const user = useAuthStore((state) => state.user)
  const createPost = useCreatePost()
  const [content, setContent] = useState('')

  const trimmed = content.trim()
  const isTooLong = content.length > MAX_POST_LENGTH
  const canPost = trimmed.length > 0 && !isTooLong && !createPost.isPending

  function submit() {
    if (!canPost) return
    createPost.mutate(trimmed, {
      onSuccess: () => setContent(''),
    })
  }

  function handleKeyDown(event) {
    // Ctrl + Enter (Cmd + Enter on Mac) posts
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
          {getInitials(`${user.firstName} ${user.lastName}`)}
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={`What's on your mind, ${user.firstName}?`}
          aria-label="Write a post"
          className="flex-1 resize-none bg-transparent pt-2 text-gray-100 placeholder-gray-500 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-800 pt-3">
        <span className={`text-sm ${isTooLong ? 'text-red-400' : 'text-gray-500'}`}>
          {content.length}/{MAX_POST_LENGTH}
        </span>
        <button
          type="submit"
          disabled={!canPost}
          className="rounded-lg bg-yellow-400 px-5 py-1.5 font-semibold text-gray-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createPost.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>

      {createPost.isError && (
        <p className="mt-2 text-sm text-red-400">
          {createPost.error.response?.data?.message ?? "Couldn't publish your post. Please try again."}
        </p>
      )}
    </form>
  )
}

export default CreatePost