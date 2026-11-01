import { Link } from 'react-router'
import { useMyPosts } from '../../home/api'
import PostCard from '../../home/components/PostCard'

function MyPosts() {
  const { data, isPending, isError, refetch } = useMyPosts()
  const posts = Array.isArray(data) ? data : []

  function renderBody() {
    if (isPending) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-400">Couldn't load your posts.</p>
          <button onClick={() => refetch()} className="mt-2 text-yellow-400 hover:underline">
            Try again
          </button>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-400">You haven't posted anything yet.</p>
          <Link to="/home" className="mt-2 inline-block text-sm text-yellow-400 hover:underline">
            Write your first post
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60">
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <h2 className="text-lg font-bold">My posts</h2>
        {posts.length > 0 && <span className="text-sm text-gray-400">{posts.length}</span>}
      </div>
      {renderBody()}
    </section>
  )
}

export default MyPosts