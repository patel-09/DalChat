import { Link } from 'react-router'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-yellow-400">DalChat</h1>
        <p className="mt-3 text-gray-300">
          Connect with fellow Dalhousie students
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            to="/signup"
            className="px-6 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-6 py-2 rounded-lg border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-gray-900 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage