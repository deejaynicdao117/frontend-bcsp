import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import OverviewPage from './pages/admin/OverviewPage'
import UsersPage from './pages/admin/UsersPage'
import RequestsPage from './pages/admin/RequestsPage'
import CommunityManagement from './pages/admin/CommunityManagement'
import ReportsPage from './pages/admin/ReportsPage'
import NotificationsPage from './pages/admin/NotificationsPage'
import ProfilePage from './pages/admin/ProfilePage'
import StaffLayout from './pages/staff/StaffLayout'
import StaffRequestsPage from './pages/staff/StaffRequestsPage'
import CommunityReview from './pages/staff/CommunityReview'
import ResidentLayout from './pages/residents/ResidentLayout'
import ResidentRequestsPage from './pages/residents/ResidentRequestsPage'
import CommunityServices from './pages/residents/CommunityServices'
import { apiRequest } from './shared/api'
import { SessionContext, homePath, useSession } from './shared/session-context'
import type { AuthSession } from './shared/session-context'
import type { PortalUser, Role } from './shared/types'

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

function RequireAuth({ role }: { role: Role }) {
  const { session } = useSession()
  if (session.user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

function RoleHome() {
  const { session } = useSession()
  return <Navigate to={homePath(session.user.role)} replace />
}

function CommunityManagementRoute() {
  const { session } = useSession()
  return <CommunityManagement token={session.token} />
}

function CommunityReviewRoute() {
  const { session } = useSession()
  return <CommunityReview token={session.token} />
}

function CommunityServicesRoute() {
  const { session } = useSession()
  return <CommunityServices user={session.user} token={session.token} />
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

    if (!result?.user || !result.token) {
      throw new Error('The server returned an unexpected login response. Please try again.')
    }

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
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <SessionContext.Provider value={{ session, onLogout: handleLogout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route element={<RequireAuth role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="community" element={<CommunityManagementRoute />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth role="staff" />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffRequestsPage />} />
              <Route path="community" element={<CommunityReviewRoute />} />
            </Route>
          </Route>

          <Route element={<RequireAuth role="resident" />}>
            <Route path="/resident" element={<ResidentLayout />}>
              <Route index element={<ResidentRequestsPage />} />
              <Route path="services" element={<CommunityServicesRoute />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}

export default App
