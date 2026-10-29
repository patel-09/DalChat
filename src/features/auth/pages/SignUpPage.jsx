import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import TextField from '../../../components/TextField'
import { signupSchema } from '../schemas'
import { signupRequest } from '../api'

function SignupPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  })

  async function onSubmit(data) {
    try {
      await signupRequest({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      navigate('/verify-email', { state: { email: data.email } })
    } catch (error) {
      setError('root', {
        message:
          error.response?.data?.message ?? 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join DalChat with your Dalhousie email"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="First name"
            type="text"
            placeholder="Jane"
            autoComplete="given-name"
            error={errors.firstName}
            {...register('firstName')}
          />
          <TextField
            label="Last name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
            error={errors.lastName}
            {...register('lastName')}
          />
        </div>
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          placeholder="Type it again"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...register('confirmPassword')}
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-yellow-400 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage