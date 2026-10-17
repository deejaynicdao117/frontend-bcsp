import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AdminLayout from '../pages/admin/AdminLayout'
import OverviewPage from '../pages/admin/OverviewPage'
import UsersPage from '../pages/admin/UsersPage'
import RequestsPage from '../pages/admin/RequestsPage'
import DocumentTypesPage from '../pages/admin/DocumentTypesPage'
import CommunityManagement from '../pages/admin/CommunityManagement'
import ReportsPage from '../pages/admin/ReportsPage'
import NotificationsPage from '../pages/admin/NotificationsPage'
import AdminProfilePage from '../pages/admin/ProfilePage'
import BrowserNotificationListener from '../components/shared/BrowserNotificationListener'
import StaffLayout from '../pages/staff/StaffLayout'
import StaffRequestsPage from '../pages/staff/StaffRequestsPage'
import CommunityReview from '../pages/staff/CommunityReview'
import ResidentLayout from '../pages/residents/ResidentLayout'
import ResidentRequestsPage from '../pages/residents/ResidentRequestsPage'
import ProfilePage from '../pages/residents/ProfilePage'
import ComplaintsPage from '../pages/residents/ComplaintsPage'
import AssistancePage from '../pages/residents/AssistancePage'
import AnnouncementsPage from '../pages/residents/AnnouncementsPage'
import EmergencyContactsPage from '../pages/residents/EmergencyContactsPage'
import EvacuationCentersPage from '../pages/residents/EvacuationCentersPage'
import { homePath, useSession } from '../shared/session-context'
import type { AuthSession } from '../shared/session-context'
import type { Role } from '../shared/types'

export type AppRoutesProps = {
  session: AuthSession | null
  onLogin: (email: string, password: string) => Promise<void>
  onRegistrationVerified: (session: AuthSession) => void
}

function RequireAuth({ role }: { role: Role }) {
  const { session } = useSession()

  if (session.user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function RoleHome() {
  const { session } = useSession()
  return <Navigate to={homePath(session.user.role)} replace />
}

function CommunityManagementRoute() {
  return <CommunityManagement />
}

function CommunityReviewRoute() {
  return <CommunityReview />
}

function AuthenticatedRoutes() {
  return (
    <>
    <BrowserNotificationListener />
    <Routes>
      <Route path="/" element={<RoleHome />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route element={<RequireAuth role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="document-types" element={<DocumentTypesPage />} />
          <Route path="community" element={<CommunityManagementRoute />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
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
          <Route path="profile" element={<ProfilePage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="assistance" element={<AssistancePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="emergency-contacts" element={<EmergencyContactsPage />} />
          <Route path="evacuation-centers" element={<EvacuationCentersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function AppRoutes({ session, onLogin, onRegistrationVerified }: AppRoutesProps) {
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/register" element={<RegisterPage onVerified={onRegistrationVerified} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AuthenticatedRoutes />
}
