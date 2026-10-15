import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Alert, Card, EmptyState, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { getAdminNotifications } from '../../shared/api'
import { formatDate } from '../../shared/format'

export default function NotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: getAdminNotifications,
  })

  if (notificationsQuery.isPending) return <Spinner label="Loading notifications…" />
  if (notificationsQuery.error) {
    const message = notificationsQuery.error instanceof Error
      ? notificationsQuery.error.message
      : 'Unable to load notifications.'

    return <Alert tone="error">{message}</Alert>
  }

  const notifications = notificationsQuery.data.data

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
