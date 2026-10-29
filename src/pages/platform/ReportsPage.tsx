import { AlertTriangle, ArrowUpRight, BarChart3, BriefcaseBusiness, CalendarRange, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { Card } from '../../components/ui'

const reportCards = [
  { label: 'Resident registrations', value: '1,284', change: '+12.4%', tone: 'emerald' },
  { label: 'Barangay onboarding', value: '18', change: '+2 this week', tone: 'blue' },
  { label: 'Pending issues', value: '23', change: '-8 from last week', tone: 'amber' },
  { label: 'Closed requests', value: '96%', change: '+4.2%', tone: 'violet' },
]

const monthlyTrend = [78, 86, 82, 92, 88, 95, 92]

const serviceMatrix = [
  { name: 'Barangay activation', score: 82, color: 'bg-indigo-500' },
  { name: 'Resident access', score: 91, color: 'bg-blue-500' },
  { name: 'Document issuance', score: 87, color: 'bg-emerald-500' },
  { name: 'Emergency response', score: 74, color: 'bg-amber-500' },
]

const recentReports = [
  { title: 'Monthly resident registrations', date: 'Oct 2026', status: 'Complete', detail: '1,284 new records', icon: FileText },
  { title: 'Barangay readiness review', date: 'Oct 2026', status: 'Reviewed', detail: '18 barangays verified', icon: ShieldCheck },
  { title: 'Document processing performance', date: 'Oct 2026', status: 'On track', detail: '96% closed within SLA', icon: BriefcaseBusiness },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Analytics</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Operational reports</h1>
          </div>
          <button type="button" className="btn btn-primary w-full sm:w-auto">
            <CalendarRange size={15} />
            Download report
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => (
          <article key={card.label} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${card.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : card.tone === 'blue' ? 'bg-blue-50 text-blue-700' : card.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>
                {card.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpRight size={14} className={card.tone === 'amber' ? 'text-amber-600' : 'text-emerald-600'} />
              Updated this month
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card title="Monthly performance" subtitle="Platform output over the last 7 reporting periods" padded>
          <div className="flex h-56 items-end gap-3">
            {monthlyTrend.map((value, index) => (
              <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-slate-400">{value}%</span>
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-blue-600 to-indigo-400" style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </Card>

        <Card title="Key service health" subtitle="Current performance scores by core module" padded>
          <div className="space-y-5">
            {serviceMatrix.map((service) => (
              <ReportRow key={service.name} label={service.name} value={service.score} color={service.color} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Latest generated reports" subtitle="Recent high-priority report exports for administrative review" padded>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.title} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <report.icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{report.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{report.date} · {report.detail}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{report.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Alerts & watchlist" subtitle="Items requiring follow-up" padded>
          <div className="space-y-3">
            <WarningItem label="5 barangays awaiting final review" icon={AlertTriangle} tone="amber" />
            <WarningItem label="2 support tickets need escalation" icon={BarChart3} tone="blue" />
            <WarningItem label="1 system update scheduled" icon={CheckCircle2} tone="emerald" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function ReportRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-800">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function WarningItem({ label, icon: Icon, tone }: { label: string; icon: typeof AlertTriangle; tone: 'amber' | 'blue' | 'emerald' }) {
  const toneClasses = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }[tone]

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className={`grid size-9 place-items-center rounded-xl ${toneClasses}`}>
          <Icon size={16} />
        </span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">View</span>
    </div>
  )
}
