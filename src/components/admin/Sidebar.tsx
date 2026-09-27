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

export type DashboardPage = 'dashboard' | 'users' | 'requests' | 'community' | 'reports' | 'notifications' | 'profile'

type SidebarProps = {
  activePage: DashboardPage
  onNavigate: (page: DashboardPage) => void
  onLogout: () => void
  notificationCount: number
}

const navigation: Array<{ id: DashboardPage; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User management', icon: Users },
  { id: 'requests', label: 'Document requests', icon: FileText },
  { id: 'community', label: 'Community & safety', icon: HeartHandshake },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

export default function Sidebar({ activePage, onNavigate, onLogout, notificationCount }: SidebarProps) {
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
        {navigation.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span className="truncate">{label}</span>
              {id === 'notifications' && notificationCount > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              )}
            </button>
          )
        })}
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
