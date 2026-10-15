import { PageHeader } from '../../components/ui'
import { useSession } from '../../shared/session-context'

export default function ProfilePage() {
  const { session, onLogout } = useSession()
  const user = session.user

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account settings"
        title="My profile"
        description="Your signed-in portal identity and role."
      />

      <section className="card max-w-3xl overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-6">
          <span className="grid size-14 place-items-center rounded-xl bg-blue-600 text-xl font-semibold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
            <p className="mt-0.5 text-sm capitalize text-blue-600">{user.role} account</p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <ProfileValue label="Full name" value={user.name} />
          <ProfileValue label="Email address" value={user.email} />
          <ProfileValue label="Account ID" value={`#${user.id}`} />
          <ProfileValue label="Access level" value={user.role} capitalize />
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onLogout} className="btn btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50">
            Sign out of portal
          </button>
        </div>
      </section>
    </div>
  )
}

function ProfileValue({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-medium text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}
