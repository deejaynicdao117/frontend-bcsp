import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  FileCheck2,
  FileClock,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Sidebar from '../../components/admin/Sidebar'
import type { DashboardPage } from '../../components/admin/Sidebar'
import StatCard from '../../components/admin/StatCard'
import CommunityManagement from './CommunityManagement'
import { Alert, Card, EmptyState, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import type { DashboardOverview, DocumentRequest, PortalNotification, PortalUser, ReportsData, Role } from '../../shared/types'

type AdminDashboardProps = {
  user: PortalUser
  token: string
  onLogout: () => void
}

type ListResponse<T> = { data: T[] }
type DataResponse<T> = { data: T }
type NewUser = { name: string; email: string; password: string; role: Role }
type DashboardData = {
  overview: DashboardOverview
  users: PortalUser[]
  requests: DocumentRequest[]
  reports: ReportsData
  notifications: PortalNotification[]
}

const blankOverview: DashboardOverview = {
  total_users: 0,
  admin_count: 0,
  staff_count: 0,
  resident_count: 0,
  total_requests: 0,
  pending_requests: 0,
  requests_this_month: 0,
  recent_requests: [],
}
const blankReports: ReportsData = { requests_by_status: [], monthly_requests: [], total_requests: 0 }
const roleOptions: Role[] = ['admin', 'staff', 'resident']
const requestStatuses = ['pending', 'under_review', 'approved', 'rejected', 'ready_for_release', 'completed']

const pageTitles: Record<DashboardPage, { title: string; description: string }> = {
  dashboard: { title: 'Overview', description: 'A clear view of your barangay services and activity.' },
  users: { title: 'User management', description: 'Manage portal accounts, roles, and access.' },
  requests: { title: 'Document requests', description: 'Track resident requests and their current status.' },
  community: { title: 'Community & safety', description: 'Manage households, incidents, emergencies, and public information.' },
  reports: { title: 'Reports & insights', description: 'Review service demand and request outcomes.' },
  notifications: { title: 'Notifications', description: 'Recent request activity that may need attention.' },
  profile: { title: 'My profile', description: 'Your administrator account information.' },
}

async function loadDashboardData(token: string): Promise<DashboardData> {
  const [dashboardResult, usersResult, requestsResult, reportsResult, notificationsResult] = await Promise.all([
    apiRequest<DataResponse<DashboardOverview>>('/admin/dashboard', { token }),
    apiRequest<ListResponse<PortalUser>>('/admin/users', { token }),
    apiRequest<ListResponse<DocumentRequest>>('/admin/document-requests', { token }),
    apiRequest<DataResponse<ReportsData>>('/admin/reports', { token }),
    apiRequest<ListResponse<PortalNotification>>('/admin/notifications', { token }),
  ])

  return {
    overview: dashboardResult.data,
    users: usersResult.data,
    requests: requestsResult.data,
    reports: reportsResult.data,
    notifications: notificationsResult.data,
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function RequestTable({ requests }: { requests: DocumentRequest[] }) {
  if (requests.length === 0) return <EmptyState title="No document requests found" hint="New activity will appear here." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="table-head">
          <tr>
            <th className="table-th">Tracking no.</th>
            <th className="table-th">Resident</th>
            <th className="table-th">Document</th>
            <th className="table-th">Submitted</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((request) => (
            <tr key={request.id} className="transition hover:bg-slate-50/70">
              <td className="table-td font-medium text-slate-900">{request.tracking_number}</td>
              <td className="table-td">
                <p className="font-medium text-slate-800">{request.user?.name ?? 'Resident'}</p>
                <p className="mt-0.5 text-xs text-slate-400">{request.user?.email ?? '—'}</p>
              </td>
              <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
              <td className="table-td text-xs whitespace-nowrap text-slate-500">{formatDate(request.created_at)}</td>
              <td className="table-td"><StatusBadge status={request.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard({ user, token, onLogout }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState<DashboardPage>('dashboard')
  const [overview, setOverview] = useState(blankOverview)
  const [users, setUsers] = useState<PortalUser[]>([])
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [reports, setReports] = useState(blankReports)
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', password: '', role: 'resident' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const applyDashboardData = useCallback((data: DashboardData) => {
    setOverview(data.overview)
    setUsers(data.users)
    setRequests(data.requests)
    setReports(data.reports)
    setNotifications(data.notifications)
  }, [])

  const refreshData = useCallback(async () => {
    applyDashboardData(await loadDashboardData(token))
  }, [applyDashboardData, token])

  useEffect(() => {
    let active = true
    loadDashboardData(token)
      .then((data) => { if (active) applyDashboardData(data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load the admin dashboard.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applyDashboardData, token])

  const filteredUsers = useMemo(() => users.filter((item) => {
    const query = search.toLowerCase()
    return (roleFilter === 'all' || item.role === roleFilter)
      && (`${item.name} ${item.email}`.toLowerCase().includes(query))
  }), [users, search, roleFilter])

  const filteredRequests = useMemo(() => requests.filter((item) => {
    const query = search.toLowerCase()
    return (statusFilter === 'all' || item.status === statusFilter)
      && (`${item.tracking_number} ${item.user?.name ?? ''} ${item.document_type?.name ?? ''}`.toLowerCase().includes(query))
  }), [requests, search, statusFilter])

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await apiRequest('/admin/users', { token, method: 'POST', body: newUser })
      setNewUser({ name: '', email: '', password: '', role: 'resident' })
      setShowCreateForm(false)
      await refreshData()
      setSuccess('Account created successfully.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  async function updateUser(updatedUser: PortalUser) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await apiRequest<DataResponse<PortalUser>>(`/admin/users/${updatedUser.id}`, {
        token,
        method: 'PUT',
        body: { name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      })
      setUsers((current) => current.map((item) => item.id === result.data.id ? result.data : item))
      setSuccess(`${result.data.name}'s account was updated.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not update account.')
    } finally {
      setBusy(false)
    }
  }

  function updateUserDraft(updatedUser: PortalUser) {
    setUsers((current) => current.map((item) => item.id === updatedUser.id ? updatedUser : item))
  }

  async function deleteUser(target: PortalUser) {
    if (target.id === user.id || !window.confirm(`Delete the account for ${target.name}? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await apiRequest(`/admin/users/${target.id}`, { token, method: 'DELETE' })
      await refreshData()
      setSuccess(`${target.name}'s account was deleted.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not delete account.')
    } finally {
      setBusy(false)
    }
  }

  function navigate(page: DashboardPage) {
    setActivePage(page)
    setSearch('')
  }

  const title = pageTitles[activePage]
  const maxStatus = Math.max(1, ...reports.requests_by_status.map((item) => item.total))
  const maxMonth = Math.max(1, ...reports.monthly_requests.map((item) => item.total))

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar activePage={activePage} onNavigate={navigate} onLogout={onLogout} notificationCount={notifications.length} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{title.title}</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{title.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePage('notifications')}
              aria-label="Open notifications"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={18} strokeWidth={1.9} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <span className="hidden h-6 w-px bg-slate-200 sm:block" />

            <button type="button" onClick={() => setActivePage('profile')} className="flex items-center gap-2 text-left">
              <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:block">
                <span className="block max-w-36 truncate text-xs font-medium text-slate-800">{user.name}</span>
                <span className="block text-[10px] text-slate-500 capitalize">{user.role}</span>
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {(error || success) && (
            <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setSuccess('') }}>
              {error || success}
            </Alert>
          )}

          {loading ? (
            <Spinner label="Loading live portal data…" />
          ) : (
            <>
              {activePage === 'dashboard' && (
                <DashboardHome
                  overview={overview}
                  requests={requests.slice(0, 6)}
                  onOpenRequests={() => setActivePage('requests')}
                  onOpenUsers={() => setActivePage('users')}
                />
              )}

              {activePage === 'users' && (
                <UserManagement
                  users={filteredUsers}
                  user={user}
                  search={search}
                  roleFilter={roleFilter}
                  showCreateForm={showCreateForm}
                  newUser={newUser}
                  busy={busy}
                  onSearch={setSearch}
                  onRoleFilter={setRoleFilter}
                  onToggleCreate={() => setShowCreateForm((value) => !value)}
                  onNewUserChange={setNewUser}
                  onCreate={createUser}
                  onDraftChange={updateUserDraft}
                  onSave={updateUser}
                  onDelete={deleteUser}
                />
              )}

              {activePage === 'requests' && (
                <RequestsPage
                  requests={filteredRequests}
                  search={search}
                  statusFilter={statusFilter}
                  onSearch={setSearch}
                  onStatusFilter={setStatusFilter}
                />
              )}

              {activePage === 'community' && <CommunityManagement token={token} />}

              {activePage === 'reports' && <ReportsPage reports={reports} maxStatus={maxStatus} maxMonth={maxMonth} />}

              {activePage === 'notifications' && <NotificationsPage notifications={notifications} />}

              {activePage === 'profile' && <ProfilePage user={user} onLogout={onLogout} />}
            </>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
            <span>Barangay Citizen Services Portal</span>
            <span>
              Admin workspace · Local time {new Intl.DateTimeFormat('en-PH', { timeStyle: 'short' }).format(new Date())}
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}

/* -------------------------------- Dashboard -------------------------------- */

function DashboardHome({ overview, requests, onOpenRequests, onOpenUsers }: {
  overview: DashboardOverview
  requests: DocumentRequest[]
  onOpenRequests: () => void
  onOpenUsers: () => void
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Good day, administrator"
        title="Your community at a glance"
        description="Here is what is happening across your portal today."
        action={
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-200/80">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            System operational
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={overview.total_users} note={`${overview.resident_count} residents registered`} icon={Users} accent="blue" />
        <StatCard label="Document requests" value={overview.total_requests} note={`${overview.requests_this_month} submitted this month`} icon={FileText} accent="violet" />
        <StatCard label="Pending review" value={overview.pending_requests} note="Requests awaiting staff action" icon={FileClock} accent="amber" />
        <StatCard label="Staff accounts" value={overview.staff_count} note={`${overview.admin_count} administrator accounts`} icon={ShieldCheck} accent="emerald" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.5fr_1fr]">
        <Card
          title="Recent document requests"
          action={
            <button type="button" onClick={onOpenRequests} className="text-xs font-semibold text-blue-600 transition hover:text-blue-800">
              View all →
            </button>
          }
        >
          <RequestTable requests={requests} />
        </Card>

        <div className="space-y-6">
          <Card
            title="User distribution"
            action={
              <button type="button" onClick={onOpenUsers} className="text-xs font-semibold text-blue-600 transition hover:text-blue-800">
                Manage users
              </button>
            }
            padded
          >
            <div className="space-y-5">
              <DistributionRow label="Residents" count={overview.resident_count} total={overview.total_users} color="bg-blue-500" />
              <DistributionRow label="Staff" count={overview.staff_count} total={overview.total_users} color="bg-violet-500" />
              <DistributionRow label="Administrators" count={overview.admin_count} total={overview.total_users} color="bg-emerald-500" />
            </div>
          </Card>

          <section className="card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Activity size={18} strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">Keep service moving</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              There {overview.pending_requests === 1 ? 'is' : 'are'} {overview.pending_requests} request
              {overview.pending_requests === 1 ? '' : 's'} waiting for review.
            </p>
            <button type="button" onClick={onOpenRequests} className="btn btn-soft btn-sm mt-4">
              Review requests
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

function DistributionRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {count} <span className="font-normal text-slate-400">({percent}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

/* ----------------------------- User management ---------------------------- */

type UserManagementProps = {
  users: PortalUser[]
  user: PortalUser
  search: string
  roleFilter: string
  showCreateForm: boolean
  newUser: NewUser
  busy: boolean
  onSearch: (value: string) => void
  onRoleFilter: (value: string) => void
  onToggleCreate: () => void
  onNewUserChange: (user: NewUser) => void
  onCreate: (event: React.FormEvent<HTMLFormElement>) => void
  onDraftChange: (user: PortalUser) => void
  onSave: (user: PortalUser) => void
  onDelete: (user: PortalUser) => void
}

function UserManagement({
  users,
  user,
  search,
  roleFilter,
  showCreateForm,
  newUser,
  busy,
  onSearch,
  onRoleFilter,
  onToggleCreate,
  onNewUserChange,
  onCreate,
  onDraftChange,
  onSave,
  onDelete,
}: UserManagementProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People and access"
        title="User management"
        description="Create accounts, update profile details, and assign portal roles."
        action={
          <button type="button" onClick={onToggleCreate} className="btn btn-primary">
            <Plus size={16} />
            Add user
          </button>
        }
      />

      {showCreateForm && (
        <Card
          title="Create user account"
          action={
            <button type="button" aria-label="Close create form" onClick={onToggleCreate} className="text-slate-400 transition hover:text-slate-700">
              ✕
            </button>
          }
        >
          <form onSubmit={onCreate} className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="field-label">
              Full name
              <input required className="input mt-1.5" value={newUser.name} onChange={(event) => onNewUserChange({ ...newUser, name: event.target.value })} />
            </label>
            <label className="field-label">
              Email address
              <input required type="email" className="input mt-1.5" value={newUser.email} onChange={(event) => onNewUserChange({ ...newUser, email: event.target.value })} />
            </label>
            <label className="field-label">
              Temporary password
              <input required minLength={8} type="password" className="input mt-1.5" value={newUser.password} onChange={(event) => onNewUserChange({ ...newUser, password: event.target.value })} />
            </label>
            <label className="field-label">
              Role
              <select className="input mt-1.5" value={newUser.role} onChange={(event) => onNewUserChange({ ...newUser, role: event.target.value as Role })}>
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={onToggleCreate} className="btn btn-secondary">Cancel</button>
              <button disabled={busy} type="submit" className="btn btn-primary">{busy ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Portal accounts (${users.length})`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search users"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search name or email…"
              className="input pl-9"
            />
          </label>
          <select aria-label="Filter users by role" value={roleFilter} onChange={(event) => onRoleFilter(event.target.value)} className="input sm:w-44">
            <option value="all">All roles</option>
            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>

        {users.length === 0 ? (
          <EmptyState title="No matching accounts" hint="Try a different search or role filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="table-td">
                      <input
                        aria-label={`Name for ${item.email}`}
                        className="input min-w-40"
                        value={item.name}
                        onChange={(event) => onDraftChange({ ...item, name: event.target.value })}
                      />
                    </td>
                    <td className="table-td">
                      <input
                        aria-label={`Email for ${item.name}`}
                        className="input min-w-52"
                        type="email"
                        value={item.email}
                        onChange={(event) => onDraftChange({ ...item, email: event.target.value })}
                      />
                    </td>
                    <td className="table-td">
                      <select
                        aria-label={`Role for ${item.name}`}
                        className="input min-w-32 capitalize"
                        value={item.role}
                        onChange={(event) => onDraftChange({ ...item, role: event.target.value as Role })}
                      >
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="table-td">
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={busy} onClick={() => onSave(item)} className="btn btn-soft btn-sm">
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={busy || item.id === user.id}
                          title={item.id === user.id ? 'You cannot delete your own account' : 'Delete user'}
                          onClick={() => onDelete(item)}
                          className="btn btn-danger-soft btn-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} />
        Your own administrator account cannot be deleted or demoted.
      </p>
    </div>
  )
}

/* ------------------------------ Request queue ----------------------------- */

function RequestsPage({ requests, search, statusFilter, onSearch, onStatusFilter }: {
  requests: DocumentRequest[]
  search: string
  statusFilter: string
  onSearch: (value: string) => void
  onStatusFilter: (value: string) => void
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resident services"
        title="Document requests"
        description="Search and filter requests submitted by residents."
      />

      <Card title={`All requests (${requests.length})`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search requests"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search tracking number, resident, document…"
              className="input pl-9"
            />
          </label>
          <select
            aria-label="Filter requests by status"
            className="input sm:w-48"
            value={statusFilter}
            onChange={(event) => onStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {requestStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <RequestTable requests={requests} />
      </Card>
    </div>
  )
}

/* --------------------------------- Reports -------------------------------- */

function ReportsPage({ reports, maxStatus, maxMonth }: { reports: ReportsData; maxStatus: number; maxMonth: number }) {
  const completed = reports.requests_by_status.find((item) => item.status === 'completed')?.total ?? 0
  const awaitingReview = reports.requests_by_status
    .filter((item) => ['pending', 'under_review'].includes(item.status))
    .reduce((total, item) => total + item.total, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service performance"
        title="Reports & insights"
        description="Live summaries generated from document request records."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Requests by status" padded>
          <div className="space-y-4">
            {reports.requests_by_status.map((item) => (
              <div key={item.status}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium capitalize text-slate-600">{item.status.replaceAll('_', ' ')}</span>
                  <span className="font-semibold text-slate-800">{item.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.max(item.total > 0 ? 5 : 0, (item.total / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Monthly requests" subtitle="Last 6 months" padded>
          <div className="flex h-60 items-end justify-around gap-3 pt-6">
            {reports.monthly_requests.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-600">{item.total}</span>
                <div className="flex h-[75%] w-full items-end justify-center">
                  <div
                    title={`${item.total} requests`}
                    className="w-5/12 min-w-4 rounded-t-md bg-blue-500/90 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(item.total > 0 ? 7 : 0, (item.total / maxMonth) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Total requests" value={reports.total_requests} icon={FileText} />
        <SummaryTile label="Completed" value={completed} icon={FileCheck2} />
        <SummaryTile label="Awaiting review" value={awaitingReview} icon={FileClock} />
      </div>
    </div>
  )
}

function SummaryTile({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

/* ------------------------------ Notifications ----------------------------- */

function NotificationsPage({ notifications }: { notifications: PortalNotification[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stay informed"
        title="Notifications"
        description="Pending and in-review document requests appear here."
      />

      <Card title={`Recent activity (${notifications.length})`}>
        {notifications.length === 0 ? (
          <EmptyState title="You're all caught up" hint="New request activity will appear here." />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <article key={notification.id} className="flex gap-4 px-5 py-4">
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${
                  notification.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Bell size={17} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                    <StatusBadge status={notification.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Request #{notification.id} · {formatDate(notification.created_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* --------------------------------- Profile -------------------------------- */

function ProfilePage({ user, onLogout }: { user: PortalUser; onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account settings"
        title="My profile"
        description="Your signed-in portal identity and role."
      />

      <section className="card max-w-3xl overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-6">
          <span className="grid size-14 place-items-center rounded-xl bg-blue-600 text-xl font-semibold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
            <p className="mt-0.5 text-sm capitalize text-blue-600">{user.role} account</p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <ProfileValue label="Full name" value={user.name} />
          <ProfileValue label="Email address" value={user.email} />
          <ProfileValue label="Account ID" value={`#${user.id}`} />
          <ProfileValue label="Access level" value={user.role} capitalize />
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onLogout} className="btn btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50">
            Sign out of portal
          </button>
        </div>
      </section>
    </div>
  )
}

function ProfileValue({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-medium text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}
