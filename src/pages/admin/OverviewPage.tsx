import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, FileClock, FileText, ShieldCheck, Users } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import RequestTable from '../../components/admin/RequestTable'
import { Alert, Card, PageHeader, Spinner } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DashboardOverview, DataResponse, DocumentRequest, ListResponse } from '../../shared/types'

const blankOverview: DashboardOverview = {
  total_users: 0,
  admin_count: 0,
  staff_count: 0,
  resident_count: 0,
  total_requests: 0,
  pending_requests: 0,
  requests_this_month: 0,
  recent_requests: [],
}

export default function OverviewPage() {
  const { session } = useSession()
  const [overview, setOverview] = useState(blankOverview)
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      apiRequest<DataResponse<DashboardOverview>>('/admin/dashboard', { token: session.token }),
      apiRequest<ListResponse<DocumentRequest>>('/admin/document-requests', { token: session.token }),
    ])
      .then(([overviewResult, requestsResult]) => {
        if (!active) return
        setOverview(overviewResult.data)
        setRequests(requestsResult.data.slice(0, 6))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load the admin dashboard.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session.token])

  if (loading) return <Spinner label="Loading live portal data…" />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Good day, administrator"
        title="Your community at a glance"
        description="Here is what is happening across your portal today."
        action={
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-200/80">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            System operational
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={overview.total_users} note={`${overview.resident_count} residents registered`} icon={Users} accent="blue" />
        <StatCard label="Document requests" value={overview.total_requests} note={`${overview.requests_this_month} submitted this month`} icon={FileText} accent="violet" />
        <StatCard label="Pending review" value={overview.pending_requests} note="Requests awaiting staff action" icon={FileClock} accent="amber" />
        <StatCard label="Staff accounts" value={overview.staff_count} note={`${overview.admin_count} administrator accounts`} icon={ShieldCheck} accent="emerald" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.5fr_1fr]">
        <Card
          title="Recent document requests"
          action={
            <Link to="/admin/requests" className="text-xs font-semibold text-blue-600 transition hover:text-blue-800">
              View all →
            </Link>
          }
        >
          <RequestTable requests={requests} />
        </Card>

        <div className="space-y-6">
          <Card
            title="User distribution"
            action={
              <Link to="/admin/users" className="text-xs font-semibold text-blue-600 transition hover:text-blue-800">
                Manage users
              </Link>
            }
            padded
          >
            <div className="space-y-5">
              <DistributionRow label="Residents" count={overview.resident_count} total={overview.total_users} color="bg-blue-500" />
              <DistributionRow label="Staff" count={overview.staff_count} total={overview.total_users} color="bg-violet-500" />
              <DistributionRow label="Administrators" count={overview.admin_count} total={overview.total_users} color="bg-emerald-500" />
            </div>
          </Card>

          <section className="card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Activity size={18} strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">Keep service moving</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              There {overview.pending_requests === 1 ? 'is' : 'are'} {overview.pending_requests} request
              {overview.pending_requests === 1 ? '' : 's'} waiting for review.
            </p>
            <Link to="/admin/requests" className="btn btn-soft btn-sm mt-4">
              Review requests
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

function DistributionRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {count} <span className="font-normal text-slate-400">({percent}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
