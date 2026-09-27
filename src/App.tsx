import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import StaffDashboard from './pages/staff/StaffDashboard'
import ResidentDashboard from './pages/residents/ResidentDashboard'
import { apiRequest } from './shared/api'
import type { PortalUser, Role } from './shared/types'

type AuthSession = { token: string; user: PortalUser }
type LoginResponse = { token: string; user: PortalUser }

const SESSION_KEY = 'bscp-auth-session'

function isPortalRole(role: string): role is Role {
  return role === 'admin' || role === 'staff' || role === 'resident'
}

function readStoredSession(): AuthSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) as AuthSession : null
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession)
  const [checkingSession, setCheckingSession] = useState(Boolean(sessionStorage.getItem(SESSION_KEY)))

  useEffect(() => {
    const token = session?.token
    if (!token) return

    let active = true
    apiRequest<{ user: PortalUser }>('/auth/me', { token })
      .then((result) => {
        if (!active) return
        if (!isPortalRole(result.user.role)) {
          sessionStorage.removeItem(SESSION_KEY)
          setSession(null)
          return
        }
        const refreshedSession = { token, user: result.user }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession))
        setSession(refreshedSession)
      })
      .catch(() => {
        if (!active) return
        sessionStorage.removeItem(SESSION_KEY)
        setSession(null)
      })
      .finally(() => { if (active) setCheckingSession(false) })

    return () => { active = false }
  }, [session?.token])

  async function handleLogin(email: string, password: string) {
    const result = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    if (!isPortalRole(result.user.role)) {
      await apiRequest('/auth/logout', { method: 'POST', token: result.token }).catch(() => undefined)
      throw new Error('This account does not have a recognized portal role. Contact your administrator.')
    }

    const nextSession = { token: result.token, user: result.user }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  async function handleLogout() {
    const currentSession = session
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)

    if (!currentSession) return
    try {
      await apiRequest('/auth/logout', { method: 'POST', token: currentSession.token })
    } catch {
      // Clear the local session even if the network is unavailable or the token expired.
    }
  }

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Restoring your secure session…</main>
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (session.user.role === 'admin') {
    return <AdminDashboard user={session.user} token={session.token} onLogout={handleLogout} />
  }

  if (session.user.role === 'staff') {
    return <StaffDashboard user={session.user} token={session.token} onLogout={handleLogout} />
  }

  return <ResidentDashboard user={session.user} token={session.token} onLogout={handleLogout} />
}

export default App
