import { NavLink, Outlet } from 'react-router-dom'
import RoleHeader from '../../components/shared/RoleHeader'
import { useSession } from '../../shared/session-context'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-3 py-3 text-sm font-medium transition ${
    isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
  }`

export default function StaffLayout() {
  const { session, onLogout } = useSession()

  return (
    <main className="min-h-screen">
      <RoleHeader user={session.user} onLogout={onLogout} />

      <nav aria-label="Staff navigation" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl px-4 sm:px-6 lg:px-8">
          <NavLink to="/staff" end className={tabClass}>Document requests</NavLink>
          <NavLink to="/staff/community" className={tabClass}>Community review</NavLink>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  )
}
