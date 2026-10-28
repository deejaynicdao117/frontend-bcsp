import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { homePath, useSession } from '../shared/session-context'
import type { AuthSession } from '../shared/session-context'
import type { Role } from '../shared/types'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const TermsPage = lazy(() => import('../pages/TermsPage'))
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'))
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'))
const OverviewPage = lazy(() => import('../pages/admin/OverviewPage'))
const UsersPage = lazy(() => import('../pages/admin/UsersPage'))
const RequestsPage = lazy(() => import('../pages/admin/RequestsPage'))
const DocumentTypesPage = lazy(() => import('../pages/admin/DocumentTypesPage'))
const CommunityManagement = lazy(() => import('../pages/admin/CommunityManagement'))
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage'))
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'))
const AdminProfilePage = lazy(() => import('../pages/admin/ProfilePage'))
const BrowserNotificationListener = lazy(() => import('../components/shared/BrowserNotificationListener'))
const PlatformLayout = lazy(() => import('../pages/platform/PlatformLayout'))
const PlatformBarangaysPage = lazy(() => import('../pages/platform/BarangaysPage'))
const StaffLayout = lazy(() => import('../pages/staff/StaffLayout'))
const StaffRequestsPage = lazy(() => import('../pages/staff/StaffRequestsPage'))
const StaffAnnouncementsPage = lazy(() => import('../pages/staff/AnnouncementsPage'))
const CommunityReview = lazy(() => import('../pages/staff/CommunityReview'))
const ResidentLayout = lazy(() => import('../pages/residents/ResidentLayout'))
const ResidentRequestsPage = lazy(() => import('../pages/residents/ResidentRequestsPage'))
const ProfilePage = lazy(() => import('../pages/residents/ProfilePage'))
const ComplaintsPage = lazy(() => import('../pages/residents/ComplaintsPage'))
const AssistancePage = lazy(() => import('../pages/residents/AssistancePage'))
const AnnouncementsPage = lazy(() => import('../pages/residents/AnnouncementsPage'))
const EmergencyContactsPage = lazy(() => import('../pages/residents/EmergencyContactsPage'))
const EvacuationCentersPage = lazy(() => import('../pages/residents/EvacuationCentersPage'))

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

      <Route element={<RequireAuth role="platform_admin" />}>
        <Route path="/platform" element={<PlatformLayout />}>
          <Route path="barangays" element={<PlatformBarangaysPage />} />
        </Route>
      </Route>

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
          <Route path="announcements" element={<StaffAnnouncementsPage />} />
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
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading portal…</main>}>
      {!session ? (
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/register" element={<RegisterPage onVerified={onRegistrationVerified} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      ) : <AuthenticatedRoutes />}
    </Suspense>
  )
}
