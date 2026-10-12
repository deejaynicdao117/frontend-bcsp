import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearSession, readAccessToken } from '../session-storage'

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAccessToken()

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const payload = error.response?.data as {
      errors?: Record<string, string[]>
      message?: string
    } | undefined

    if (error.response?.status === 401) {
      clearSession()

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(' ')
      : ''
    const message = validationMessage || payload?.message || (
      error.response
        ? `Request failed (${error.response.status})`
        : `Cannot reach the API (${API_URL}). Check that the backend server is running.`
    )

    return Promise.reject(new Error(message))
  },
)
