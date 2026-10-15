import type { AuthSession } from './session-context'

export const SESSION_STORAGE_KEY = 'bscp-auth-session'

export function readStoredSession(): AuthSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return value ? JSON.parse(value) as AuthSession : null
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function readAccessToken(): string | null {
  return readStoredSession()?.token ?? null
}
