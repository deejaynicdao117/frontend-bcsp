import { BellRing, Building2, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Card, MetricCard } from '../../components/ui'

const actions = [
  { title: 'Barangay San Jose', detail: 'Registration access approved and live', status: 'Online' },
  { title: 'Barangay Poblacion', detail: 'Pending onboarding review', status: 'Review' },
  { title: 'Barangay Tibagan', detail: 'Logo and profile updated today', status: 'Updated' },
]

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
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
        <MetricCard label="Active barangays" value={18} icon={Building2} />
        <MetricCard label="Portal users" value={1284} icon={ShieldCheck} />
        <MetricCard label="Open actions" value={23} icon={BellRing} />
        <MetricCard label="Verified requests" value={96} icon={ClipboardCheck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card title="Operational summary" subtitle="Current performance across all barangay workspaces" padded>
          <div className="space-y-5">
            <SummaryRow label="Barangay onboarding" value={82} color="bg-indigo-500" />
            <SummaryRow label="Resident registrations" value={71} color="bg-blue-500" />
            <SummaryRow label="Document processing" value={89} color="bg-emerald-500" />
            <SummaryRow label="Emergency alerts" value={63} color="bg-amber-500" />
          </div>
        </Card>

        <Card title="Priority actions" subtitle="Items that need attention this week" padded>
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{action.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{action.detail}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">{action.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Latest platform activity" subtitle="Recent changes across the barangay portal" padded>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-slate-700">Barangay platform settings</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Healthy</span></td>
                <td className="px-4 py-3 text-slate-500">2 hours ago</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Resident verification queue</td>
                <td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">In review</span></td>
                <td className="px-4 py-3 text-slate-500">5 hours ago</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">New barangay workspace</td>
                <td className="px-4 py-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Pending</span></td>
                <td className="px-4 py-3 text-slate-500">Today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SummaryRow({ label, value, color }: { label: string; value: number; color: string }) {
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
