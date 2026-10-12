import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Megaphone,
  Phone,
  ShieldCheck,
  Siren,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Alert, Card, Spinner, StatusBadge } from '../../components/ui'
import { residentCommunityApi } from '../../shared/api'

type ProfileData = {
  user: {
    id: number
    name: string
    email: string
    role: string
    email_verified_at?: string | null
  }
  profile: Record<string, string | null> | null
  households: Array<{
    household_code: string
    address: string
    purok: string
    verification_status: string
  }>
}

type Complaint = {
  id: number
  reference_number: string
  subject: string
  category: string
  priority: string
  status: string
  ai_summary: string
  ai_recommended_category: string
  ai_recommended_priority: string
  validation_flags: string[]
  possible_duplicate: boolean
}

type Assistance = {
  id: number
  reference_number: string
  incident_type: string
  description: string
  priority: string
  status: string
  location: string
}

type Announcement = {
  id: number
  title: string
  body: string
  type: string
  severity: string
  published_at: string | null
}

type Contact = {
  id: number
  name: string
  office: string | null
  phone: string
  availability: string
}

type Center = {
  id: number
  name: string
  address: string
  capacity: number | null
  current_occupancy: number
  status: string
}

const profileFields = [
  ['last_name', 'Last name'],
  ['first_name', 'First name'],
  ['middle_name', 'Middle name'],
  ['phone', 'Phone number'],
  ['birth_date', 'Birth date'],
  ['sex', 'Sex'],
  ['civil_status', 'Civil status'],
  ['occupation', 'Occupation'],
  ['address', 'Home address'],
  ['purok', 'Purok'],
] as const

