import { useCallback, useEffect, useState } from 'react'
import { Activity, MapPinned, Phone, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Alert, Card, PageHeader } from '../../components/ui'
import AnnouncementManager, { type Announcement } from '../../components/shared/AnnouncementManager'
import { adminCommunityApi } from '../../shared/api'

type Contact = {
  id: number
  name: string
  office: string | null
  phone: string
  availability: string
  is_active: boolean
}

type Center = {
  id: number
  name: string
  address: string
  purok: string | null
  capacity: number | null
  current_occupancy: number
  status: string
}

type Household = {
  id: number
  household_code: string
  address: string
  purok: string
  verification_status: string
  head?: { name: string }
}

type Complaint = {
  id: number
  reference_number: string
  subject: string
  ai_recommended_category: string
  ai_recommended_priority: string
  final_category: string | null
  final_priority: string | null
  status: string
  possible_duplicate: boolean
}

type Aid = {
  id: number
  reference_number: string
  incident_type: string
  location: string
  status: string
  priority: string
}

type ActivityItem = {
  id: number
  action: string
  created_at: string
  actor?: { name: string } | null
  metadata: Record<string, unknown> | null
}

type CommunityData = {
  contacts: Contact[]
  centers: Center[]
  households: Household[]
  complaints: Complaint[]
  assistance: Aid[]
  logs: ActivityItem[]
}

const adminAnnouncementApi = {
  get: () => adminCommunityApi.getAnnouncements<Announcement>(),
  create: adminCommunityApi.createAnnouncement,
  update: adminCommunityApi.updateAnnouncement,
  remove: adminCommunityApi.deleteAnnouncement,
}

async function fetchCommunityData(): Promise<CommunityData> {
  const [
    contactsResult,
    centersResult,
    householdResult,
    complaintResult,
    aidResult,
    logResult,
  ] = await Promise.all([
    adminCommunityApi.getEmergencyContacts<Contact>(),
    adminCommunityApi.getEvacuationCenters<Center>(),
    adminCommunityApi.getHouseholds<Household>(),
    adminCommunityApi.getComplaints<Complaint>(),
    adminCommunityApi.getAssistanceRequests<Aid>(),
    adminCommunityApi.getActivityLogs<ActivityItem>(),
  ])

  return {
    contacts: contactsResult.data,
    centers: centersResult.data,
    households: householdResult.data,
    complaints: complaintResult.data,
    assistance: aidResult.data,
    logs: logResult.data,
  }
}

function Panel({ title, icon: Icon, children, footer }: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-500">
          <Icon size={15} strokeWidth={1.9} />
        </span>
        <h2 className="card-title">{title}</h2>
      </div>
      <div>{children}</div>
      {footer}
    </Card>
  )
}

function Rows({ items, empty }: {
  items: React.ReactNode[]
  empty: string
}) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-400">{empty}</p>
  }

  return <div className="divide-y divide-slate-100">{items}</div>
}

