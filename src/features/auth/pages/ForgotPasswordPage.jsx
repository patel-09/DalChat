import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import OtpInput from '../components/OtpInput'
import TextField from '../../../components/TextField'
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas'
import { forgotPasswordRequest, resetPasswordRequest } from '../api'

const CODE_LENGTH = 5
const RESEND_COOLDOWN = 30 // seconds

const primaryButton =
  'w-full rounded-lg bg-yellow-400 py-2 font-semibold text-gray-900 hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed'

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback
}

// ---- Step 1: ask for the email ----
function EmailStep({ defaultEmail, onCodeSent }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: defaultEmail },
  })

  async function onSubmit(values) {
    try {
      await forgotPasswordRequest({ email: values.email })
      onCodeSent(values.email)
    } catch (error) {
      setError('root', {
        message: errorMessage(error, 'Something went wrong. Please try again.'),
      })
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your Dalhousie email and we'll send you a code to reset it."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Dalhousie email"
          type="email"
          placeholder="jane.doe@dal.ca"
          autoComplete="email"
          error={errors.email}
          {...register('email')}
        />

        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={primaryButton}>
          {isSubmitting ? 'Sending code…' : 'Send reset code'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Remembered it?{' '}
        <Link to="/login" className="text-yellow-400 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}

// ---- Step 2: enter the code and a new password ----
function ResetStep({ email, onDone, onChangeEmail }) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [codeError, setCodeError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  })

  // Count the resend timer down by 1 every second
  useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function onSubmit(values) {
    const fullCode = code.join('')
    if (fullCode.length < CODE_LENGTH) {
      setCodeError(`Enter all ${CODE_LENGTH} digits of the code`)
      return
    }

    setInfo('')
    try {
      await resetPasswordRequest({ email, code: fullCode, password: values.password })
      onDone()
    } catch (error) {
      const serverError = error.response?.data
      if (serverError?.field === 'code') {
        setCodeError(serverError.message)
        return
      }
      setError('root', {
        message: errorMessage(error, 'Something went wrong. Please try again.'),
      })
    }
  }

  async function handleResend() {
    setCodeError('')
    setInfo('')
    try {
      await forgotPasswordRequest({ email })
      setCode(Array(CODE_LENGTH).fill(''))
      setInfo('A new code has been sent to your email.')
      setCooldown(RESEND_COOLDOWN)
    } catch (error) {
      setCodeError(errorMessage(error, 'Could not resend the code. Please try again.'))
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={`If an account exists for ${email}, we've sent a 5-digit code.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Reset code</p>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next)
              setCodeError('')
            }}
            disabled={isSubmitting}
            hasError={Boolean(codeError)}
          />
          {codeError && <p className="mt-2 text-center text-sm text-red-400">{codeError}</p>}
        </div>

        <TextField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
          {...register('password')}
        />
        <TextField
          label="Confirm new password"
          type="password"
          placeholder="Type it again"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...register('confirmPassword')}
        />

        {info && (
          <p className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-center text-sm text-green-400">
            {info}
          </p>
        )}
        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={primaryButton}>
          {isSubmitting ? 'Updating password…' : 'Reset password'}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-gray-400">
        <p>
          Didn't get the code?{' '}
          {cooldown > 0 ? (
            <span className="text-gray-500">Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className="text-yellow-400 hover:underline">
              Resend code
            </button>
          )}
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-gray-400 hover:text-white hover:underline"
        >
          Use a different email
        </button>
      </div>
    </AuthLayout>
  )
}

// ---- Step 3: success ----
function DoneStep() {
  const navigate = useNavigate()

  // Go to login automatically after a short pause
  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <AuthLayout title="Password updated" subtitle="You can now log in with your new password.">
      <div className="flex flex-col items-center py-4 text-center">
        <CheckCircle2 size={64} className="text-green-400" />
        <p className="mt-4 text-gray-400">Redirecting you to log in…</p>
        <Link to="/login" replace className="mt-4 text-yellow-400 hover:underline">
          Log in now
        </Link>
      </div>
    </AuthLayout>
  )
}

// ---- The page: switches between the three steps ----
function ForgotPasswordPage() {
  const location = useLocation()
  const [step, setStep] = useState('email') // 'email' | 'reset' | 'done'
  const [email, setEmail] = useState(location.state?.email ?? '')

  if (step === 'reset') {
    return (
      <ResetStep
        email={email}
        onDone={() => setStep('done')}
        onChangeEmail={() => setStep('email')}
      />
    )
  }

  if (step === 'done') {
    return <DoneStep />
  }

  return (
    <EmailStep
      defaultEmail={email}
      onCodeSent={(sentTo) => {
        setEmail(sentTo)
        setStep('reset')
      }}
    />
  )
}

export default ForgotPasswordPage