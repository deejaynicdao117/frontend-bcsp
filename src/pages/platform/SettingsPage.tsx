import { useEffect, useState } from 'react'
import { Save, Settings2 } from 'lucide-react'
import { Alert, Card, Spinner } from '../../components/ui'
import { getPlatformSettings, updatePlatformSettings } from '../../shared/api'
import type { PlatformSettings } from '../../shared/api/admin'

export default function SettingsPage() {
  const [form, setForm] = useState<PlatformSettings | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    getPlatformSettings()
      .then(({ data }) => { if (active) setForm(data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load platform settings.')
      })
    return () => { active = false }
  }, [])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    setSubmitting(true)
    setError('')
    setFeedback('')

    try {
      const { data } = await updatePlatformSettings(form)
      setForm(data)
      setFeedback('Settings saved successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form && !error) return <Spinner label="Loading platform settings…" />
  if (!form) return <Alert tone="error">{error}</Alert>

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

      {(error || feedback) && <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setFeedback('') }}>{error || feedback}</Alert>}
      <form onSubmit={(event) => void handleSave(event)} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="General branding" subtitle="Customize the public portal experience" padded>
          <div className="grid gap-4">
            <label className="field-label">
              Portal name
              <input
                className="input mt-1.5"
                value={form.portal_name}
                onChange={(e) => setForm({ ...form, portal_name: e.target.value })}
              />
            </label>
            <label className="field-label">
              Support email
              <input
                type="email"
                className="input mt-1.5"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              />
            </label>
            <label className="field-label">
              Primary brand color
              <input
                type="color"
                value={form.primary_color}
                className="input mt-1.5 h-11 p-1.5"
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              />
            </label>
            <label className="field-label">
              Default welcome message
              <textarea
                className="input mt-1.5 min-h-24"
                value={form.welcome_message}
                onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
              />
            </label>
          </div>
        </Card>

        <Card title="Access controls" subtitle="Set default platform behavior" padded>
          <div className="space-y-4">
            <ToggleRow
              label="Allow new registrations"
              enabled={form.allow_new_registrations}
              onChange={(val) => setForm({ ...form, allow_new_registrations: val })}
            />
            <ToggleRow
              label="Enable emergency notices"
              enabled={form.emergency_notices}
              onChange={(val) => setForm({ ...form, emergency_notices: val })}
            />
            <ToggleRow
              label="Submit public announcement alerts"
              enabled={form.public_announcements}
              onChange={(val) => setForm({ ...form, public_announcements: val })}
            />
            <ToggleRow
              label="Require email verification on onboarding"
              enabled={form.email_verification}
              onChange={(val) => setForm({ ...form, email_verification: val })}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary mt-5 w-full sm:w-auto"
          >
            <Save size={15} />{submitting ? ' Saving…' : ' Save changes'}
          </button>
        </Card>
      </form>
    </div>
  )
}

function ToggleRow({
  label,
  enabled = false,
  onChange,
}: {
  label: string
  enabled?: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        aria-label={label}
        onClick={() => onChange(!enabled)}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
