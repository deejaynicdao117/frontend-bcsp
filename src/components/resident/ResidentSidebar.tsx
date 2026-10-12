import { NavLink } from 'react-router-dom'
import {
  Bell,
  Building2,
  FileText,
  LogOut,
  MapPinned,
  Phone,
  ShieldCheck,
  Siren,
  User,
  X,
} from 'lucide-react'

type ResidentSidebarProps = {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

const navigation = [
  { to: '/resident', end: true, label: 'Document requests', description: 'Track your submissions', icon: FileText },
  { to: '/resident/profile', label: 'Profile', description: 'Household and identity details', icon: User },
  { to: '/resident/complaints', label: 'Complaints', description: 'Report community issues', icon: ShieldCheck },
  { to: '/resident/assistance', label: 'Disaster assistance', description: 'Request help during emergencies', icon: Siren },
  { to: '/resident/announcements', label: 'Announcements', description: 'Barangay updates', icon: Bell },
  { to: '/resident/emergency-contacts', label: 'Emergency contacts', description: 'Important hotlines', icon: Phone },
  { to: '/resident/evacuation-centers', label: 'Evacuation centers', description: 'Shelter and readiness info', icon: MapPinned },
]

export default function ResidentSidebar({ isOpen, onClose, onLogout }: ResidentSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close resident navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="resident-navigation"
        aria-label="Resident pages"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-950/15 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-[17rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 lg:px-6 lg:py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-sm shadow-blue-800/20">
            <Building2 size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">Barangay Portal</p>
            <p className="mt-0.5 text-[11px] font-medium text-blue-700">Resident workspace</p>
          </div>
          <button
            type="button"
            aria-label="Close resident navigation"
            onClick={onClose}
            className="ml-auto grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mx-4 my-4 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-blue-700/80 uppercase">Resident services</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Community access</p>
        </div>

        <nav aria-label="Resident navigation links" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 lg:px-4">
          <p className="px-3 pt-1 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Workspace
          </p>
          {navigation.map(({ to, end, label, description, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `group flex items-start gap-3 rounded-xl px-3 py-3 transition ${
                isActive ? 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-200/80' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">{description}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 lg:p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
