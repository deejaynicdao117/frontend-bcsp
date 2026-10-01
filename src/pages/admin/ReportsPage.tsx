import { useEffect, useState } from 'react'
import { FileCheck2, FileClock, FileText } from 'lucide-react'
import { Alert, Card, PageHeader, Spinner } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DataResponse, ReportsData } from '../../shared/types'

const blankReports: ReportsData = { requests_by_status: [], monthly_requests: [], total_requests: 0 }

export default function ReportsPage() {
  const { session } = useSession()
  const [reports, setReports] = useState<ReportsData>(blankReports)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<DataResponse<ReportsData>>('/admin/reports', { token: session.token })
      .then((result) => { if (active) setReports(result.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load reports.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session.token])

  if (loading) return <Spinner label="Loading reports…" />
  if (error) return <Alert tone="error">{error}</Alert>

  const maxStatus = Math.max(1, ...reports.requests_by_status.map((item) => item.total))
  const maxMonth = Math.max(1, ...reports.monthly_requests.map((item) => item.total))
  const completed = reports.requests_by_status.find((item) => item.status === 'completed')?.total ?? 0
  const awaitingReview = reports.requests_by_status
    .filter((item) => ['pending', 'under_review'].includes(item.status))
    .reduce((total, item) => total + item.total, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service performance"
        title="Reports & insights"
        description="Live summaries generated from document request records."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Requests by status" padded>
          <div className="space-y-4">
            {reports.requests_by_status.map((item) => (
              <div key={item.status}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium capitalize text-slate-600">{item.status.replaceAll('_', ' ')}</span>
                  <span className="font-semibold text-slate-800">{item.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.max(item.total > 0 ? 5 : 0, (item.total / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Monthly requests" subtitle="Last 6 months" padded>
          <div className="flex h-60 items-end justify-around gap-3 pt-6">
            {reports.monthly_requests.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-600">{item.total}</span>
                <div className="flex h-[75%] w-full items-end justify-center">
                  <div
                    title={`${item.total} requests`}
                    className="w-5/12 min-w-4 rounded-t-md bg-blue-500/90 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(item.total > 0 ? 7 : 0, (item.total / maxMonth) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Total requests" value={reports.total_requests} icon={FileText} />
        <SummaryTile label="Completed" value={completed} icon={FileCheck2} />
        <SummaryTile label="Awaiting review" value={awaitingReview} icon={FileClock} />
      </div>
    </div>
  )
}

function SummaryTile({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}
