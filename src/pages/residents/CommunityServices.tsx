import { useEffect, useState } from 'react'
import { AlertTriangle, MapPin, Phone } from 'lucide-react'
import { Alert, Card, SectionHeading, Spinner, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import type { PortalUser } from '../../shared/types'

type ResidentCommunityServicesProps = { user: PortalUser; token: string }
type Envelope<T> = { data: T }
type ProfileData = { user: PortalUser & { email_verified_at?: string | null }; profile: Record<string, string | null> | null; households: Array<{ household_code: string; address: string; purok: string; verification_status: string }> }
type Complaint = { id: number; reference_number: string; subject: string; category: string; priority: string; status: string; ai_summary: string; ai_recommended_category: string; ai_recommended_priority: string; validation_flags: string[]; possible_duplicate: boolean }
type Assistance = { id: number; reference_number: string; incident_type: string; description: string; priority: string; status: string; location: string }
type Announcement = { id: number; title: string; body: string; type: string; severity: string; published_at: string | null }
type Contact = { id: number; name: string; office: string | null; phone: string; availability: string }
type Center = { id: number; name: string; address: string; capacity: number | null; current_occupancy: number; status: string }

const profileFields = [
  ['phone', 'Phone number'],
  ['birth_date', 'Birth date'],
  ['sex', 'Sex'],
  ['civil_status', 'Civil status'],
  ['occupation', 'Occupation'],
  ['address', 'Home address'],
  ['purok', 'Purok'],
] as const

export default function CommunityServices({ token }: ResidentCommunityServicesProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [assistance, setAssistance] = useState<Assistance[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [complaintForm, setComplaintForm] = useState({ subject: '', description: '', location: '', purok: '' })
  const [aidForm, setAidForm] = useState({ incident_type: '', description: '', location: '', purok: '', priority: 'high' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  async function reloadResidentData() {
    const [profileResult, complaintResult, aidResult] = await Promise.all([
      apiRequest<Envelope<ProfileData>>('/resident/profile', { token }),
      apiRequest<Envelope<Complaint[]>>('/resident/complaints', { token }),
      apiRequest<Envelope<Assistance[]>>('/resident/disaster-assistance', { token }),
    ])
    setProfile(profileResult.data)
    setComplaints(complaintResult.data)
    setAssistance(aidResult.data)
  }

  useEffect(() => {
    let active = true
    Promise.all([
      apiRequest<Envelope<ProfileData>>('/resident/profile', { token }),
      apiRequest<Envelope<Complaint[]>>('/resident/complaints', { token }),
      apiRequest<Envelope<Assistance[]>>('/resident/disaster-assistance', { token }),
      apiRequest<Envelope<Announcement[]>>('/community/announcements', { token }),
      apiRequest<Envelope<Contact[]>>('/community/emergency-contacts', { token }),
      apiRequest<Envelope<Center[]>>('/community/evacuation-centers', { token }),
    ]).then(([profileResult, complaintResult, aidResult, announcementResult, contactResult, centerResult]) => {
      if (!active) return
      setProfile(profileResult.data)
      setComplaints(complaintResult.data)
      setAssistance(aidResult.data)
      setAnnouncements(announcementResult.data)
      setContacts(contactResult.data)
      setCenters(centerResult.data)
      const savedProfile = profileResult.data.profile
      setComplaintForm((form) => ({ ...form, location: savedProfile?.address ?? '', purok: savedProfile?.purok ?? '' }))
      setAidForm((form) => ({ ...form, location: savedProfile?.address ?? '', purok: savedProfile?.purok ?? '' }))
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load community services.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')
    const form = new FormData(event.currentTarget)
    try {
      await apiRequest('/resident/profile', {
        token,
        method: 'PUT',
        body: {
          phone: String(form.get('phone') ?? ''),
          birth_date: String(form.get('birth_date') ?? '') || null,
          sex: String(form.get('sex') ?? ''),
          civil_status: String(form.get('civil_status') ?? ''),
          occupation: String(form.get('occupation') ?? ''),
          address: String(form.get('address') ?? ''),
          purok: String(form.get('purok') ?? ''),
        },
      })
      await reloadResidentData()
      setFeedback('Profile and household details saved for staff verification.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save profile.')
    } finally {
      setBusy(false)
    }
  }

  async function submitComplaint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await apiRequest('/resident/complaints', { token, method: 'POST', body: complaintForm })
      setComplaintForm({ subject: '', description: '', location: '', purok: '' })
      await reloadResidentData()
      setFeedback('Complaint sent. The category/priority suggestion is advisory; staff will review it.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit complaint.')
    } finally {
      setBusy(false)
    }
  }

  async function submitAssistance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await apiRequest('/resident/disaster-assistance', { token, method: 'POST', body: aidForm })
      setAidForm({
        incident_type: '',
        description: '',
        location: profile?.profile?.address ?? '',
        purok: profile?.profile?.purok ?? '',
        priority: 'high',
      })
      await reloadResidentData()
      setFeedback('Emergency assistance request sent to barangay staff.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit emergency request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Community services"
        description="Profiles, concerns, emergency information, and public updates in one place."
      />

      {(error || feedback) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setFeedback('') }}>
          {error || feedback}
        </Alert>
      )}

      {loading ? (
        <Spinner label="Loading community services…" />
      ) : (
        <>
          {/* -------------------------------- Profile ------------------------------- */}
          <Card
            title="Personal & household profile"
            subtitle="Your details can be reviewed by barangay staff."
            action={
              <span className="badge bg-amber-50 text-amber-700 ring-amber-200/80 capitalize">
                {profile?.profile?.verification_status ?? 'unverified'}
              </span>
            }
            padded
          >
            <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profileFields.map(([key, label]) => (
                <label key={key} className="field-label">
                  {label}
                  <input
                    name={key}
                    type={key === 'birth_date' ? 'date' : 'text'}
                    defaultValue={profile?.profile?.[key] ?? ''}
                    className="input mt-1.5"
                  />
                </label>
              ))}
              <button disabled={busy} className="btn btn-primary self-end sm:col-span-2 lg:col-span-1">
                Save profile
              </button>
            </form>

            {profile?.households?.map((household) => (
              <p key={household.household_code} className="mt-4 text-xs text-slate-500">
                Household {household.household_code} · {household.address} · {household.purok} · {household.verification_status}
              </p>
            ))}

            {profile?.user?.email_verified_at
              ? <p className="mt-3 text-xs text-emerald-700">Email verified</p>
              : <EmailVerification token={token} />}
          </Card>

          {/* --------------------------- Complaint / emergency ----------------------- */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Complaint or feedback" subtitle="The system suggests a category and priority; staff confirm or change them." padded>
              <form onSubmit={submitComplaint} className="space-y-3">
                <input
                  required
                  maxLength={180}
                  placeholder="Short title"
                  className="input"
                  value={complaintForm.subject}
                  onChange={(event) => setComplaintForm({ ...complaintForm, subject: event.target.value })}
                />
                <textarea
                  required
                  minLength={20}
                  maxLength={10000}
                  rows={3}
                  placeholder="Describe the issue (at least 20 characters)"
                  className="input resize-y"
                  value={complaintForm.description}
                  onChange={(event) => setComplaintForm({ ...complaintForm, description: event.target.value })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Location"
                    className="input"
                    value={complaintForm.location}
                    onChange={(event) => setComplaintForm({ ...complaintForm, location: event.target.value })}
                  />
                  <input
                    placeholder="Purok"
                    className="input"
                    value={complaintForm.purok}
                    onChange={(event) => setComplaintForm({ ...complaintForm, purok: event.target.value })}
                  />
                </div>
                <button disabled={busy} className="btn btn-primary">Submit complaint</button>
              </form>
            </Card>

            <Card title="Emergency / disaster assistance" subtitle="For immediate danger, call your emergency contact directly." padded>
              <div className="mb-4 flex gap-3 rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-3">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-600" />
                <p className="text-xs leading-5 text-rose-700">
                  Use this form for evacuation, relief, or rescue help. Life-threatening emergencies: call 911 first.
                </p>
              </div>
              <form onSubmit={submitAssistance} className="space-y-3">
                <input
                  required
                  placeholder="Incident type (e.g. flood, fire)"
                  className="input"
                  value={aidForm.incident_type}
                  onChange={(event) => setAidForm({ ...aidForm, incident_type: event.target.value })}
                />
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  placeholder="What assistance is needed?"
                  className="input resize-y"
                  value={aidForm.description}
                  onChange={(event) => setAidForm({ ...aidForm, description: event.target.value })}
                />
                <input
                  required
                  placeholder="Exact location"
                  className="input"
                  value={aidForm.location}
                  onChange={(event) => setAidForm({ ...aidForm, location: event.target.value })}
                />
                <button disabled={busy} className="btn bg-rose-600 text-white hover:bg-rose-700">Send assistance request</button>
              </form>
            </Card>
          </div>

          {/* ------------------------------ My requests ----------------------------- */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="My complaints">
              {complaints.length ? (
                <div className="divide-y divide-slate-100">
                  {complaints.map((item) => (
                    <article key={item.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.subject}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.reference_number} · Suggested {item.ai_recommended_category} / {item.ai_recommended_priority}
                        {item.possible_duplicate ? ' · Possible duplicate' : ''}
                      </p>
                      {item.ai_summary && <p className="mt-2 text-xs leading-5 text-slate-600">{item.ai_summary}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No complaints submitted.</p>
              )}
            </Card>

            <Card title="Emergency assistance requests">
              {assistance.length ? (
                <div className="divide-y divide-slate-100">
                  {assistance.map((item) => (
                    <article key={item.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.incident_type} · {item.reference_number}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.location} · Priority {item.priority}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No assistance requests submitted.</p>
              )}
            </Card>
          </div>

          {/* --------------------------- Public information -------------------------- */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card title="Public announcements">
              {announcements.length ? (
                <div className="divide-y divide-slate-100">
                  {announcements.map((item) => (
                    <article key={item.id} className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="mt-0.5 text-xs capitalize text-slate-400">{item.severity} · {item.type.replaceAll('_', ' ')}</p>
                      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-600">{item.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No current announcements.</p>
              )}
            </Card>

            <Card title="Emergency contacts">
              {contacts.length ? (
                <div className="divide-y divide-slate-100">
                  {contacts.map((item) => (
                    <article key={item.id} className="flex gap-3 px-5 py-4">
                      <Phone size={16} className="mt-0.5 shrink-0 text-rose-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <a className="text-sm text-blue-600 hover:underline" href={`tel:${item.phone}`}>{item.phone}</a>
                        <p className="mt-0.5 text-xs text-slate-500">{item.office} · {item.availability}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No emergency contacts published.</p>
              )}
            </Card>

            <Card title="Evacuation centers">
              {centers.length ? (
                <div className="divide-y divide-slate-100">
                  {centers.map((item) => (
                    <article key={item.id} className="flex gap-3 px-5 py-4">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.address}</p>
                        <p className="mt-1 text-xs capitalize text-emerald-700">
                          {item.status} · {item.current_occupancy}/{item.capacity ?? '—'} capacity
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No evacuation center updates.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function EmailVerification({ token }: { token: string }) {
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  async function resend() {
    setError('')
    try {
      await apiRequest('/auth/email/verification-notification', { method: 'POST', token })
      setResent(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not resend the email.')
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-amber-700">Email not verified.</span>
      <button type="button" onClick={resend} className="font-semibold text-blue-600 hover:underline">
        {resent ? 'Verification email sent' : 'Resend verification email'}
      </button>
      {error && <span role="alert" className="text-rose-600">{error}</span>}
    </div>
  )
}
