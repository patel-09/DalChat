import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import OtpInput from '../components/OtpInput'
import { verifyEmailRequest, resendCodeRequest } from '../api'

const CODE_LENGTH = 5
const RESEND_COOLDOWN = 30 // seconds

function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [status, setStatus] = useState('idle') // 'idle' | 'verifying' | 'success'
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)

  // Count the resend timer down by 1 every second
  useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  // After a successful verification, wait 2 seconds, then go to login
  useEffect(() => {
    if (status !== 'success') return
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2000)
    return () => clearTimeout(timer)
  }, [status, navigate])

  async function verify(fullCode) {
    setStatus('verifying')
    setError('')
    setInfo('')
    try {
      await verifyEmailRequest({ email, code: fullCode })
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode)
    setError('')
    // Submit automatically once all 5 boxes are filled
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
      await resendCodeRequest({ email })
      setCode(Array(CODE_LENGTH).fill(''))
      setInfo('A new code has been sent to your email.')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not resend the code. Please try again.')
    }
  }

  // Someone opened this page directly, without signing up first
  if (!email) {
    return (
      <AuthLayout title="Verify your email" subtitle="We couldn't find an email to verify.">
        <p className="text-gray-400">
          Please{' '}
          <Link to="/signup" className="text-yellow-400 hover:underline">
            sign up
          </Link>{' '}
          or{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            log in
          </Link>{' '}
          again.
        </p>
      </AuthLayout>
    )
  }

  // Success screen, shown on the same page before redirecting
  if (status === 'success') {
    return (
      <AuthLayout title="You're verified!" subtitle={email}>
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 size={64} className="text-green-400" />
          <p className="mt-4 text-lg font-semibold text-white">
            Verification successful
          </p>
          <p className="mt-1 text-gray-400">Redirecting you to login…</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 5-digit code we sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <OtpInput
          value={code}
          onChange={handleCodeChange}
          disabled={status === 'verifying'}
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

        <button
          type="submit"
          disabled={status === 'verifying'}
          className="w-full rounded-lg bg-yellow-400 py-2 font-semibold text-gray-900 hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'verifying' ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Didn't get the code?{' '}
        {cooldown > 0 ? (
          <span className="text-gray-500">Resend in {cooldown}s</span>
        ) : (
          <button onClick={handleResend} className="text-yellow-400 hover:underline">
            Resend code
          </button>
        )}
      </p>
    </AuthLayout>
  )
}

export default VerifyEmailPage