import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Activity, FileClock, FileText, ShieldCheck, Sparkles, Users } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import RequestTable from '../../components/admin/RequestTable'
import { Alert, Card, Spinner } from '../../components/ui'
import { getAdminDashboard, getAdminDocumentRequests } from '../../shared/api'

export default function OverviewPage() {
  const overviewQuery = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const [overviewResult, requestsResult] = await Promise.all([
        getAdminDashboard(),
        getAdminDocumentRequests(),
      ])

      return {
        overview: overviewResult.data,
        requests: requestsResult.data.slice(0, 6),
      }
    },
  })

  if (overviewQuery.isPending) return <Spinner label="Loading live portal data…" />
  if (overviewQuery.error) {
    const message = overviewQuery.error instanceof Error
      ? overviewQuery.error.message
      : 'Unable to load the admin dashboard.'

    return <Alert tone="error">{message}</Alert>
  }

  const { overview, requests } = overviewQuery.data

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-medium text-blue-100">
              <Sparkles size={13} /> Administration overview
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Your community at a glance</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100 sm:text-base">A live summary of resident activity, service demand, and the work that needs attention.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/10 px-3.5 py-2.5 text-xs font-medium text-emerald-100">
            <span className="relative grid size-2 place-items-center"><span className="absolute size-2 animate-ping rounded-full bg-emerald-300 opacity-30" /><span className="relative size-1.5 rounded-full bg-emerald-300" /></span>
            All services operational
          </span>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-blue-100">
          <span>{overview.total_users.toLocaleString()} registered accounts</span>
          <span>{overview.pending_requests.toLocaleString()} requests need review</span>
          <span>{overview.requests_this_month.toLocaleString()} submissions this month</span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={overview.total_users}
          note={`${overview.resident_count} residents registered`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Document requests"
          value={overview.total_requests}
          note={`${overview.requests_this_month} submitted this month`}
          icon={FileText}
          accent="violet"
        />
        <StatCard
          label="Pending review"
          value={overview.pending_requests}
          note="Requests awaiting staff action"
          icon={FileClock}
          accent="amber"
        />
        <StatCard
          label="Staff accounts"
          value={overview.staff_count}
          note={`${overview.admin_count} administrator accounts`}
          icon={ShieldCheck}
          accent="emerald"
        />
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
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

function DistributionRow({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: string
}) {
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
