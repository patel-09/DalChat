import { Link } from 'react-router'

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-400">Log in</h1>
        <p className="mt-3 text-gray-300">The login form is coming next.</p>
        <p className="mt-6 text-gray-400">
          New to DalChat?{' '}
          <Link to="/signup" className="text-yellow-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage