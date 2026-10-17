import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Menu } from 'lucide-react'
import Sidebar from '../../components/admin/Sidebar'
import { Alert } from '../../components/ui'
import { getAdminNotifications } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { PortalNotification } from '../../shared/types'

const pageMeta = [
  {
    path: '/admin',
    end: true,
    title: 'Overview',
    description: 'A clear view of your barangay services and activity.',
  },
  {
    path: '/admin/users',
    title: 'User management',
    description: 'Manage portal accounts, roles, and access.',
  },
  {
    path: '/admin/requests',
    title: 'Document requests',
    description: 'Track resident requests and their current status.',
  },
  {
    path: '/admin/document-types',
    title: 'Document types',
    description: 'Manage the documents residents can request.',
  },
  {
    path: '/admin/community',
    title: 'Community & safety',
    description: 'Manage households, incidents, emergencies, and public information.',
  },
  {
    path: '/admin/reports',
    title: 'Reports & insights',
    description: 'Review service demand and request outcomes.',
  },
  {
    path: '/admin/notifications',
    title: 'Notifications',
    description: 'Recent request activity that may need attention.',
  },
  {
    path: '/admin/profile',
    title: 'My profile',
    description: 'Your administrator account information.',
  },
]

export default function AdminLayout() {
  const { session, onLogout } = useSession()
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [notice, setNotice] = useState('')
  const [navigationOpen, setNavigationOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let active = true

    getAdminNotifications()
      .then((result) => {
        if (active) setNotifications(result.data)
      })
      .catch((loadError: unknown) => {
        if (active) setNotice(loadError instanceof Error ? loadError.message : 'Unable to load notifications.')
      })

    return () => {
      active = false
    }
  }, [session.token])

  const meta = pageMeta.find((item) => (
    item.end
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  )) ?? pageMeta[0]

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 lg:pl-[17rem]">
      <Sidebar
        onLogout={onLogout}
        notificationCount={notifications.length}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
      />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-controls="admin-navigation"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
              <span>Administration</span>
              <span className="text-slate-300">/</span>
              <span className="truncate text-blue-700">{meta.title}</span>
            </div>
            <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">{meta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              aria-label="Open notifications"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={18} strokeWidth={1.9} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <span className="hidden h-6 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-2 text-left"
            >
              <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {session.user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:block">
                <span className="block max-w-36 truncate text-xs font-medium text-slate-800">{session.user.name}</span>
                <span className="block text-[10px] text-slate-500 capitalize">{session.user.role}</span>
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {notice && (
            <Alert tone="error" onDismiss={() => setNotice('')}>{notice}</Alert>
          )}

          <Outlet />

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400">
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
