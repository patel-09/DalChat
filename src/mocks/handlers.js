import { http, HttpResponse, delay } from 'msw'
import { users } from './data/users'
import { posts } from './data/posts'
import { clubs } from './data/clubs'

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

const APPLICATIONS_KEY = 'dalchat-mock-society-applications'

function loadApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) ?? []
  } catch {
    return []
  }
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
    // Home feed: GET /api/feed
  http.get('/api/feed', async () => {
    await delay(700)

    const feed = posts
      .map((post) => {
        const author = users.find((user) => user.id === post.authorId)
        return {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          author: { id: author.id, name: author.name, program: author.program },
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return HttpResponse.json(feed)
  }),

    // Clubs directory: GET /api/clubs?search=...&category=...
  http.get('/api/clubs', async ({ request }) => {
    await delay(600)

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const category = url.searchParams.get('category') ?? 'All'

    const results = clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(search) ||
        club.description.toLowerCase().includes(search)
      const matchesCategory = category === 'All' || club.category === category
      return matchesSearch && matchesCategory
    })

    return HttpResponse.json(results)
  }),
  // Society application: POST /api/clubs/applications
  http.post('/api/clubs/applications', async ({ request }) => {
    await delay(1000)

    const form = await request.formData()
    const name = String(form.get('name')).trim()
    const executives = JSON.parse(form.get('executives'))
    const members = JSON.parse(form.get('members'))
    const proof = form.get('proof')

    const applications = loadApplications()
    const nameTaken = [...clubs, ...applications].some(
      (club) => club.name.toLowerCase() === name.toLowerCase()
    )
    if (nameTaken) {
      return HttpResponse.json(
        { field: 'name', message: 'A society with this name already exists on DalChat' },
        { status: 409 }
      )
    }

    // The server checks the minimum requirements again: never trust the browser alone
    if (executives.length < 3 || members.length < 10 || !(proof instanceof File)) {
      return HttpResponse.json(
        { message: 'This application does not meet the minimum requirements' },
        { status: 400 }
      )
    }

    const application = {
      id: Date.now(),
      name,
      category: form.get('category'),
      description: form.get('description'),
      executives,
      members,
      proofFileName: proof.name,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([...applications, application]))

    return HttpResponse.json({ id: application.id, status: application.status }, { status: 201 })
  }),

    // Member search and suggestions: GET /api/clubs/member-suggestions?search=...&topic=...
  http.get('/api/clubs/member-suggestions', async ({ request }) => {
    await delay(400)

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const topicWords = (url.searchParams.get('topic') ?? '')
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)

    function matchingInterests(user) {
      return user.interests.filter((interest) =>
        interest
          .toLowerCase()
          .split(/\W+/)
          .some((word) => topicWords.includes(word))
      )
    }

    function toResult(user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        program: user.program,
        year: user.year,
        matchedInterests: matchingInterests(user),
      }
    }

    // Typing in the search box: filter everyone by name or program
    if (search) {
      const results = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.program.toLowerCase().includes(search)
      )
      return HttpResponse.json(results.map(toResult))
    }

    // Empty search box: suggest students whose interests match the society
    const suggested = users.filter((user) => matchingInterests(user).length > 0)
    return HttpResponse.json(suggested.map(toResult))
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