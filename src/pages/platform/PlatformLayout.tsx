import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import PlatformSidebar from '../../components/platform/PlatformSidebar'
import { useSession } from '../../shared/session-context'

export default function PlatformLayout() {
  const { session, onLogout } = useSession()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const location = useLocation()
  const pageTitle = location.pathname.startsWith('/platform/barangays') ? 'Barangay onboarding' : 'Platform control'

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 lg:pl-[17rem]">
      <PlatformSidebar isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} onLogout={onLogout} />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open platform navigation"
              aria-controls="platform-navigation"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                <span className="truncate">Barangay services platform</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                <span>Platform administration</span>
                <span className="text-slate-300">/</span>
                <span className="truncate text-blue-700">{pageTitle}</span>
              </div>
              <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">Manage approved barangay workspaces and resident registration access.</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {session.user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-40 truncate text-xs font-medium text-slate-800">{session.user.name}</span>
              <span className="block text-[10px] text-slate-500">Platform administrator</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          <Outlet />
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400">
            <span>Barangay Citizen Services Portal</span>
            <span>Platform administration · Local time {new Intl.DateTimeFormat('en-PH', { timeStyle: 'short' }).format(new Date())}</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
