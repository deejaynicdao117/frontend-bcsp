import { Building2, LogOut } from 'lucide-react'
import type { PortalUser } from '../../shared/types'

type RoleHeaderProps = {
  user: PortalUser
  onLogout: () => void
}

export default function RoleHeader({ user, onLogout }: RoleHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-700/20">
            <Building2 size={18} strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">Barangay Portal</p>
            <p className="text-[11px] font-medium text-slate-500">Citizen services platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-blue-600 capitalize">{user.role} account</p>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-slate-100 to-blue-100 text-sm font-semibold text-blue-800 ring-1 ring-inset ring-blue-200/60">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <button type="button" onClick={onLogout} className="btn btn-secondary btn-sm">
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
