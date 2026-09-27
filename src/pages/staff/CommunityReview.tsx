import { useCallback, useEffect, useState } from 'react'
import { Activity, Home, ShieldCheck, Siren } from 'lucide-react'
import { Alert, Card, MetricCard, PageHeader, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'

type Envelope<T> = { data: T }
type Household = { id: number; household_code: string; address: string; purok: string; verification_status: string; head?: { name: string; email: string }; members?: Array<{ id: number; name: string }> }
type ResidentRecord = { user_id: number; verification_status: string; phone: string | null; address: string | null; purok: string | null; user?: { name: string; email: string } }
type Complaint = { id: number; reference_number: string; subject: string; description: string; category: string; priority: string; status: string; ai_recommended_category: string; ai_recommended_priority: string; ai_summary: string; validation_flags: string[]; possible_duplicate: boolean; purok: string | null; final_category?: string | null; final_priority?: string | null; resident?: { name: string; email: string } }
type Assistance = { id: number; reference_number: string; incident_type: string; description: string; location: string; priority: string; status: string; resident?: { name: string } }
type Analytics = { complaints_by_category: Array<{ category: string; total: number }>; complaints_by_purok: Array<{ location: string; total: number }>; average_response_minutes: number; average_resolution_hours: number; complaint_total: number; assistance_total: number }
type Props = { token: string }

type ReviewData = {
  households: Household[]
  residents: ResidentRecord[]
  complaints: Complaint[]
  assistance: Assistance[]
  analytics: Analytics
}

async function fetchReviewData(token: string): Promise<ReviewData> {
  const [householdResult, residentResult, complaintResult, assistanceResult, analyticsResult] = await Promise.all([
    apiRequest<Envelope<Household[]>>('/staff/households', { token }),
    apiRequest<Envelope<ResidentRecord[]>>('/staff/residents', { token }),
    apiRequest<Envelope<Complaint[]>>('/staff/complaints', { token }),
    apiRequest<Envelope<Assistance[]>>('/staff/disaster-assistance', { token }),
    apiRequest<Envelope<Analytics>>('/staff/analytics/community', { token }),
  ])

  return {
    households: householdResult.data,
    residents: residentResult.data,
    complaints: complaintResult.data,
    assistance: assistanceResult.data,
    analytics: analyticsResult.data,
  }
}

const complaintCategories = ['fire_emergency', 'sanitation', 'peace_and_order', 'infrastructure', 'general', 'other']
const complaintStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected']
const priorityOptions = ['low', 'medium', 'high', 'critical']
const assistanceStatuses = ['submitted', 'acknowledged', 'dispatched', 'resolved', 'closed']

export default function CommunityReview({ token }: Props) {
  const [households, setHouseholds] = useState<Household[]>([])
  const [residents, setResidents] = useState<ResidentRecord[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [assistance, setAssistance] = useState<Assistance[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [statuses, setStatuses] = useState<Record<number, string>>({})
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [priorities, setPriorities] = useState<Record<number, string>>({})
  const [remarks, setRemarks] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const applyReviewData = useCallback((data: ReviewData) => {
    setHouseholds(data.households)
    setResidents(data.residents)
    setComplaints(data.complaints)
    setAssistance(data.assistance)
    setAnalytics(data.analytics)
  }, [])

  async function load() {
    applyReviewData(await fetchReviewData(token))
  }

  useEffect(() => {
    let active = true
    fetchReviewData(token)
      .then((data) => { if (active) applyReviewData(data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load community review data.')
      })
    return () => { active = false }
  }, [applyReviewData, token])

  async function update(path: string, body: object, successText: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiRequest(path, { token, method: 'PUT', body })
      await load()
      setMessage(successText)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }

  function saveComplaintDecision(complaint: Complaint) {
    void update(
      `/staff/complaints/${complaint.id}`,
      {
        status: statuses[complaint.id] ?? complaint.status,
        final_category: categories[complaint.id] ?? complaint.final_category ?? complaint.ai_recommended_category,
        final_priority: priorities[complaint.id] ?? complaint.final_priority ?? complaint.ai_recommended_priority,
        staff_remarks: remarks[complaint.id] ?? '',
      },
      'Staff decision saved and audit logged.',
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Community operations"
        title="Verification, complaints & emergencies"
        description="Verify residents and households, review AI-assisted complaints, respond to emergencies, and watch local trends."
      />

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Households" value={households.length} icon={Home} />
        <MetricCard label="Residents to verify" value={residents.filter((item) => item.verification_status !== 'verified').length} icon={ShieldCheck} />
        <MetricCard label="Complaints" value={analytics?.complaint_total ?? complaints.length} icon={Activity} />
        <MetricCard label="Emergency requests" value={analytics?.assistance_total ?? assistance.length} icon={Siren} />
      </div>

      {/* ----------------------- Resident verification ----------------------- */}
      <Card title="Resident registration verification">
        {residents.length === 0 ? (
          <EmptyRow text="No resident profiles submitted." />
        ) : (
          <div className="divide-y divide-slate-100">
            {residents.map((record) => (
              <div key={record.user_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {record.user?.name} <span className="font-normal text-slate-500">· {record.user?.email}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.phone || 'No phone'} · {record.address || 'No address'} · {record.purok || 'No purok'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={record.verification_status} />
                  <button
                    disabled={busy}
                    onClick={() => void update(`/staff/residents/${record.user_id}/verification`, { status: 'verified' }, 'Resident verified.')}
                    className="btn btn-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Verify
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void update(`/staff/residents/${record.user_id}/verification`, { status: 'rejected' }, 'Resident verification rejected.')}
                    className="btn btn-danger-soft btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* --------------------------- Household records ------------------------ */}
      <Card title="Household records">
        {households.length === 0 ? (
          <EmptyRow text="No household records yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {households.map((household) => (
              <div key={household.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {household.household_code} · {household.head?.name ?? 'Household head pending'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {household.address} · {household.purok} · {household.members?.length ?? 0} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={household.verification_status} />
                  <button
                    disabled={busy}
                    onClick={() => void update(`/staff/households/${household.id}/verification`, { status: 'verified' }, 'Household verified.')}
                    className="btn btn-soft btn-sm"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ------------------------ AI-assisted complaints ---------------------- */}
      <Card title="AI-assisted complaints" subtitle="Staff decision required — AI output is advisory only.">
        {complaints.length === 0 ? (
          <EmptyRow text="No complaints received." />
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <article key={complaint.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {complaint.subject}{' '}
                      <span className="text-xs font-normal text-slate-400">{complaint.reference_number}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {complaint.resident?.name} · {complaint.purok ?? 'Location not provided'} ·{' '}
                      <span className="capitalize">{complaint.status}</span>
                    </p>
                  </div>
                  {complaint.possible_duplicate && (
                    <span className="badge bg-amber-50 text-amber-700 ring-amber-200/80">Possible duplicate</span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">{complaint.description}</p>

                <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3.5 py-3 text-xs leading-5 text-indigo-900">
                  <p>
                    <span className="font-semibold">AI recommendation (not final):</span>{' '}
                    {complaint.ai_recommended_category} · {complaint.ai_recommended_priority}
                  </p>
                  {complaint.ai_summary && <p className="mt-1 text-indigo-700">Summary: {complaint.ai_summary}</p>}
                  <p className="mt-1 text-indigo-600">Engine: local keyword rules · Staff must confirm or override.</p>
                  {complaint.validation_flags?.length > 0 && (
                    <p className="mt-1 text-amber-800">Validation flags: {complaint.validation_flags.join(', ')}</p>
                  )}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <select
                    aria-label="Final category"
                    className="input py-1.5 text-xs"
                    value={categories[complaint.id] ?? complaint.final_category ?? complaint.ai_recommended_category}
                    onChange={(event) => setCategories((value) => ({ ...value, [complaint.id]: event.target.value }))}
                  >
                    {complaintCategories.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>

                  <select
                    aria-label="Final priority"
                    className="input py-1.5 text-xs"
                    value={priorities[complaint.id] ?? complaint.final_priority ?? complaint.ai_recommended_priority}
                    onChange={(event) => setPriorities((value) => ({ ...value, [complaint.id]: event.target.value }))}
                  >
                    {priorityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>

                  <select
                    aria-label="Complaint status"
                    className="input py-1.5 text-xs"
                    value={statuses[complaint.id] ?? complaint.status}
                    onChange={(event) => setStatuses((value) => ({ ...value, [complaint.id]: event.target.value }))}
                  >
                    {complaintStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>

                  <button
                    disabled={busy}
                    onClick={() => saveComplaintDecision(complaint)}
                    className="btn btn-primary btn-sm"
                  >
                    Confirm staff decision
                  </button>

                  <textarea
                    aria-label="Staff remarks"
                    placeholder="Resolution notes"
                    className="input resize-y text-xs sm:col-span-4"
                    value={remarks[complaint.id] ?? ''}
                    onChange={(event) => setRemarks((value) => ({ ...value, [complaint.id]: event.target.value }))}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {/* ------------------------ Disaster assistance ------------------------- */}
      <Card title="Disaster assistance requests">
        {assistance.length === 0 ? (
          <EmptyRow text="No disaster assistance requests." />
        ) : (
          <div className="divide-y divide-slate-100">
            {assistance.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {item.incident_type} · {item.reference_number} <StatusBadge status={item.status} />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.resident?.name} · {item.location} · Priority {item.priority}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Assistance status"
                    className="input py-1.5 text-xs"
                    value={statuses[item.id] ?? item.status}
                    onChange={(event) => setStatuses((value) => ({ ...value, [item.id]: event.target.value }))}
                  >
                    {assistanceStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <button
                    disabled={busy}
                    onClick={() => void update(
                      `/staff/disaster-assistance/${item.id}`,
                      { status: statuses[item.id] ?? item.status },
                      'Assistance request updated.',
                    )}
                    className="btn btn-soft btn-sm"
                  >
                    Update
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {/* ----------------------------- Analytics ----------------------------- */}
      <Card title="Community response analytics">
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Complaints by category</h3>
            {analytics?.complaints_by_category.length ? (
              analytics.complaints_by_category.map((item) => (
                <p key={item.category} className="flex justify-between border-b border-slate-100 py-2 text-xs last:border-0">
                  <span className="capitalize text-slate-600">{item.category.replaceAll('_', ' ')}</span>
                  <strong className="text-slate-800">{item.total}</strong>
                </p>
              ))
            ) : (
              <p className="text-xs text-slate-400">No data yet.</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Complaints by purok</h3>
            {analytics?.complaints_by_purok.length ? (
              analytics.complaints_by_purok.map((item) => (
                <p key={item.location} className="flex justify-between border-b border-slate-100 py-2 text-xs last:border-0">
                  <span className="text-slate-600">{item.location}</span>
                  <strong className="text-slate-800">{item.total}</strong>
                </p>
              ))
            ) : (
              <p className="text-xs text-slate-400">No data yet.</p>
            )}
          </div>

          <div className="flex gap-4 md:col-span-2">
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Average response: <strong className="text-slate-900">{analytics?.average_response_minutes ?? 0} min</strong>
            </p>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Average resolution: <strong className="text-slate-900">{analytics?.average_resolution_hours ?? 0} hours</strong>
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-5 py-8 text-center text-sm text-slate-400">{text}</p>
}
