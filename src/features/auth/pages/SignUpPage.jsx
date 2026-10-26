import { Link } from 'react-router'

function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-400">Create your account</h1>
        <p className="mt-3 text-gray-300">The sign-up form is coming next.</p>
        <p className="mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage