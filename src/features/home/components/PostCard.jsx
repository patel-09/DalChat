import { Heart, MessageCircle } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { formatTimeAgo } from '../../../lib/formatTimeAgo'

function PostCard({ post }) {
  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
          {getInitials(post.author.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{post.author.name}</p>
          <p className="truncate text-xs text-gray-400">
            {post.author.program} ·{' '}
            <time dateTime={post.createdAt}>{formatTimeAgo(post.createdAt)}</time>
          </p>
        </div>
      </header>

      <p className="mt-3 whitespace-pre-line text-gray-200">{post.content}</p>

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
    </article>
  )
}

export default PostCard