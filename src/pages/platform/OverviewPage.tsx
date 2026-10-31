import { useQuery } from '@tanstack/react-query'
import { BellRing, Building2, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, MetricCard, Spinner } from '../../components/ui'
import { Alert } from '../../components/ui'
import { getPlatformDashboard } from '../../shared/api'

export default function OverviewPage() {
  const dashboardQuery = useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: async () => {
      const result = await getPlatformDashboard()
      return result.data
    },
  })

  if (dashboardQuery.isPending) return <Spinner label="Loading platform dashboard…" />
  if (dashboardQuery.error) {
    const message = dashboardQuery.error instanceof Error
      ? dashboardQuery.error.message
      : 'Unable to load the platform dashboard.'

    return <Alert tone="error">{message}</Alert>
  }

  const dashboard = dashboardQuery.data

  return (
    <div className="space-y-6">
      <header className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-blue-700 to-slate-900 p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-100 uppercase">Platform overview</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Super admin control center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Monitor barangay readiness, resident access, and operational health across the entire portal.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3.5 py-2 text-xs font-medium text-blue-50">
            <span className="relative grid size-2 place-items-center"><span className="absolute size-2 animate-ping rounded-full bg-emerald-300 opacity-40" /><span className="relative size-1.5 rounded-full bg-emerald-300" /></span>
            All services online
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active barangays" value={dashboard.active_barangays} icon={Building2} />
        <MetricCard label="Total barangays" value={dashboard.total_barangays} icon={ClipboardCheck} />
        <MetricCard label="Portal users" value={dashboard.total_users} icon={ShieldCheck} />
        <MetricCard label="Open actions" value={dashboard.pending_onboarding + dashboard.pending_requests} icon={BellRing} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card title="Platform totals" subtitle="Live records across every barangay workspace" padded>
          <div className="divide-y divide-slate-100">
            <SummaryRow label="Resident accounts" value={dashboard.resident_count} />
            <SummaryRow label="Document requests" value={dashboard.total_requests} />
            <SummaryRow label="Requests submitted this month" value={dashboard.requests_this_month} />
            <SummaryRow label="Requests awaiting action" value={dashboard.pending_requests} />
          </div>
        </Card>

        <Card title="Priority actions" subtitle="Items that currently need platform review" padded>
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">{dashboard.pending_onboarding} barangay onboarding requests</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">Review pending workspaces and approve access when verified.</p>
              <Link to="/platform/barangays" className="mt-3 inline-flex text-xs font-semibold text-amber-900 underline underline-offset-2">Review barangays</Link>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">{dashboard.pending_requests} document requests awaiting action</p>
              <p className="mt-1 text-xs leading-5 text-blue-800">These counts include pending and under-review requests across workspaces.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-slate-800">{value.toLocaleString()}</span>
    </div>
  )
}
