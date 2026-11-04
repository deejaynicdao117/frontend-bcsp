import { NavLink } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  HeartHandshake,
  Megaphone,
  LogOut,
  X,
} from 'lucide-react'
import { useSession } from '../../shared/session-context'

type StaffSidebarProps = {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

const pages = [
  {
    to: '/staff',
    end: true,
    label: 'Request queue',
    description: 'Process document requests',
    icon: ClipboardList,
  },
  {
    to: '/staff/announcements',
    label: 'Announcements',
    description: 'Publish community notices',
    icon: Megaphone,
  },
  {
    to: '/staff/community',
    label: 'Community review',
    description: 'Verification and resident reports',
    icon: HeartHandshake,
  },
]

export default function StaffSidebar({ isOpen, onClose, onLogout }: StaffSidebarProps) {
  const { session } = useSession()

  return (
    <>
      <button
        type="button"
        aria-label="Close staff navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="staff-navigation"
        aria-label="Staff pages"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-200 ease-out lg:fixed lg:inset-y-0 lg:z-30 lg:h-dvh lg:w-68 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 lg:px-6 lg:py-6">
          <span style={{ backgroundColor: session.user.barangay?.primary_color ?? '#2563eb' }} className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl text-white shadow-lg shadow-blue-950/40">
            {session.user.barangay?.logo_url
              ? <img src={session.user.barangay.logo_url} alt="" className="size-full bg-white object-contain" />
              : <Building2 size={19} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">{session.user.barangay?.name ?? 'Barangay Service Desk'}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{session.user.barangay?.municipality ?? 'Staff workspace'}</p>
          </div>
          <button
            type="button"
            aria-label="Close staff navigation"
            onClick={onClose}
            className="ml-auto grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mx-4 mb-4 hidden rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3 lg:block">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Workspace</p>
          <p className="mt-1 text-sm font-medium text-slate-200">Staff services</p>
        </div>

        <nav aria-label="Staff navigation links" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 lg:px-4">
          <p className="hidden px-3 pt-2 pb-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase lg:block">
            Work areas
          </p>
          {pages.map(({ to, end, label, description, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-500/15 text-blue-100 ring-1 ring-inset ring-blue-400/20'
                  : 'text-slate-400 hover:bg-white/5.5 hover:text-slate-100'
              }`}
            >
              <Icon size={17} strokeWidth={1.8} className="shrink-0 opacity-90" />
              <span className="min-w-0">
                <span className="block truncate">{label}</span>
                <span className="sr-only">{description}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden px-5 pb-4 lg:block">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/6 px-3 py-2.5">
            <span className="relative grid size-2 place-items-center">
              <span className="absolute size-2 animate-ping rounded-full bg-emerald-400 opacity-30" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-emerald-200">Staff services online</span>
          </div>
        </div>

        <div className="border-t border-slate-800/80 p-3 lg:p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5.5 hover:text-white"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
