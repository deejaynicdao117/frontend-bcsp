import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import StaffSidebar from '../../components/staff/StaffSidebar'
import { useSession } from '../../shared/session-context'

const pageMeta = [
  {
    path: '/staff',
    end: true,
    title: 'Request queue',
    description: 'Review incoming resident requests and keep each one moving.',
  },
  {
    path: '/staff/announcements',
    title: 'Announcements',
    description: 'Create and manage barangay announcements for residents.',
  },
  {
    path: '/staff/community',
    title: 'Community review',
    description: 'Review resident and household records, reports, and assistance requests.',
  },
]

export default function StaffLayout() {
  const { session, onLogout } = useSession()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const location = useLocation()

  const meta = pageMeta.find((item) => (
    item.end
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  )) ?? pageMeta[0]

  return (
    <div
      className="barangay-portal min-h-screen w-full overflow-x-hidden bg-slate-50 lg:pl-68"
      style={{ '--barangay-primary': session.user.barangay?.primary_color ?? '#2563eb' } as CSSProperties}
    >
      <StaffSidebar
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        onLogout={onLogout}
      />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label="Open staff navigation"
              aria-controls="staff-navigation"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                {session.user.barangay?.logo_url && <img src={session.user.barangay.logo_url} alt="" className="size-6 rounded bg-white object-contain" />}
                <span className="truncate">{session.user.barangay?.name ?? 'Barangay services'}</span>
              </div>
              <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                <span className="truncate">Staff workspace</span>
                <span className="text-slate-300">/</span>
                <span className="truncate text-blue-700">{meta.title}</span>
              </div>
              <p className="mt-1 hidden truncate text-xs text-slate-500 sm:block">{meta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2 text-left">
              <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {session.user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:block">
                <span className="block max-w-36 truncate text-xs font-medium text-slate-800">{session.user.name}</span>
                <span className="block text-[10px] text-slate-500 capitalize">{session.user.role}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-360 space-y-7 px-3 py-5 sm:px-6 lg:px-9 lg:py-8">
          <div className="min-w-0">
            <Outlet />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400">
            <span>Barangay Citizen Services Portal</span>
            <span>
              Staff workspace · Local time {new Intl.DateTimeFormat('en-PH', { timeStyle: 'short' }).format(new Date())}
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}