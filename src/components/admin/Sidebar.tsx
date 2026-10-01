import { NavLink } from 'react-router-dom'
import {
  Bell,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  PieChart,
  Users,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type SidebarProps = {
  onLogout: () => void
  notificationCount: number
}

const navigation: Array<{ to: string; end?: boolean; label: string; icon: LucideIcon }> = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User management', icon: Users },
  { to: '/admin/requests', label: 'Document requests', icon: FileText },
  { to: '/admin/community', label: 'Community & safety', icon: HeartHandshake },
  { to: '/admin/reports', label: 'Reports', icon: PieChart },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
]

export default function Sidebar({ onLogout, notificationCount }: SidebarProps) {
  return (
    <aside className="flex shrink-0 flex-col bg-slate-950 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">B</span>
        <div>
          <p className="text-sm font-semibold text-white">Barangay Portal</p>
          <p className="text-xs text-slate-400">Admin workspace</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible">
        <p className="hidden px-3 pt-2 pb-2.5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase lg:block">
          Workspace
        </p>
        {navigation.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
              isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span className="truncate">{label}</span>
            {to === '/admin/notifications' && notificationCount > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
