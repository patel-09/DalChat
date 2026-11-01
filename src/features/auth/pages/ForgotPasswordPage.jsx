import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import OtpInput from '../components/OtpInput'
import TextField from '../../../components/TextField'
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas'
import {
  forgotPasswordRequest,
  verifyResetCodeRequest,
  resetPasswordRequest,
} from '../api'

const CODE_LENGTH = 5
const RESEND_COOLDOWN = 30 // seconds

const primaryButton =
  'w-full rounded-lg bg-yellow-400 py-2 font-semibold text-gray-900 hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed'

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback
}

// ---- Step 1: ask for the email ----
function EmailStep({ defaultEmail, notice, onCodeSent }) {
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
        {notice && (
          <p className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-300">
            {notice}
          </p>
        )}

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

// ---- Step 2: enter the code ----
function CodeStep({ email, onVerified, onChangeEmail }) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)

  // Count the resend timer down by 1 every second
  useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function verify(fullCode) {
    setIsVerifying(true)
    setError('')
    setInfo('')
    try {
      const { resetToken } = await verifyResetCodeRequest({ email, code: fullCode })
      onVerified(resetToken)
    } catch (err) {
      setIsVerifying(false)
      setError(errorMessage(err, 'Something went wrong. Please try again.'))
    }
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode)
    setError('')
    // Check automatically once all 5 boxes are filled
    if (nextCode.every((digit) => digit !== '')) {
      verify(nextCode.join(''))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (code.some((digit) => digit === '')) {
      setError(`Enter all ${CODE_LENGTH} digits`)
      return
    }
    verify(code.join(''))
  }

  async function handleResend() {
    setError('')
    setInfo('')
    try {
      await forgotPasswordRequest({ email })
      setCode(Array(CODE_LENGTH).fill(''))
      setInfo('A new code has been sent to your email.')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(errorMessage(err, 'Could not resend the code. Please try again.'))
    }
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`If an account exists for ${email}, we've sent a 5-digit code.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <OtpInput
          value={code}
          onChange={handleCodeChange}
          disabled={isVerifying}
          hasError={Boolean(error)}
        />

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-center text-sm text-green-400">
            {info}
          </p>
        )}

        <button type="submit" disabled={isVerifying} className={primaryButton}>
          {isVerifying ? 'Checking code…' : 'Verify code'}
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

// ---- Step 3: choose a new password ----
function PasswordStep({ email, resetToken, onDone, onSessionExpired }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  })

  async function onSubmit(values) {
    try {
      await resetPasswordRequest({ email, resetToken, password: values.password })
      onDone()
    } catch (error) {
      if (error.response?.data?.code === 'RESET_SESSION_EXPIRED') {
        onSessionExpired()
        return
      }
      setError('root', {
        message: errorMessage(error, 'Something went wrong. Please try again.'),
      })
    }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle={`For ${email}`}>
      <p className="mb-5 flex items-center gap-2 text-sm text-green-400">
        <CheckCircle2 size={16} />
        Code verified
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          autoFocus
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

        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={primaryButton}>
          {isSubmitting ? 'Updating password…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  )
}

// ---- Step 4: success ----
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

// ---- The page: switches between the four steps ----
function ForgotPasswordPage() {
  const location = useLocation()
  const [step, setStep] = useState('email') // 'email' | 'code' | 'password' | 'done'
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [resetToken, setResetToken] = useState('')
  const [notice, setNotice] = useState('')

  if (step === 'code') {
    return (
      <CodeStep
        email={email}
        onVerified={(token) => {
          setResetToken(token)
          setStep('password')
        }}
        onChangeEmail={() => setStep('email')}
      />
    )
  }

  if (step === 'password') {
    return (
      <PasswordStep
        email={email}
        resetToken={resetToken}
        onDone={() => setStep('done')}
        onSessionExpired={() => {
          setResetToken('')
          setNotice('Your reset session expired. Please request a new code.')
          setStep('email')
        }}
      />
    )
  }

  if (step === 'done') {
    return <DoneStep />
  }

  return (
    <EmailStep
      defaultEmail={email}
      notice={notice}
      onCodeSent={(sentTo) => {
        setEmail(sentTo)
        setNotice('')
        setStep('code')
      }}
    />
  )
}

export default ForgotPasswordPage