export default function CommunityServices() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [assistance, setAssistance] = useState<Assistance[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [complaintForm, setComplaintForm] = useState({
    subject: '',
    description: '',
    location: '',
    purok: '',
  })
  const [aidForm, setAidForm] = useState({
    incident_type: '',
    description: '',
    location: '',
    purok: '',
    priority: 'high',
  })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  async function reloadResidentData() {
    const [profileResult, complaintResult, aidResult] = await Promise.all([
      residentCommunityApi.getProfile<ProfileData>(),
      residentCommunityApi.getComplaints<Complaint>(),
      residentCommunityApi.getAssistanceRequests<Assistance>(),
    ])
    setProfile(profileResult.data)
    setComplaints(complaintResult.data)
    setAssistance(aidResult.data)
  }

  useEffect(() => {
    let active = true

    Promise.all([
      residentCommunityApi.getProfile<ProfileData>(),
      residentCommunityApi.getComplaints<Complaint>(),
      residentCommunityApi.getAssistanceRequests<Assistance>(),
      residentCommunityApi.getAnnouncements<Announcement>(),
      residentCommunityApi.getEmergencyContacts<Contact>(),
      residentCommunityApi.getEvacuationCenters<Center>(),
    ])
      .then(([profileResult, complaintResult, aidResult, announcementResult, contactResult, centerResult]) => {
        if (!active) return

        setProfile(profileResult.data)
        setComplaints(complaintResult.data)
        setAssistance(aidResult.data)
        setAnnouncements(announcementResult.data)
        setContacts(contactResult.data)
        setCenters(centerResult.data)

        const savedProfile = profileResult.data.profile
        setComplaintForm((form) => ({
          ...form,
          location: savedProfile?.address ?? '',
          purok: savedProfile?.purok ?? '',
        }))
        setAidForm((form) => ({
          ...form,
          location: savedProfile?.address ?? '',
          purok: savedProfile?.purok ?? '',
        }))
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load community services.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')
    const form = new FormData(event.currentTarget)
    try {
      await residentCommunityApi.updateProfile({
        last_name: String(form.get('last_name') ?? ''),
        first_name: String(form.get('first_name') ?? ''),
        middle_name: String(form.get('middle_name') ?? ''),
        phone: String(form.get('phone') ?? ''),
        birth_date: String(form.get('birth_date') ?? '') || null,
        sex: String(form.get('sex') ?? ''),
        civil_status: String(form.get('civil_status') ?? ''),
        occupation: String(form.get('occupation') ?? ''),
        address: String(form.get('address') ?? ''),
        purok: String(form.get('purok') ?? ''),
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
      await residentCommunityApi.submitComplaint(complaintForm)
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
      await residentCommunityApi.submitAssistanceRequest(aidForm)
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
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200/70 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="absolute -right-10 -top-24 -z-10 size-72 rounded-full bg-blue-100/80 blur-3xl" />
        <div className="absolute right-32 bottom-[-9rem] -z-10 size-72 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BadgeCheck size={14} />
              Your community hub
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Community services
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Manage your resident profile, raise a concern, request help, and stay up to date with local announcements.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#resident-profile" className="btn btn-primary btn-sm">My profile <ArrowDownRight size={14} /></a>
              <a href="#community-updates" className="btn btn-secondary btn-sm">Community updates <Bell size={14} /></a>
            </div>
          </div>

          <aside className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-4 sm:min-w-64">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
                <Siren size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Emergency?</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">For life-threatening danger, call emergency services first.</p>
              </div>
            </div>
            <a href="tel:911" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700">
              <Phone size={15} /> Call 911
            </a>
          </aside>
        </div>

        <div className="relative mt-6 grid gap-2 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <QuickLink href="#complaint-form" icon={Megaphone} label="Report an issue" detail={`${complaints.length} submitted`} />
          <QuickLink href="#assistance-form" icon={Siren} label="Request assistance" detail={`${assistance.length} requests`} />
          <QuickLink href="#community-updates" icon={Bell} label="Public information" detail={`${announcements.length} announcements`} />
        </div>
      </section>

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
            className="scroll-mt-28"
            title="Personal & household profile"
            subtitle="Your details can be reviewed by barangay staff."
            action={
              <span className="badge bg-amber-50 text-amber-700 ring-amber-200/80 capitalize">
                {profile?.profile?.verification_status ?? 'unverified'}
              </span>
            }
            padded
          >
            <div id="resident-profile" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
              <span className="grid size-11 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {profile?.user?.name?.slice(0, 1).toUpperCase() ?? 'R'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{profile?.user?.name ?? 'Resident account'}</p>
                <p className="truncate text-xs text-slate-500">{profile?.user?.email}</p>
              </div>
              {profile?.user?.email_verified_at ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={13} /> Email verified
                </span>
              ) : (
                <EmailVerification />
              )}
            </div>
            <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profileFields.map(([key, label]) => (
                <label key={key} className="field-label">
                  {label}
                  {key === 'sex' ? (
                    <select
                      name={key}
                      defaultValue={profile?.profile?.[key] ?? ''}
                      className="input mt-1.5"
                    >
                      <option value="">Select an option</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    <input
                      name={key}
                      type={key === 'birth_date' ? 'date' : 'text'}
                      defaultValue={profile?.profile?.[key] ?? ''}
                      className="input mt-1.5"
                    />
                  )}
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

          </Card>

          {/* --------------------------- Complaint / emergency ----------------------- */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card
              className="scroll-mt-28 border-blue-100"
              title="Complaint or feedback"
              subtitle="The system suggests a category and priority; staff confirm or change them."
              padded
            >
              <form id="complaint-form" onSubmit={submitComplaint} className="space-y-3">
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-3 text-xs text-blue-800">
                  <ShieldCheck size={16} className="shrink-0" />
                  Your report is reviewed by barangay staff. Automated suggestions are advisory only.
                </div>
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
                <button disabled={busy} className="btn btn-primary">
                  <Megaphone size={15} />
                  {busy ? 'Submitting…' : 'Submit complaint'}
                </button>
              </form>
            </Card>

            <Card
              className="scroll-mt-28 border-rose-100"
              title="Emergency / disaster assistance"
              subtitle="For immediate danger, call your emergency contact directly."
              padded
            >
              <div className="mb-4 flex gap-3 rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-3">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-600" />
                <p className="text-xs leading-5 text-rose-700">
                  Use this form for evacuation, relief, or rescue help. Life-threatening emergencies: call 911 first.
                </p>
              </div>
              <form id="assistance-form" onSubmit={submitAssistance} className="space-y-3">
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
                <button disabled={busy} className="btn bg-rose-600 text-white hover:bg-rose-700">
                  <Siren size={15} />
                  {busy ? 'Sending…' : 'Send assistance request'}
                </button>
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
          <div id="community-updates" className="scroll-mt-28">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Stay informed</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Community updates & resources</h2>
                <p className="mt-1 text-sm text-slate-500">Important notices and helpful contacts from your barangay.</p>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><Clock3 size={14} /> Updated by barangay staff</span>
            </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Card title="Public announcements">
              {announcements.length ? (
                <div className="divide-y divide-slate-100">
                  {announcements.map((item) => (
                    <article key={item.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <span className={`badge shrink-0 ${item.severity === 'critical' || item.severity === 'urgent' ? 'bg-rose-50 text-rose-700 ring-rose-200/80' : item.severity === 'warning' ? 'bg-amber-50 text-amber-700 ring-amber-200/80' : 'bg-blue-50 text-blue-700 ring-blue-200/80'}`}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs capitalize text-slate-400">{item.type.replaceAll('_', ' ')}</p>
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
          </div>
        </>
      )}
    </div>
  )
}

function EmailVerification() {
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  async function resend() {
    setError('')
    try {
      await residentCommunityApi.resendVerificationEmail()
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

function QuickLink({
  href,
  icon: Icon,
  label,
  detail,
}: {
  href: string
  icon: LucideIcon
  label: string
  detail: string
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500">{detail}</span>
      </span>
      <ArrowDownRight size={15} className="text-slate-300 transition group-hover:text-blue-600" />
    </a>
  )
}
