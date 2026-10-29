import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import TextField from '../../../components/TextField'
import { loginSchema } from '../schemas'
import { useAuthStore } from '../authStore'
import { loginRequest } from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  async function onSubmit(data) {
    try {
      const user = await loginRequest({
        email: data.email,
        password: data.password,
      })
      login(user)
      navigate('/chats', { replace: true })
    } catch (error) {
      const serverError = error.response?.data

      if (serverError?.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: data.email } })
        return
      }

      setError('root', {
        message: serverError?.message ?? 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue to DalChat">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Dalhousie email"
          type="email"
          placeholder="jane.doe@dal.ca"
          autoComplete="email"
          error={errors.email}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password}
          {...register('password')}
        />

        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-yellow-400 py-2 font-semibold text-gray-900 hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        New to DalChat?{' '}
        <Link to="/signup" className="text-yellow-400 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage