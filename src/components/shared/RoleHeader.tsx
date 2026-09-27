import { Building2, LogOut } from 'lucide-react'
import type { PortalUser } from '../../shared/types'

type RoleHeaderProps = {
  user: PortalUser
  onLogout: () => void
}

export default function RoleHeader({ user, onLogout }: RoleHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
            <Building2 size={18} strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Barangay Portal</p>
            <p className="text-xs text-slate-500">Citizen Services</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-blue-600 capitalize">{user.role} account</p>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
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
