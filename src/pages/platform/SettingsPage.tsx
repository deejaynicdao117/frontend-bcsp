import { Save, Settings2 } from 'lucide-react'
import { Card } from '../../components/ui'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">System</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Portal settings</h1>
        </div>
        <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
          <Settings2 size={20} />
        </span>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="General branding" subtitle="Customize the public portal experience" padded>
          <form className="grid gap-4">
            <label className="field-label">
              Portal name
              <input className="input mt-1.5" defaultValue="Barangay Citizen Services Portal" />
            </label>
            <label className="field-label">
              Support email
              <input type="email" className="input mt-1.5" defaultValue="support@barangayportal.gov" />
            </label>
            <label className="field-label">
              Primary brand color
              <input type="color" defaultValue="#2563eb" className="input mt-1.5 h-11 p-1.5" />
            </label>
            <label className="field-label">
              Default welcome message
              <textarea className="input mt-1.5 min-h-24" defaultValue="Your local services, organized and accessible to every resident." />
            </label>
          </form>
        </Card>

        <Card title="Access controls" subtitle="Set default platform behavior" padded>
          <div className="space-y-4">
            <ToggleRow label="Allow new registrations" enabled />
            <ToggleRow label="Enable emergency notices" enabled />
            <ToggleRow label="Submit public announcement alerts" />
            <ToggleRow label="Require email verification on onboarding" enabled />
          </div>
          <button type="button" className="btn btn-primary mt-5 w-full sm:w-auto">
            <Save size={15} />
            Save changes
          </button>
        </Card>
      </div>
    </div>
  )
}

function ToggleRow({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        aria-label={label}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
