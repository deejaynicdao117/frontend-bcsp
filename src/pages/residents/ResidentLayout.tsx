import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import ResidentSidebar from '../../components/resident/ResidentSidebar'
import { useSession } from '../../shared/session-context'

export default function ResidentLayout() {
  const { session, onLogout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 lg:flex">
      <ResidentSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={onLogout} />

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
                <p className="text-[10px] font-semibold tracking-[0.14em] text-blue-700 uppercase">Resident workspace</p>
                <p className="truncate text-sm font-semibold text-slate-900">{session.user.name}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" /> Community access
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
