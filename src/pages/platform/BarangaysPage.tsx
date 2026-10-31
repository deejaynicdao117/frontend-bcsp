import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Building2, CircleX, RotateCcw, Save, ShieldPlus } from 'lucide-react'
import { Alert, Card, Spinner } from '../../components/ui'
import {
  createBarangayWorkspace,
  createBarangayWorkspaceUser,
  getPlatformBarangays,
  importDefaultBarangayWorkspace,
  reviewBarangayOnboarding,
  updateBarangayWorkspace,
  type BarangayWorkspace,
} from '../../shared/api'

export default function BarangaysPage() {
  const [barangays, setBarangays] = useState<BarangayWorkspace[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | BarangayWorkspace['onboarding_status']>('all')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [newBarangayForm, setNewBarangayForm] = useState({
    psgc_code: '',
    name: '',
    municipality: '',
    province: 'Bulacan',
    contact_email: '',
    contact_phone: '',
    office_address: '',
    primary_color: '#2563eb',
    is_active: '1',
  })
  const [newBarangayLogo, setNewBarangayLogo] = useState<File | null>(null)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: 'admin' as 'admin' | 'staff' })

  useEffect(() => {
    let active = true
    getPlatformBarangays()
      .then(({ data }) => {
        if (!active) return
        setBarangays(data)
        setSelectedId(data.find((barangay) => barangay.onboarding_status === 'pending')?.id ?? data.find((barangay) => barangay.onboarding_status === 'unrequested')?.id ?? data[0]?.id ?? null)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load barangay workspaces.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selected = barangays.find((barangay) => barangay.id === selectedId) ?? null
  const normalizedPsgcCode = newBarangayForm.psgc_code.trim().toUpperCase()
  const normalizedName = newBarangayForm.name.trim().toLowerCase()
  const normalizedMunicipality = newBarangayForm.municipality.trim().toLowerCase()
  const possibleDuplicate = Boolean(normalizedPsgcCode || normalizedName)
    && barangays.some((barangay) => (
      (Boolean(normalizedPsgcCode) && barangay.psgc_code.trim().toUpperCase() === normalizedPsgcCode)
      || (
        Boolean(normalizedName && normalizedMunicipality)
        && barangay.name.trim().toLowerCase() === normalizedName
        && barangay.municipality.trim().toLowerCase() === normalizedMunicipality
      )
    ))
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return barangays
      .filter((barangay) => reviewFilter === 'all' || barangay.onboarding_status === reviewFilter)
      .filter((barangay) => `${barangay.name} ${barangay.municipality} ${barangay.psgc_code}`.toLowerCase().includes(query))
      .sort((first, second) => {
        const priority = { pending: 0, unrequested: 1, approved: 2, declined: 3 }
        return priority[first.onboarding_status] - priority[second.onboarding_status]
          || first.municipality.localeCompare(second.municipality)
          || first.name.localeCompare(second.name)
      })
  }, [barangays, reviewFilter, search])

  async function saveWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    const form = new FormData(event.currentTarget)
    if (logo) form.set('logo', logo)
    try {
      const result = await updateBarangayWorkspace(selected.psgc_code, form)
      setBarangays((items) => items.map((item) => item.id === result.data.id ? result.data : item))
      setLogo(null)
      setMessage(`${result.data.name} workspace saved.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this workspace.')
    } finally {
      setBusy(false)
    }
  }

  async function createBarangay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    if (possibleDuplicate) {
      setBusy(false)
      return
    }

    const form = new FormData()
    Object.entries(newBarangayForm).forEach(([key, value]) => {
      if (value !== '') form.append(key, value)
    })
    form.set('psgc_code', normalizedPsgcCode)
    form.set('name', newBarangayForm.name.trim())
    form.set('municipality', newBarangayForm.municipality.trim())
    if (newBarangayLogo) form.append('logo', newBarangayLogo)

    try {
      const result = await createBarangayWorkspace(form)
      setBarangays((items) => [result.data, ...items])
      setSelectedId(result.data.id)
      setNewBarangayForm({
        psgc_code: '',
        name: '',
        municipality: '',
        province: 'Bulacan',
        contact_email: '',
        contact_phone: '',
        office_address: '',
        primary_color: '#2563eb',
        is_active: '1',
      })
      setNewBarangayLogo(null)
      setMessage(`${result.data.name} was added and is ready for resident registration.`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the barangay workspace.')
    } finally {
      setBusy(false)
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await createBarangayWorkspaceUser(selected.id, adminForm)
      setAdminForm({ name: '', email: '', password: '', role: 'admin' })
      setMessage(`A ${adminForm.role} account was created for ${selected.name}.`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the workspace account.')
    } finally {
      setBusy(false)
    }
  }

  async function importLegacyWorkspace() {
    if (!selected || !window.confirm(`Move all existing portal users and records into ${selected.name}, ${selected.municipality}? This cannot be undone from the portal.`)) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await importDefaultBarangayWorkspace(selected.id)
      setMessage(result.message)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Unable to move the existing portal data.')
    } finally {
      setBusy(false)
    }
  }

  async function reviewSelectedBarangay(status: BarangayWorkspace['onboarding_status']) {
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await reviewBarangayOnboarding(selected.id, status)
      setBarangays((items) => items.map((item) => item.id === result.data.id ? result.data : item))
      setMessage(result.message)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Unable to update the barangay review status.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner label="Loading Bulacan barangays…" />

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {(error || message) && <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>{error || message}</Alert>}
      <header className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-blue-700 to-slate-900 p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-blue-100 uppercase"><Building2 size={15} /> Platform control</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Barangay onboarding</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Review barangay requests, approve confirmed workspaces, and prepare their identity before residents can register.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-emerald-50/80">
          <span>{barangays.filter((barangay) => barangay.onboarding_status === 'pending').length} requests to review</span>
          <span>{barangays.filter((barangay) => barangay.onboarding_status === 'unrequested').length} not yet requested</span>
          <span>{barangays.filter((barangay) => barangay.onboarding_status === 'approved').length} verified</span>
          <span>{barangays.filter((barangay) => barangay.onboarding_status === 'declined').length} declined</span>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.4fr)]">
        <div className="space-y-5">
          <Card title="Add a new barangay" subtitle="Create a Bulacan barangay workspace and make it available for resident registration.">
            <form onSubmit={(event) => void createBarangay(event)} className="grid gap-3 p-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">PSGC code<input required value={newBarangayForm.psgc_code} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, psgc_code: event.target.value })} className="input mt-1.5" placeholder="e.g. BRGY-001" /></label>
              <label className="field-label sm:col-span-2">Barangay name<input required value={newBarangayForm.name} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, name: event.target.value })} className="input mt-1.5" placeholder="Barangay San Jose" /></label>
              {possibleDuplicate && (
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
                    <BadgeCheck size={12} className="text-rose-600" />
                    <span>Possible duplicate detected — this PSGC code or barangay name and municipality already exists.</span>
                  </div>
                </div>
              )}
              <label className="field-label">Municipality<input required value={newBarangayForm.municipality} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, municipality: event.target.value })} className="input mt-1.5" placeholder="Bulakan" /></label>
              <label className="field-label">Province<input value={newBarangayForm.province} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, province: event.target.value })} className="input mt-1.5" placeholder="Bulacan" /></label>
              <label className="field-label">Email<input type="email" value={newBarangayForm.contact_email} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, contact_email: event.target.value })} className="input mt-1.5" placeholder="barangay@example.com" /></label>
              <label className="field-label">Phone<input value={newBarangayForm.contact_phone} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, contact_phone: event.target.value })} className="input mt-1.5" placeholder="0917-123-4567" /></label>
              <label className="field-label sm:col-span-2">Office address<input value={newBarangayForm.office_address} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, office_address: event.target.value })} className="input mt-1.5" placeholder="Barangay Hall, Main Street" /></label>
              <label className="field-label">Portal color<input type="color" value={newBarangayForm.primary_color} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, primary_color: event.target.value })} className="input mt-1.5 h-11 p-1.5" /></label>
              <label className="field-label">Status<select value={newBarangayForm.is_active} onChange={(event) => setNewBarangayForm({ ...newBarangayForm, is_active: event.target.value })} className="input mt-1.5"><option value="1">Active</option><option value="0">Paused</option></select></label>
              <label className="field-label sm:col-span-2">Logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setNewBarangayLogo(event.target.files?.[0] ?? null)} className="input mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700" /></label>
              <div className="sm:col-span-2"><button type="submit" disabled={busy || possibleDuplicate} className="btn btn-primary">Add barangay</button></div>
            </form>
          </Card>

          <Card className="min-w-0 self-start" title={`Malolos & Bulacan barangays (${filtered.length})`} subtitle="Requests received appear first; only approved, active workspaces show on resident registration">
          <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search barangay, municipality, PSGC…" aria-label="Search Bulacan barangays" />
            <select className="input sm:w-40" value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value as typeof reviewFilter)} aria-label="Filter barangays by review status">
              <option value="all">All statuses</option>
              <option value="unrequested">Not requested</option>
              <option value="pending">Request received</option>
              <option value="approved">Verified</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div className="max-h-152 divide-y divide-slate-100 overflow-y-auto">
            {filtered.map((barangay) => (
              <button key={barangay.id} type="button" onClick={() => { setSelectedId(barangay.id); setLogo(null); setError(''); setMessage('') }} className={`platform-barangay-row flex w-full items-center gap-3 px-4 py-3 text-left transition ${selectedId === barangay.id ? 'is-selected' : ''}`}>
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-blue-700">
                  {barangay.logo_url ? <img src={barangay.logo_url} alt="" className="size-full object-contain" /> : <Building2 size={17} />}
                </span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{barangay.name}</span><span className="block truncate text-xs text-slate-500">{barangay.municipality} · {barangay.psgc_code}</span></span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${barangay.onboarding_status === 'approved' ? 'bg-emerald-50 text-emerald-800' : barangay.onboarding_status === 'declined' ? 'bg-rose-50 text-rose-700' : barangay.onboarding_status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{barangay.onboarding_status === 'approved' ? 'Approved' : barangay.onboarding_status === 'declined' ? 'Declined' : barangay.onboarding_status === 'pending' ? 'Request received' : 'Not requested'}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No matching barangay found.</p>}
          </div>
        </Card>
        </div>

        {selected ? (
          <div className="space-y-5">
            <Card title={`${selected.name}, ${selected.municipality}`} subtitle={`PSGC ${selected.psgc_code} · ${selected.province}`}>
              <form onSubmit={(event) => void saveWorkspace(event)} className="grid gap-4 p-5 sm:grid-cols-2">
                <label className="field-label sm:col-span-2">Official barangay name<input name="name" required maxLength={150} defaultValue={selected.name} key={`${selected.id}-${selected.name}`} className="input mt-1.5" /></label>
                <label className="field-label">Contact email<input name="contact_email" type="email" defaultValue={selected.contact_email ?? ''} key={`${selected.id}-email`} className="input mt-1.5" /></label>
                <label className="field-label">Contact phone<input name="contact_phone" defaultValue={selected.contact_phone ?? ''} key={`${selected.id}-phone`} className="input mt-1.5" /></label>
                <label className="field-label sm:col-span-2">Barangay hall address<input name="office_address" defaultValue={selected.office_address ?? ''} key={`${selected.id}-address`} className="input mt-1.5" /></label>
                <label className="field-label">Portal color<input name="primary_color" type="color" defaultValue={selected.primary_color} key={`${selected.id}-color`} className="input mt-1.5 h-11 p-1.5" /></label>
                <label className="field-label">Workspace status<select name="is_active" defaultValue={selected.is_active ? '1' : '0'} key={`${selected.id}-active`} className="input mt-1.5"><option value="1">Active — residents can register</option><option value="0">Paused — new registrations disabled</option></select></label>
                <label className="field-label sm:col-span-2">Barangay logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} className="input mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700" /><span className="mt-1 block text-xs font-normal text-slate-400">PNG, JPG, or WebP · maximum 2 MB</span>{selected.logo_url && <img src={selected.logo_url} alt={`${selected.name} logo`} className="mt-3 size-20 rounded-xl border border-slate-200 bg-white object-contain p-2" />}</label>
                <div className="sm:col-span-2"><button disabled={busy} className="btn btn-primary"><Save size={15} />{busy ? 'Saving…' : 'Save workspace'}</button></div>
              </form>
            </Card>

            <Card
              title="Barangay onboarding"
              subtitle="Record contact from a barangay, review the request, and verify it before residents can register."
            >
              <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selected.onboarding_status === 'approved' ? 'bg-emerald-50 text-emerald-800' : selected.onboarding_status === 'declined' ? 'bg-rose-50 text-rose-700' : selected.onboarding_status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                    {selected.onboarding_status === 'approved' ? 'Verified for registration' : selected.onboarding_status === 'declined' ? 'Request declined' : selected.onboarding_status === 'pending' ? 'Contact received · awaiting review' : 'No onboarding request recorded'}
                  </span>
                  {selected.onboarding_reviewed_at && <p className="mt-2 text-xs text-slate-500">Reviewed {new Date(selected.onboarding_reviewed_at).toLocaleString()}{selected.onboarding_reviewer?.name ? ` by ${selected.onboarding_reviewer.name}` : ''}</p>}
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {selected.onboarding_status === 'unrequested' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('pending')} className="btn btn-secondary"><BadgeCheck size={15} />Record contact received</button>}
                  {selected.onboarding_status !== 'approved' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('approved')} className="btn btn-primary"><BadgeCheck size={15} />Approve for registration</button>}
                  {selected.onboarding_status !== 'declined' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('declined')} className="btn btn-secondary text-rose-700"><CircleX size={15} />Decline</button>}
                  {selected.onboarding_status !== 'unrequested' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('unrequested')} className="btn btn-secondary"><RotateCcw size={15} />Return to directory</button>}
                </div>
              </div>
            </Card>

            {selected.onboarding_status === 'approved' && selected.is_active ? <Card title="Create workspace access" subtitle="Create the first barangay admin or add staff to this verified location.">
              <form onSubmit={(event) => void createUser(event)} className="grid gap-3 p-5 sm:grid-cols-2">
                <label className="field-label">Full name<input required maxLength={255} value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} className="input mt-1.5" /></label>
                <label className="field-label">Role<select value={adminForm.role} onChange={(event) => setAdminForm({ ...adminForm, role: event.target.value as 'admin' | 'staff' })} className="input mt-1.5"><option value="admin">Barangay admin</option><option value="staff">Staff</option></select></label>
                <label className="field-label">Email<input required type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} className="input mt-1.5" /></label>
                <label className="field-label">Temporary password<input required minLength={8} type="password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} className="input mt-1.5" /></label>
                <div className="sm:col-span-2"><button disabled={busy} className="btn btn-secondary"><ShieldPlus size={15} />Create {adminForm.role}</button></div>
              </form>
            </Card> : <Card title="Workspace access is locked" subtitle="Verify and activate this barangay before creating local administrator or staff accounts."><p className="p-5 text-sm leading-6 text-slate-600">Once verified and active, you can create the barangay’s first administrator and prepare its portal for resident registration.</p></Card>}
            <Card title="Existing portal data" subtitle="The migration preserves records in a separate legacy workspace until you assign them to a Bulacan barangay.">
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-6 text-slate-600">If this is the barangay your current portal belongs to, move the existing residents, users, requests, announcements, and settings here before using the new workspaces.</p>
                <button type="button" disabled={busy} onClick={() => void importLegacyWorkspace()} className="btn btn-secondary shrink-0">Assign legacy data here</button>
              </div>
            </Card>
          </div>
        ) : <Card title="Select a barangay"><p className="p-5 text-sm text-slate-500">Choose a location from the Bulacan list.</p></Card>}
      </div>
    </div>
  )
}
