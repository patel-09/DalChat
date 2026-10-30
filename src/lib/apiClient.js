import axios from 'axios'
import { useAuthStore } from '../features/auth/authStore'

export const apiClient = axios.create({
  baseURL: '/api',
})

// Attach the logged-in user to every request.
// TEMPORARY: the real backend will use a login token (JWT) instead,
// and must never trust a plain user ID sent by the browser.
apiClient.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user
  if (user?.id) {
    config.headers['X-User-Id'] = String(user.id)
  }
  return config
})

// Our API always answers with JSON. If HTML comes back instead, the request
// never reached the API (for example, the mock server wasn't running),
// so treat it as an error instead of passing broken data to the page.
apiClient.interceptors.response.use((response) => {
  const contentType = String(response.headers['content-type'] ?? '')

  if (contentType.includes('text/html')) {
    return Promise.reject(
      new Error(
        `Expected JSON from ${response.config.url} but got HTML. Is the mock server (MSW) running?`
      )
    )
  }

  return response
})