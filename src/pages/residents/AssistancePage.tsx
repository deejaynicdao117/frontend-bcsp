import { useEffect, useState } from 'react'
import { BellRing, Siren } from 'lucide-react'
import { Alert, Card, StatusBadge } from '../../components/ui'
import ResidentPageHero from '../../components/resident/ResidentPageHero'
import { residentCommunityApi } from '../../shared/api'

type Assistance = {
  id: number
  reference_number: string
  incident_type: string
  description: string
  location: string
  priority: string
  status: string
}

export default function AssistancePage() {
  const [assistance, setAssistance] = useState<Assistance[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ incident_type: '', description: '', location: '', purok: '', priority: 'high' })

  async function loadAssistance() {
    const response = await residentCommunityApi.getAssistanceRequests<Assistance>()
    setAssistance(response.data as Assistance[])
  }

  useEffect(() => {
    let active = true

    const fetchAssistance = async () => {
      try {
        const response = await residentCommunityApi.getAssistanceRequests<Assistance>()
        if (active) setAssistance(response.data as Assistance[])
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load disaster assistance requests.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchAssistance()

    return () => {
      active = false
    }
  }, [])

  async function submitAssistance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')

    try {
      await residentCommunityApi.submitAssistanceRequest(form)
      setForm({ incident_type: '', description: '', location: '', purok: '', priority: 'high' })
      await loadAssistance()
      setFeedback('Emergency assistance request sent to barangay staff.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit emergency request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-7">
      <ResidentPageHero eyebrow="Safety and response" title="Emergency assistance" description="Send a request for barangay support and keep track of response updates. For immediate danger, call emergency services first." icon={Siren} tone="rose" />

      {(error || feedback) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setFeedback('') }}>
          {error || feedback}
        </Alert>
      )}

      <Card title="Request emergency assistance" subtitle="Use this to report urgent situations requiring barangay support." padded>
        <form onSubmit={submitAssistance} className="grid gap-4 md:grid-cols-2">
          <label className="field-label">
            Incident type
            <input
              className="input mt-1.5"
              value={form.incident_type}
              onChange={(event) => setForm({ ...form, incident_type: event.target.value })}
              required
            />
          </label>

          <label className="field-label">
            Priority
            <select
              className="input mt-1.5"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <label className="field-label md:col-span-2">
            Description
            <textarea
              className="input mt-1.5 resize-y"
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>

          <label className="field-label">
            Location
            <input
              className="input mt-1.5"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
            />
          </label>

          <label className="field-label">
            Purok
            <input
              className="input mt-1.5"
              value={form.purok}
              onChange={(event) => setForm({ ...form, purok: event.target.value })}
            />
          </label>

          <div className="md:col-span-2">
            <button type="submit" disabled={busy} className="btn btn-primary py-2.5">
              <BellRing size={16} />
              {busy ? 'Sending…' : 'Send assistance request'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Your requests" subtitle="Track disaster assistance updates from staff." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{assistance.length}</span>}>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading requests…</p>
        ) : assistance.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No assistance requests yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assistance.map((item) => (
              <article key={item.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.incident_type}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.reference_number}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
