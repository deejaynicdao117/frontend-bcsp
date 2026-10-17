import { useEffect, useState } from 'react'
import { Megaphone, Send } from 'lucide-react'
import { Alert, Card, StatusBadge } from '../../components/ui'
import ResidentPageHero from '../../components/resident/ResidentPageHero'
import { residentCommunityApi } from '../../shared/api'

type Complaint = {
  id: number
  reference_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  ai_summary: string
  ai_recommended_category: string
  ai_recommended_priority: string
  validation_flags: string[]
  possible_duplicate: boolean
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ subject: '', description: '', location: '', purok: '' })

  async function loadComplaints() {
    const response = await residentCommunityApi.getComplaints<Complaint>()
    setComplaints(response.data as Complaint[])
  }

  useEffect(() => {
    let active = true

    const fetchComplaints = async () => {
      try {
        const response = await residentCommunityApi.getComplaints<Complaint>()
        if (active) setComplaints(response.data as Complaint[])
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load complaints.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchComplaints()

    return () => {
      active = false
    }
  }, [])

  async function submitComplaint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')

    try {
      await residentCommunityApi.submitComplaint(form)
      setForm({ subject: '', description: '', location: '', purok: '' })
      await loadComplaints()
      setFeedback('Complaint sent. Staff will review it soon.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit complaint.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-7">
      <ResidentPageHero eyebrow="Community voice" title="Complaints and reports" description="Share a concern with the barangay team and follow its review progress from one place." icon={Megaphone} tone="amber" />

      {(error || feedback) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setFeedback('') }}>
          {error || feedback}
        </Alert>
      )}

      <Card title="Write a complaint" subtitle="Your report will be reviewed by staff and may be assigned a category." padded>
        <form onSubmit={submitComplaint} className="grid gap-4 md:grid-cols-2">
          <label className="field-label md:col-span-2">
            Subject
            <input
              className="input mt-1.5"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              required
            />
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
              <Send size={16} />
              {busy ? 'Submitting…' : 'Send complaint'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Recent complaints" subtitle="Track status and staff remarks on your reports." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{complaints.length}</span>}>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading complaints…</p>
        ) : complaints.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No complaints submitted yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <article key={complaint.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{complaint.subject}</p>
                    <p className="mt-1 text-xs text-slate-500">{complaint.reference_number}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{complaint.description}</p>
                {complaint.ai_summary && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <span className="font-semibold">Staff note:</span> {complaint.ai_summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
