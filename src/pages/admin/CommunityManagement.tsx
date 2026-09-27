import { useCallback, useEffect, useState } from 'react'
import { Activity, Megaphone, MapPinned, Phone, Settings2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Alert, Card, PageHeader } from '../../components/ui'
import { apiRequest } from '../../shared/api'

type Envelope<T> = { data: T }
type Announcement = { id: number; title: string; body: string; type: string; severity: string; status: string; location: string | null }
type Contact = { id: number; name: string; office: string | null; phone: string; availability: string; is_active: boolean }
type Center = { id: number; name: string; address: string; purok: string | null; capacity: number | null; current_occupancy: number; status: string }
type Household = { id: number; household_code: string; address: string; purok: string; verification_status: string; head?: { name: string } }
type Complaint = { id: number; reference_number: string; subject: string; ai_recommended_category: string; ai_recommended_priority: string; final_category: string | null; final_priority: string | null; status: string; possible_duplicate: boolean }
type Aid = { id: number; reference_number: string; incident_type: string; location: string; status: string; priority: string }
type ActivityItem = { id: number; action: string; created_at: string; actor?: { name: string } | null; metadata: Record<string, unknown> | null }
type Setting = { key: string; value: string | null; group: string }

type CommunityData = {
  announcements: Announcement[]
  contacts: Contact[]
  centers: Center[]
  households: Household[]
  complaints: Complaint[]
  assistance: Aid[]
  logs: ActivityItem[]
  settings: Setting[]
}

async function fetchCommunityData(token: string): Promise<CommunityData> {
  const [ann, contactsResult, centersResult, householdResult, complaintResult, aidResult, logResult, settingsResult] = await Promise.all([
    apiRequest<Envelope<Announcement[]>>('/admin/announcements', { token }),
    apiRequest<Envelope<Contact[]>>('/admin/emergency-contacts', { token }),
    apiRequest<Envelope<Center[]>>('/admin/evacuation-centers', { token }),
    apiRequest<Envelope<Household[]>>('/admin/households', { token }),
    apiRequest<Envelope<Complaint[]>>('/admin/complaints', { token }),
    apiRequest<Envelope<Aid[]>>('/admin/disaster-assistance', { token }),
    apiRequest<Envelope<ActivityItem[]>>('/admin/activity-logs', { token }),
    apiRequest<Envelope<Setting[]>>('/admin/settings', { token }),
  ])

  return {
    announcements: ann.data,
    contacts: contactsResult.data,
    centers: centersResult.data,
    households: householdResult.data,
    complaints: complaintResult.data,
    assistance: aidResult.data,
    logs: logResult.data,
    settings: settingsResult.data,
  }
}

