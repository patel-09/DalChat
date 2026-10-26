import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-400">404</h1>
        <p className="mt-3 text-gray-300">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block text-yellow-400 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage