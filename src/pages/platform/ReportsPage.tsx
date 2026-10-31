import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Building2, ClipboardCheck, FileText } from 'lucide-react'
import { Alert, Card, MetricCard, Spinner } from '../../components/ui'
import { getPlatformReports } from '../../shared/api'

export default function ReportsPage() {
  const reportsQuery = useQuery({
    queryKey: ['platform', 'reports'],
    queryFn: async () => (await getPlatformReports()).data,
  })

  if (reportsQuery.isPending) return <Spinner label="Loading platform reports…" />
  if (reportsQuery.error) {
    const message = reportsQuery.error instanceof Error
      ? reportsQuery.error.message
      : 'Unable to load platform reports.'
    return <Alert tone="error">{message}</Alert>
  }

  const reports = reportsQuery.data
  const maxMonth = Math.max(1, ...reports.monthly_requests.map((item) => item.total))
  const maxStatus = Math.max(1, ...reports.requests_by_status.map((item) => item.total))

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Analytics</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Operational reports</h1>
        <p className="mt-2 text-sm text-slate-500">Live totals calculated across all barangay workspaces.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Resident accounts" value={reports.resident_registrations} icon={FileText} />
        <MetricCard label="Residents added this month" value={reports.resident_registrations_this_month} icon={ClipboardCheck} />
        <MetricCard label="Active barangays" value={reports.active_barangays} icon={Building2} />
        <MetricCard label="Pending onboarding" value={reports.pending_onboarding} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card title="Monthly document requests" subtitle="The last 6 months across all workspaces" padded>
          <div className="flex h-56 items-end gap-3">
            {reports.monthly_requests.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-medium text-slate-500">{item.total}</span>
                <div className="w-full rounded-t-2xl bg-linear-to-t from-blue-600 to-indigo-400" style={{ height: `${Math.max(item.total > 0 ? 6 : 0, (item.total / maxMonth) * 100)}%` }} />
                <span className="text-[10px] font-medium text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Document requests by status" subtitle={`${reports.total_requests.toLocaleString()} requests total`} padded>
          <div className="space-y-5">
            {reports.requests_by_status.map((item) => (
              <ReportRow key={item.status} label={item.status.replaceAll('_', ' ')} value={item.total} max={maxStatus} />
            ))}
          </div>
        </Card>
      </div>

      <Card title="Workspace summary" subtitle="Verified and registered platform totals" padded>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryValue label="Total barangays" value={reports.total_barangays} />
          <SummaryValue label="Total document requests" value={reports.total_requests} />
          <SummaryValue label="Requests closed" value={`${reports.closed_request_percent}%`} />
        </div>
      </Card>
    </div>
  )
}

function ReportRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
        <span className="capitalize">{label}</span>
        <span className="font-semibold text-slate-800">{value.toLocaleString()}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

function SummaryValue({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}
