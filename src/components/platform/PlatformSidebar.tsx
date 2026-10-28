import { NavLink } from 'react-router-dom'
import { BadgeCheck, Building2, LogOut, X } from 'lucide-react'
import { useSession } from '../../shared/session-context'

type PlatformSidebarProps = {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export default function PlatformSidebar({ isOpen, onClose, onLogout }: PlatformSidebarProps) {
  const { session } = useSession()

  return (
    <>
      <button
        type="button"
        aria-label="Close platform navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        id="platform-navigation"
        aria-label="Platform administration navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-200 ease-out lg:z-30 lg:h-dvh lg:w-[17rem] lg:translate-x-0 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-3 px-5 py-5 lg:px-6 lg:py-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            <Building2 size={20} strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">Barangay Portal</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">Platform administration</p>
          </div>
          <button
            type="button"
            aria-label="Close platform navigation"
            onClick={onClose}
            className="ml-auto grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mx-4 mb-4 hidden rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3 lg:block">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Workspace</p>
          <p className="mt-1 text-sm font-medium text-slate-200">Platform control</p>
        </div>

        <nav aria-label="Platform navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 lg:px-4">
          <p className="hidden px-3 pt-2 pb-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase lg:block">Manage workspaces</p>
          <NavLink
            to="/platform/barangays"
            onClick={onClose}
            className={({ isActive }) => `group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition lg:w-full ${isActive ? 'bg-blue-500/15 text-blue-100 ring-1 ring-inset ring-blue-400/20' : 'text-slate-400 hover:bg-white/[0.055] hover:text-slate-100'}`}
          >
            <BadgeCheck size={17} strokeWidth={1.8} className="shrink-0 opacity-90" />
            <span className="truncate">Barangay onboarding</span>
          </NavLink>
        </nav>

        <div className="hidden px-5 pb-4 lg:block">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2.5">
            <span className="relative grid size-2 place-items-center"><span className="absolute size-2 animate-ping rounded-full bg-emerald-400 opacity-30" /><span className="relative size-1.5 rounded-full bg-emerald-400" /></span>
            <span className="text-xs font-medium text-emerald-200">Platform services online</span>
          </div>
        </div>

        <div className="border-t border-slate-800/80 p-3 lg:p-4">
          <div className="mb-2 truncate px-3 text-[11px] text-slate-500" title={session.user.email}>{session.user.name}</div>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.055] hover:text-white">
            <LogOut size={17} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
