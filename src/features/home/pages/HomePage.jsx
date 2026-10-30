import { Link } from 'react-router'
import { useFeed } from '../api'
import PostCard from '../components/PostCard'

function HomePage() {
  const { data: posts = [], isPending, isError, refetch } = useFeed()

  function renderFeed() {
    if (isPending) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="text-center">
          <p className="text-red-400">Couldn't load your feed.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-yellow-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
          <p className="font-semibold">No posts yet</p>
          <p className="mt-1 text-gray-400">
            When your friends post something, it will show up here.
          </p>
          <Link to="/discover" className="mt-4 inline-block text-yellow-400 hover:underline">
            Find friends on Discover
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  }

  return (
  <div className="mx-auto max-w-4xl">{renderFeed()}</div>
  )
}

export default HomePage