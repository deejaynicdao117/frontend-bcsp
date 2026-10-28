import { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import ResidentSidebar from '../../components/resident/ResidentSidebar'
import { useSession } from '../../shared/session-context'

export default function ResidentLayout() {
  const { session, onLogout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f6fb] lg:pl-68">
      <ResidentSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={onLogout} />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={menuOpen ? 'Close resident navigation' : 'Open resident navigation'}
                aria-controls="resident-navigation"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {session.user.barangay?.logo_url && <img src={session.user.barangay.logo_url} alt="" className="size-7 rounded-md bg-white object-contain" />}
                  <div className="min-w-0"><p style={{ color: session.user.barangay?.primary_color ?? '#1d4ed8' }} className="truncate text-[10px] font-semibold tracking-[0.16em] uppercase">{session.user.barangay?.name ?? 'Resident portal'}</p>
                <p className="truncate text-sm font-semibold text-slate-900">Welcome, {session.user.name}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
              <span className="hidden sm:inline">Community access</span>
              <Bell size={15} className="ml-1 text-emerald-700 sm:hidden" />
            </div>
          </div>
        </header>

        <div className="resident-theme mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