export default function CommunityManagement() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [assistance, setAssistance] = useState<Aid[]>([])
  const [logs, setLogs] = useState<ActivityItem[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const applyCommunityData = useCallback((data: CommunityData) => {
    setContacts(data.contacts)
    setCenters(data.centers)
    setHouseholds(data.households)
    setComplaints(data.complaints)
    setAssistance(data.assistance)
    setLogs(data.logs)
  }, [])

  async function load() {
    applyCommunityData(await fetchCommunityData())
  }

  useEffect(() => {
    let active = true
    fetchCommunityData()
      .then((data) => { if (active) applyCommunityData(data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load admin community data.')
      })
    return () => { active = false }
  }, [applyCommunityData])

  async function submit(action: () => Promise<unknown>, successText: string): Promise<boolean> {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      await load()
      setMessage(successText)
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function createContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const saved = await submit(() => adminCommunityApi.createEmergencyContact({
      name: form.get('name'),
      office: form.get('office'),
      phone: form.get('phone'),
      availability: form.get('availability'),
    }), 'Emergency contact added.')

    if (saved) formElement.reset()
  }

  async function createCenter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const saved = await submit(() => adminCommunityApi.createEvacuationCenter({
      name: form.get('name'),
      address: form.get('address'),
      purok: form.get('purok'),
      capacity: Number(form.get('capacity') || 0),
      status: form.get('status'),
    }), 'Evacuation center saved.')

    if (saved) formElement.reset()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public information & resources"
        title="Community administration"
        description="Publish advisories, maintain emergency resources, manage settings, and audit activity."
      />

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <AnnouncementManager api={adminAnnouncementApi} />

        <Panel title="Emergency contacts" icon={Phone}>
          <form className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2" onSubmit={createContact}>
            <input required name="name" placeholder="Contact name" className="input" />
            <input name="office" placeholder="Office" className="input" />
            <input required name="phone" placeholder="Phone" className="input" />
            <input name="availability" placeholder="Availability (24/7)" className="input" />
            <button disabled={busy} className="btn btn-primary btn-sm justify-self-start sm:col-span-2">Add contact</button>
          </form>
          <Rows
            empty="No contacts configured."
            items={contacts.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.name} · {item.phone}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.office} · {item.availability}</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => submit(
                    () => adminCommunityApi.deleteEmergencyContact(item.id),
                    'Emergency contact removed.',
                  )}
                  className="btn btn-danger-soft btn-sm shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          />
        </Panel>

        <Panel title="Evacuation centers" icon={MapPinned}>
          <form className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2" onSubmit={createCenter}>
            <input required name="name" placeholder="Center name" className="input" />
            <input required name="address" placeholder="Address" className="input" />
            <input name="purok" placeholder="Purok" className="input" />
            <input name="capacity" type="number" min="0" placeholder="Capacity" className="input" />
            <select name="status" className="input">
              <option>open</option>
              <option>full</option>
              <option>closed</option>
            </select>
            <button disabled={busy} className="btn btn-primary btn-sm justify-self-start">Add center</button>
          </form>
          <Rows
            empty="No evacuation centers configured."
            items={centers.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.name} · {item.status}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.address} · Occupancy {item.current_occupancy}/{item.capacity ?? '—'}
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => submit(
                    () => adminCommunityApi.deleteEvacuationCenter(item.id),
                    'Evacuation center removed.',
                  )}
                  className="btn btn-danger-soft btn-sm shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          />
        </Panel>

        <Panel title="Household & incident oversight" icon={Users}>
          <Rows
            empty="No household records yet."
            items={households.map((item) => (
              <div key={`h${item.id}`} className="px-5 py-3.5 text-sm">
                <span className="font-medium text-slate-800">{item.household_code}</span>
                <span className="text-slate-500"> · {item.head?.name ?? 'Head pending'} · {item.purok} · {item.verification_status}</span>
              </div>
            ))}
          />
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Flagged for review</p>
            <div className="mt-2 space-y-1.5">
              {complaints.slice(0, 5).map((item) => (
                <p key={item.id} className="text-xs text-slate-600">
                  {item.reference_number} · {item.subject} · AI {item.ai_recommended_category}/{item.ai_recommended_priority} · Final {item.final_category ?? 'awaiting staff'}
                </p>
              ))}
              {assistance.slice(0, 3).map((item) => (
                <p key={`a${item.id}`} className="text-xs text-rose-700">
                  Emergency {item.reference_number} · {item.incident_type} · {item.status}
                </p>
              ))}
              {complaints.length === 0 && assistance.length === 0 && (
                <p className="text-xs text-slate-400">Nothing flagged right now.</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Audit / activity log" icon={Activity}>
          <Rows
            empty="No recorded activity."
            items={logs.slice(0, 20).map((item) => (
              <p key={item.id} className="px-5 py-3 text-xs text-slate-600">
                <span className="font-medium text-slate-800">{item.actor?.name ?? 'System'}</span> · {item.action} · {new Date(item.created_at).toLocaleString()}
              </p>
            ))}
          />
        </Panel>
      </section>
    </div>
  )
}
