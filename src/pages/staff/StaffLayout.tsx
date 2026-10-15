import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import StaffSidebar from '../../components/staff/StaffSidebar'
import { useSession } from '../../shared/session-context'

export default function StaffLayout() {
  const { session, onLogout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8f7] lg:flex">
      <StaffSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
      />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-teal-950/10 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={menuOpen ? 'Close staff navigation' : 'Open staff navigation'}
                aria-controls="staff-navigation"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-teal-900/10 bg-white text-teal-800 shadow-sm transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 lg:hidden"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-teal-700 uppercase">Staff workspace</p>
                <p className="truncate text-sm font-semibold text-slate-900">{session.user.name}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-teal-800 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" /> Service desk
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 sm:py-9 lg:px-9">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
