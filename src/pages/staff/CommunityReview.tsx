import { useCallback, useEffect, useState } from 'react'
import { Activity, Check, Home, ShieldCheck, Siren, Sparkles } from 'lucide-react'
import { Alert, Card, StatusBadge } from '../../components/ui'
import { staffCommunityApi } from '../../shared/api'

type Household = {
  id: number
  household_code: string
  address: string
  purok: string
  verification_status: string
  head?: { name: string; email: string }
  members?: Array<{ id: number; name: string }>
}

type ResidentRecord = {
  user_id: number
  verification_status: string
  phone: string | null
  address: string | null
  purok: string | null
  user?: { id?: number; name: string; email: string }
}

type Complaint = {
  id: number
  reference_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  ai_recommended_category: string
  ai_recommended_priority: string
  ai_summary: string
  ai_engine?: string
  validation_flags: string[]
  possible_duplicate: boolean
  purok: string | null
  final_category?: string | null
  final_priority?: string | null
  resident?: { name: string; email: string }
}

type Assistance = {
  id: number
  reference_number: string
  incident_type: string
  description: string
  location: string
  priority: string
  status: string
  resident?: { name: string }
}

type Analytics = {
  complaints_by_category: Array<{ category: string; total: number }>
  complaints_by_purok: Array<{ location: string; total: number }>
  average_response_minutes: number
  average_resolution_hours: number
  complaint_total: number
  assistance_total: number
}

type ReviewData = {
  households: Household[]
  residents: ResidentRecord[]
  complaints: Complaint[]
  assistance: Assistance[]
  analytics: Analytics
}

async function fetchReviewData(): Promise<ReviewData> {
  const [householdResult, residentResult, complaintResult, assistanceResult, analyticsResult] = await Promise.all([
    staffCommunityApi.getHouseholds<Household>(),
    staffCommunityApi.getResidents<ResidentRecord>(),
    staffCommunityApi.getComplaints<Complaint>(),
    staffCommunityApi.getAssistanceRequests<Assistance>(),
    staffCommunityApi.getAnalytics<Analytics>(),
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

export default function CommunityReview() {
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

  const loadErrorMessage = error && !residents.length && !households.length
    ? error
    : ''

  const applyReviewData = useCallback((data: ReviewData) => {
    setHouseholds(data.households)
    setResidents(data.residents)
    setComplaints(data.complaints)
    setAssistance(data.assistance)
    setAnalytics(data.analytics)
  }, [])

  async function load() {
    applyReviewData(await fetchReviewData())
  }

  useEffect(() => {
    let active = true

    fetchReviewData()
      .then((data) => {
        if (active) applyReviewData(data)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load community review data.')
      })

    return () => {
      active = false
    }
  }, [applyReviewData])

  async function update(action: () => Promise<unknown>, successText: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
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
      () => staffCommunityApi.reviewComplaint(complaint.id, {
        status: statuses[complaint.id] ?? complaint.status,
        final_category: categories[complaint.id] ?? complaint.final_category ?? complaint.ai_recommended_category,
        final_priority: priorities[complaint.id] ?? complaint.final_priority ?? complaint.ai_recommended_priority,
        staff_remarks: remarks[complaint.id] ?? '',
      }),
      'Staff decision saved and audit logged.',
    )
  }

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-teal-800 uppercase">
            <Sparkles size={13} /> Community operations
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Community review</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Verify resident and household records, resolve incoming reports, and coordinate emergency requests.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-teal-100 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 shadow-sm">
          <span className="size-2 rounded-full bg-teal-500" />
          Staff review workspace
        </div>
      </div>

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {loadErrorMessage || message || (error ? `Some community data could not be loaded: ${error}` : '')}
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReviewMetric label="Households" value={households.length} icon={Home} tone="teal" />
        <ReviewMetric label="Residents awaiting verification" value={residents.filter((item) => item.verification_status !== 'verified').length} icon={ShieldCheck} tone="amber" />
        <ReviewMetric label="Total complaints" value={analytics?.complaint_total ?? complaints.length} icon={Activity} tone="slate" />
        <ReviewMetric label="Emergency requests" value={analytics?.assistance_total ?? assistance.length} icon={Siren} tone="rose" />
      </div>

      {/* ----------------------- Resident verification ----------------------- */}
      <Card className="border-t-2 border-t-teal-600"
        title="Resident verification"
        subtitle="Review profile details before confirming resident records."
        action={<span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{residents.filter((item) => item.verification_status !== 'verified').length} to review</span>}
      >
        {residents.length === 0 ? (
          <EmptyRow text="No resident profiles submitted." />
        ) : (
          <div className="divide-y divide-slate-100">
            {residents.map((record) => {
              const residentId = record.user?.id ?? record.user_id

              return (
                <div key={residentId ?? record.user_id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-50 to-emerald-100 text-sm font-semibold text-teal-800 ring-1 ring-inset ring-teal-100">
                      {record.user?.name?.slice(0, 1).toUpperCase() ?? 'R'}
                    </span>
                    <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {record.user?.name} <span className="font-normal text-slate-500">· {record.user?.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.phone || 'No phone'} · {record.address || 'No address'} · {record.purok || 'No purok'}
                    </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={record.verification_status} />
                    <button
                      disabled={busy || !residentId}
                      onClick={() => {
                        if (!residentId) {
                          setError('Resident user could not be identified for verification.')
                          return
                        }

                        void update(
                          () => staffCommunityApi.verifyResident(residentId, 'verified'),
                          'Resident verified.',
                        )
                      }}
                      className="btn btn-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Check size={14} /> Verify
                    </button>
                    <button
                      disabled={busy || !residentId}
                      onClick={() => {
                        if (!residentId) {
                          setError('Resident user could not be identified for verification.')
                          return
                        }

                        void update(
                          () => staffCommunityApi.verifyResident(residentId, 'rejected'),
                          'Resident verification rejected.',
                        )
                      }}
                      className="btn btn-danger-soft btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
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
                    onClick={() => void update(
                      () => staffCommunityApi.verifyHousehold(household.id, 'verified'),
                      'Household verified.',
                    )}
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
                  <p className="mt-1 text-indigo-600">Engine: {complaint.ai_engine ?? 'local_keyword_rules_v1'} · Staff must confirm or override.</p>
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
                      () => staffCommunityApi.updateAssistanceRequest(item.id, {
                        status: statuses[item.id] ?? item.status,
                      }),
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

function ReviewMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof Home
  tone: 'teal' | 'amber' | 'slate' | 'rose'
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-800 ring-teal-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
        </div>
        <span className={`grid size-10 place-items-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-5 py-8 text-center text-sm text-slate-400">{text}</p>
}
