import { http, HttpResponse, delay } from 'msw'
import { users } from './data/users'

// ---- A tiny fake "database" of accounts, saved in the browser ----
const ACCOUNTS_KEY = 'dalchat-mock-accounts'
const CODE_LIFETIME_MS = 10 * 60 * 1000 // 10 minutes

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) ?? []
  } catch {
    return []
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function generateCode() {
  // A random number from 10000 to 99999, so always 5 digits
  return String(Math.floor(10000 + Math.random() * 90000))
}

function sendMockEmail(email, code) {
  // Pretend to send an email: the code shows up in the browser console
  console.info(`📧 [Mock email] To: ${email} | Your DalChat verification code is: ${code}`)
}

export const handlers = [
  // Sign up: POST /api/auth/signup
  http.post('/api/auth/signup', async ({ request }) => {
    await delay(800)
    const { firstName, lastName, email, password } = await request.json()
    const accounts = loadAccounts()

    if (accounts.some((account) => account.email === email)) {
      return HttpResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const code = generateCode()
    const newAccount = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      verified: false,
      verificationCode: code,
      codeExpiresAt: Date.now() + CODE_LIFETIME_MS,
    }
    saveAccounts([...accounts, newAccount])
    sendMockEmail(email, code)

    return HttpResponse.json(
      { email, message: 'Account created. Check your email for a verification code.' },
      { status: 201 }
    )
  }),

  // Verify email: POST /api/auth/verify-email
  http.post('/api/auth/verify-email', async ({ request }) => {
    await delay(800)
    const { email, code } = await request.json()
    const accounts = loadAccounts()
    const account = accounts.find((a) => a.email === email)

    if (!account) {
      return HttpResponse.json({ message: 'Account not found' }, { status: 404 })
    }
    if (account.verified !== false) {
      return HttpResponse.json(
        { message: 'This account is already verified. You can log in.' },
        { status: 409 }
      )
    }
    if (Date.now() > account.codeExpiresAt) {
      return HttpResponse.json(
        { message: 'This code has expired. Request a new one.' },
        { status: 410 }
      )
    }
    if (account.verificationCode !== code) {
      return HttpResponse.json(
        { message: 'Incorrect code. Please try again.' },
        { status: 400 }
      )
    }

    saveAccounts(
      accounts.map((a) =>
        a.email === email
          ? { ...a, verified: true, verificationCode: null, codeExpiresAt: null }
          : a
      )
    )
    return HttpResponse.json({ message: 'Email verified' })
  }),

  // Resend code: POST /api/auth/resend-code
  http.post('/api/auth/resend-code', async ({ request }) => {
    await delay(600)
    const { email } = await request.json()
    const accounts = loadAccounts()
    const account = accounts.find((a) => a.email === email)

    if (!account || account.verified !== false) {
      return HttpResponse.json(
        { message: 'There is no unverified account for this email' },
        { status: 400 }
      )
    }

    const code = generateCode()
    saveAccounts(
      accounts.map((a) =>
        a.email === email
          ? { ...a, verificationCode: code, codeExpiresAt: Date.now() + CODE_LIFETIME_MS }
          : a
      )
    )
    sendMockEmail(email, code)

    return HttpResponse.json({ message: 'A new code has been sent' })
  }),

  // Log in: POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800)
    const { email, password } = await request.json()

    const account = loadAccounts().find(
      (a) => a.email === email && a.password === password
    )

    if (!account) {
      return HttpResponse.json(
        { message: 'Incorrect email or password' },
        { status: 401 }
      )
    }

    if (account.verified === false) {
      return HttpResponse.json(
        {
          message: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED',
        },
        { status: 403 }
      )
    }

    return HttpResponse.json({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
  }),

  // Search students: GET /api/users?search=something
  http.get('/api/users', async ({ request }) => {
    await delay(600)

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()

    const results = users.filter((user) =>
      [user.name, user.program].some((field) =>
        field.toLowerCase().includes(search)
      )
    )

    return HttpResponse.json(results)
  }),
]