import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import TextField from '../../../components/TextField'
import { signupSchema } from '../schemas'

function SignupPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  })

  async function onSubmit(data) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('New account created for:', data.email)
    navigate('/login')
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join DalChat with your Dalhousie email"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Full name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.fullName}
          {...register('fullName')}
        />
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