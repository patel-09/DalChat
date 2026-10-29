import { http, HttpResponse, delay } from 'msw'
import { users } from './data/users'

export const handlers = [
  // GET /api/users?search=something
  http.get('/api/users', async ({ request }) => {
    await delay(600) // pretend the network takes a moment

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()

    const results = users.filter((user) =>
      [user.name, user.program, ...user.interests].some((field) =>
        field.toLowerCase().includes(search)
      )
    )

    return HttpResponse.json(results)
  }),
]