import { http, HttpResponse, delay } from 'msw'
import { users } from './data/users'

// ---- A tiny fake "database" of accounts, saved in the browser ----
const ACCOUNTS_KEY = 'dalchat-mock-accounts'

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

    const newAccount = { id: Date.now(), firstName, lastName, email, password }
    saveAccounts([...accounts, newAccount])

    return HttpResponse.json(
      { id: newAccount.id, firstName, lastName, email },
      { status: 201 }
    )
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