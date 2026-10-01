import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Alert, Card, EmptyState, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import { formatDate } from '../../shared/format'
import type { ListResponse, PortalNotification } from '../../shared/types'

export default function NotificationsPage() {
  const { session } = useSession()
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<ListResponse<PortalNotification>>('/admin/notifications', { token: session.token })
      .then((result) => { if (active) setNotifications(result.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load notifications.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session.token])

  if (loading) return <Spinner label="Loading notifications…" />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stay informed"
        title="Notifications"
        description="Pending and in-review document requests appear here."
      />

      <Card title={`Recent activity (${notifications.length})`}>
        {notifications.length === 0 ? (
          <EmptyState title="You're all caught up" hint="New request activity will appear here." />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <article key={notification.id} className="flex gap-4 px-5 py-4">
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${
                  notification.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Bell size={17} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                    <StatusBadge status={notification.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Request #{notification.id} · {formatDate(notification.created_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
