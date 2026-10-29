import { apiClient } from '../../lib/apiClient'

export async function signupRequest(details) {
  const response = await apiClient.post('/auth/signup', details)
  return response.data
}

export async function loginRequest(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function verifyEmailRequest(details) {
  const response = await apiClient.post('/auth/verify-email', details)
  return response.data
}

export async function resendCodeRequest(details) {
  const response = await apiClient.post('/auth/resend-code', details)
  return response.data
}