function Panel({ title, icon: Icon, children, footer }: { title: string; icon: LucideIcon; children: React.ReactNode; footer?: React.ReactNode }) {
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

function Rows({ items, empty }: { items: React.ReactNode[]; empty: string }) {
  if (items.length === 0) return <p className="px-5 py-8 text-center text-sm text-slate-400">{empty}</p>
  return <div className="divide-y divide-slate-100">{items}</div>
}

export default function CommunityManagement({ token }: { token: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [assistance, setAssistance] = useState<Aid[]>([])
  const [logs, setLogs] = useState<ActivityItem[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const applyCommunityData = useCallback((data: CommunityData) => {
    setAnnouncements(data.announcements)
    setContacts(data.contacts)
    setCenters(data.centers)
    setHouseholds(data.households)
    setComplaints(data.complaints)
    setAssistance(data.assistance)
    setLogs(data.logs)
    setSettings(data.settings)
  }, [])

  async function load() {
    applyCommunityData(await fetchCommunityData(token))
  }

  useEffect(() => {
    let active = true
    fetchCommunityData(token)
      .then((data) => { if (active) applyCommunityData(data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load admin community data.')
      })
    return () => { active = false }
  }, [applyCommunityData, token])

  async function submit(path: string, method: 'POST' | 'PUT' | 'DELETE', body: object | undefined, successText: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiRequest(path, { token, method, body })
      await load()
      setMessage(successText)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed.')
    } finally {
      setBusy(false)
    }
  }

  function createAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void submit('/admin/announcements', 'POST', {
      title: form.get('title'),
      body: form.get('body'),
      type: form.get('type'),
      severity: form.get('severity'),
      status: form.get('status'),
      location: form.get('location'),
    }, 'Advisory saved.')
  }

  function createContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void submit('/admin/emergency-contacts', 'POST', {
      name: form.get('name'),
      office: form.get('office'),
      phone: form.get('phone'),
      availability: form.get('availability'),
    }, 'Emergency contact added.')
    event.currentTarget.reset()
  }

  function createCenter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void submit('/admin/evacuation-centers', 'POST', {
      name: form.get('name'),
      address: form.get('address'),
      purok: form.get('purok'),
      capacity: Number(form.get('capacity') || 0),
      status: form.get('status'),
    }, 'Evacuation center saved.')
    event.currentTarget.reset()
  }

  function saveSetting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void submit('/admin/settings', 'PUT', {
      key: form.get('key'),
      value: form.get('value'),
      group: form.get('group'),
    }, 'Setting saved.')
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
        <Panel title="Public advisories & evacuation protocols" icon={Megaphone}>
          <form className="grid gap-3 border-b border-slate-100 p-5" onSubmit={createAnnouncement}>
            <input required name="title" placeholder="Advisory title" className="input" />
            <textarea required name="body" placeholder="Public message" className="input resize-y" rows={3} />
            <div className="grid gap-3 sm:grid-cols-3">
              <select name="type" className="input">
                <option value="announcement">Announcement</option>
                <option value="advisory">Advisory</option>
                <option value="emergency">Emergency</option>
                <option value="evacuation_protocol">Evacuation protocol</option>
              </select>
              <select name="severity" className="input">
                <option>info</option>
                <option>warning</option>
                <option>urgent</option>
                <option>critical</option>
              </select>
              <select name="status" className="input">
                <option value="draft">Draft</option>
                <option value="published">Publish now</option>
              </select>
            </div>
            <input name="location" placeholder="Affected area (optional)" className="input" />
            <button disabled={busy} className="btn btn-primary btn-sm justify-self-start">Publish / save draft</button>
          </form>
          <Rows
            empty="No advisories yet."
            items={announcements.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 capitalize">{item.type} · {item.severity} · {item.status}</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => submit(`/admin/announcements/${item.id}`, 'PUT', {
                    title: item.title,
                    body: item.body,
                    type: item.type,
                    severity: item.severity,
                    status: item.status === 'published' ? 'archived' : 'published',
                  }, 'Advisory status updated.')}
                  className="btn btn-soft btn-sm shrink-0"
                >
                  {item.status === 'published' ? 'Archive' : 'Publish'}
                </button>
              </div>
            ))}
          />
        </Panel>

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
                  onClick={() => submit(`/admin/emergency-contacts/${item.id}`, 'DELETE', undefined, 'Emergency contact removed.')}
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
                  onClick={() => submit(`/admin/evacuation-centers/${item.id}`, 'DELETE', undefined, 'Evacuation center removed.')}
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

        <Panel title="System settings" icon={Settings2}>
          <form className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-3" onSubmit={saveSetting}>
            <input required name="key" placeholder="Setting key" className="input" />
            <input name="value" placeholder="Setting value" className="input" />
            <input name="group" placeholder="Group" className="input" />
            <button disabled={busy} className="btn btn-primary btn-sm justify-self-start sm:col-span-3">Save setting</button>
          </form>
          <Rows
            empty="No custom settings."
            items={settings.map((item) => (
              <p key={item.key} className="px-5 py-3 text-xs text-slate-600">
                <span className="font-medium text-slate-800">{item.group}.{item.key}</span> = {item.value}
              </p>
            ))}
          />
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
