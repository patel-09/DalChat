import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { formatTimeAgo } from '../../../lib/formatTimeAgo'
import { useDeletePost } from '../api'

function PostCard({ post }) {
  const deletePost = useDeletePost()

  function handleDelete() {
    if (window.confirm("Delete this post? This can't be undone.")) {
      deletePost.mutate(post.id)
    }
  }

  return (
    <article
      className={`rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition-opacity ${
        deletePost.isPending ? 'opacity-50' : ''
      }`}
    >
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
          {getInitials(post.author.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{post.author.name}</p>
          <p className="truncate text-xs text-gray-400">
            {post.author.program && `${post.author.program} · `}
            <time dateTime={post.createdAt}>{formatTimeAgo(post.createdAt)}</time>
          </p>
        </div>

        {post.isMine && (
          <button
            onClick={handleDelete}
            disabled={deletePost.isPending}
            aria-label="Delete post"
            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-800 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        )}
      </header>

      <p className="mt-3 whitespace-pre-line break-words text-gray-200">{post.content}</p>

      <footer className="mt-4 flex gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <Heart size={18} />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={18} />
          {post.commentCount}
        </span>
      </footer>

      {deletePost.isError && (
        <p className="mt-2 text-sm text-red-400">Couldn't delete this post. Please try again.</p>
      )}
    </article>
  )
}

export default PostCard