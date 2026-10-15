import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { getCurrentUser, login, logout } from './shared/api'
import { SessionContext } from './shared/session-context'
import type { AuthSession } from './shared/session-context'
import type { Role } from './shared/types'
import {
  clearSession,
  readStoredSession,
  saveSession,
  SESSION_STORAGE_KEY,
} from './shared/session-storage'

function isPortalRole(role: string): role is Role {
  return role === 'admin' || role === 'staff' || role === 'resident'
}

function App() {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(readStoredSession)
  const [checkingSession, setCheckingSession] = useState(
    Boolean(sessionStorage.getItem(SESSION_STORAGE_KEY)),
  )

  useEffect(() => {
    const token = session?.token
    if (!token) return

    let active = true
    getCurrentUser()
      .then((result) => {
        if (!active) return

        if (!isPortalRole(result.user.role)) {
          clearSession()
          setSession(null)
          return
        }

        const refreshedSession = { token, user: result.user }
        saveSession(refreshedSession)
        setSession(refreshedSession)
      })
      .catch(() => {
        if (!active) return

        clearSession()
        setSession(null)
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [session?.token])

  async function handleLogin(email: string, password: string) {
    const result = await login({ email, password })

    if (!result?.user || !result.token) {
      throw new Error('The server returned an unexpected login response. Please try again.')
    }

    if (!isPortalRole(result.user.role)) {
      await logout(result.token).catch(() => undefined)
      throw new Error('This account does not have a recognized portal role. Contact your administrator.')
    }

    const nextSession = { token: result.token, user: result.user }
    queryClient.clear()
    saveSession(nextSession)
    setSession(nextSession)
  }

  function handleRegistrationVerified(nextSession: AuthSession) {
    queryClient.clear()
    saveSession(nextSession)
    setSession(nextSession)
  }

  async function handleLogout() {
    const currentSession = session
    queryClient.clear()
    clearSession()
    setSession(null)

    if (!currentSession) return
    try {
      await logout(currentSession.token)
    } catch {
      // Clear the local session even if the network is unavailable or the token expired.
    }
  }

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Restoring your secure session…</main>
  }

  return (
    <BrowserRouter>
      {session ? (
        <SessionContext.Provider value={{ session, onLogout: handleLogout }}>
          <AppRoutes
            session={session}
            onLogin={handleLogin}
            onRegistrationVerified={handleRegistrationVerified}
          />
        </SessionContext.Provider>
      ) : (
        <AppRoutes
          session={null}
          onLogin={handleLogin}
          onRegistrationVerified={handleRegistrationVerified}
        />
      )}
    </BrowserRouter>
  )
}

export default App
