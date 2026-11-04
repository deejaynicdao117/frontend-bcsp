import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Building2, CircleX, Palette, Pencil, RotateCcw, Save, ShieldPlus, Trash2, Users, X } from 'lucide-react'
import { BarangayLogo, Card, Spinner, Toast } from '../../components/ui'
import {
  createBarangayWorkspace,
  createBarangayWorkspaceUser,
  deleteBarangayWorkspaceUser,
  getPlatformBarangayUsers,
  getPlatformBarangays,
  reviewBarangayOnboarding,
  updateBarangayWorkspace,
  updateBarangayWorkspaceUser,
  type BarangayWorkspace,
  type BarangayWorkspaceUser,
} from '../../shared/api'

export default function BarangaysPage() {
  const [barangays, setBarangays] = useState<BarangayWorkspace[]>([])
  const [selected, setSelected] = useState<BarangayWorkspace | null>(null)
  const [workspaceUsersResult, setWorkspaceUsersResult] = useState<{
    barangayId: number
    users: BarangayWorkspaceUser[]
    error: string
  } | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('Bulacan')
  const [reviewFilter, setReviewFilter] = useState<'all' | BarangayWorkspace['onboarding_status']>('all')
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [statusCounts, setStatusCounts] = useState<Record<BarangayWorkspace['onboarding_status'], number>>({
    unrequested: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  })
  const [busy, setBusy] = useState(false)
  const [busyAction, setBusyAction] = useState<'workspace' | 'create' | 'account' | 'team' | 'deleteTeam' | 'review' | 'color' | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [portalColor, setPortalColor] = useState('#2563eb')
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
  const [editingTeamUser, setEditingTeamUser] = useState<BarangayWorkspaceUser | null>(null)
  const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'staff' as 'admin' | 'staff' })
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null)
  const selectedIdRef = useRef<number | null>(null)
  const activeListQueryRef = useRef('')
  const selectedBarangayId = selected?.id
  const workspaceUsers = workspaceUsersResult && workspaceUsersResult.barangayId === selectedBarangayId ? workspaceUsersResult.users : []
  const workspaceUsersLoading = Boolean(selected && workspaceUsersResult?.barangayId !== selected.id)
  const workspaceUsersError = workspaceUsersResult && workspaceUsersResult.barangayId === selectedBarangayId ? workspaceUsersResult.error : ''

  function selectBarangay(barangay: BarangayWorkspace | null) {
    selectedIdRef.current = barangay?.id ?? null
    setSelected(barangay)
    setEditingTeamUser(null)
    setDeleteConfirmationId(null)
  }

  function validateForm(form: HTMLFormElement) {
    if (form.checkValidity()) return true

    const invalidField = form.querySelector<HTMLElement>(':invalid')
    const fieldLabel = invalidField?.closest('label')?.firstChild?.textContent?.trim()
      || invalidField?.getAttribute('aria-label')
      || 'this field'
    const validity = (invalidField as HTMLInputElement | null)?.validity
    const validationMessage = validity?.valueMissing
      ? `Please complete the ${fieldLabel} field.`
      : validity?.typeMismatch
        ? `Please enter a valid ${fieldLabel}.`
        : validity?.tooShort
          ? `${fieldLabel} must be at least ${(invalidField as HTMLInputElement).minLength} characters.`
          : `Please check the ${fieldLabel} field and try again.`

    setMessage('')
    setError(validationMessage)
    invalidField?.focus()
    invalidField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (!selectedBarangayId) return

    let active = true
    getPlatformBarangayUsers(selectedBarangayId)
      .then((result) => {
        if (active) setWorkspaceUsersResult({ barangayId: selectedBarangayId, users: result.data, error: '' })
      })
      .catch((loadError: unknown) => {
        if (active) setWorkspaceUsersResult({
          barangayId: selectedBarangayId,
          users: [],
          error: loadError instanceof Error ? loadError.message : 'Unable to load barangay accounts.',
        })
      })

    return () => { active = false }
  }, [selectedBarangayId])

  useEffect(() => {
    let active = true
    activeListQueryRef.current = `${debouncedSearch}\u0000${provinceFilter}\u0000${reviewFilter}`
    getPlatformBarangays({ page: 1, search: debouncedSearch, province: provinceFilter, status: reviewFilter })
      .then((result) => {
        if (!active) return
        setBarangays(result.data)
        setPagination(result.meta)
        setStatusCounts(result.status_counts)
        const selectedMatch = result.data.find((barangay) => barangay.id === selectedIdRef.current)
        if (selectedMatch) selectBarangay(selectedMatch)
        else if (selectedIdRef.current === null) {
          const initialSelection = result.data[0] ?? null
          selectBarangay(initialSelection)
          setPortalColor(initialSelection?.primary_color ?? '#2563eb')
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load barangay workspaces.')
      })
      .finally(() => {
        if (active) {
          setListLoading(false)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [debouncedSearch, provinceFilter, reviewFilter])

  const normalizedPsgcCode = newBarangayForm.psgc_code.trim().toUpperCase()
  const normalizedName = newBarangayForm.name.trim().toLowerCase()
  const normalizedMunicipality = newBarangayForm.municipality.trim().toLowerCase()
  const normalizedProvince = newBarangayForm.province.trim().toLowerCase()
  const possibleDuplicate = Boolean(normalizedPsgcCode || normalizedName)
    && barangays.some((barangay) => (
      (Boolean(normalizedPsgcCode) && barangay.psgc_code.trim().toUpperCase() === normalizedPsgcCode)
      || (
        Boolean(normalizedName && normalizedMunicipality)
        && barangay.name.trim().toLowerCase() === normalizedName
        && barangay.municipality.trim().toLowerCase() === normalizedMunicipality
        && barangay.province.trim().toLowerCase() === normalizedProvince
      )
    ))

  async function loadMoreBarangays() {
    if (loadingMore || pagination.current_page >= pagination.last_page) return
    const requestQuery = `${debouncedSearch}\u0000${provinceFilter}\u0000${reviewFilter}`
    setLoadingMore(true)
    setError('')
    try {
      const result = await getPlatformBarangays({
        page: pagination.current_page + 1,
        search: debouncedSearch,
        province: provinceFilter,
        status: reviewFilter,
      })
      if (requestQuery !== activeListQueryRef.current) return
      setBarangays((items) => [...items, ...result.data])
      setPagination(result.meta)
      setStatusCounts(result.status_counts)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load more barangays.')
    } finally {
      setLoadingMore(false)
    }
  }

  async function saveWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForm(event.currentTarget)) return
    if (!selected) return
    setBusy(true)
    setBusyAction('workspace')
    setError('')
    setMessage('')
    const form = new FormData(event.currentTarget)
    if (logo) form.set('logo', logo)
    try {
      const result = await updateBarangayWorkspace(selected.psgc_code, form)
      setBarangays((items) => items.map((item) => item.id === result.data.id ? result.data : item))
      selectBarangay(result.data)
      setLogo(null)
      setMessage(`${result.data.name} workspace saved.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this workspace.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  async function createBarangay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForm(event.currentTarget)) return
    setBusy(true)
    setBusyAction('create')
    setError('')
    setMessage('')

    if (possibleDuplicate) {
      setError('A barangay with this PSGC code or name and municipality already exists.')
      setBusy(false)
      setBusyAction(null)
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
      setPagination((current) => ({ ...current, total: current.total + 1 }))
      selectBarangay(result.data)
      setPortalColor(result.data.primary_color)
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
      setBusyAction(null)
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForm(event.currentTarget)) return
    if (!selected) return
    setBusy(true)
    setBusyAction('account')
    setError('')
    setMessage('')
    try {
      const result = await createBarangayWorkspaceUser(selected.id, adminForm)
      setWorkspaceUsersResult((current) => {
        const users = current?.barangayId === selected.id ? current.users : []
        return {
          barangayId: selected.id,
          users: users.some((user) => user.id === result.data.id) ? users : [...users, result.data],
          error: '',
        }
      })
      setAdminForm({ name: '', email: '', password: '', role: 'admin' })
      setMessage(`A ${adminForm.role} account was created for ${selected.name}.`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the workspace account.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  function startEditingTeamUser(user: BarangayWorkspaceUser) {
    setEditingTeamUser(user)
    setTeamForm({ name: user.name, email: user.email, password: '', role: user.role })
    setDeleteConfirmationId(null)
  }

  async function saveTeamUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForm(event.currentTarget) || !selected || !editingTeamUser) return
    setBusy(true)
    setBusyAction('team')
    setError('')
    setMessage('')
    try {
      const result = await updateBarangayWorkspaceUser(selected.id, editingTeamUser.id, {
        name: teamForm.name.trim(),
        email: teamForm.email.trim(),
        role: teamForm.role,
        ...(teamForm.password ? { password: teamForm.password } : {}),
      })
      setWorkspaceUsersResult((current) => current?.barangayId === selected.id
        ? { ...current, users: current.users.map((user) => user.id === result.data.id ? result.data : user) }
        : current)
      setEditingTeamUser(null)
      setMessage(`${result.data.name}'s barangay account was updated.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update this team account.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  async function deleteTeamUser(user: BarangayWorkspaceUser) {
    if (!selected) return
    setBusy(true)
    setBusyAction('deleteTeam')
    setError('')
    setMessage('')
    try {
      await deleteBarangayWorkspaceUser(selected.id, user.id)
      setWorkspaceUsersResult((current) => current?.barangayId === selected.id
        ? { ...current, users: current.users.filter((item) => item.id !== user.id) }
        : current)
      if (editingTeamUser?.id === user.id) setEditingTeamUser(null)
      setDeleteConfirmationId(null)
      setMessage(`${user.name}'s barangay account was deleted.`)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this team account.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  async function reviewSelectedBarangay(status: BarangayWorkspace['onboarding_status']) {
    if (!selected) return
    setBusy(true)
    setBusyAction('review')
    setError('')
    setMessage('')
    try {
      const result = await reviewBarangayOnboarding(selected.id, status)
      selectBarangay(result.data)
      setBarangays((items) => reviewFilter !== 'all' && result.data.onboarding_status !== reviewFilter
        ? items.filter((item) => item.id !== result.data.id)
        : items.map((item) => item.id === result.data.id ? result.data : item))
      if (selected.onboarding_status !== status) {
        setStatusCounts((counts) => ({
          ...counts,
          [selected.onboarding_status]: Math.max(0, counts[selected.onboarding_status] - 1),
          [status]: counts[status] + 1,
        }))
      }
      if (reviewFilter !== 'all' && result.data.onboarding_status !== reviewFilter) {
        setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }))
      }
      setMessage(result.message)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Unable to update the barangay review status.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  async function savePortalColor() {
    if (!selected) return
    setBusy(true)
    setBusyAction('color')
    setError('')
    setMessage('')
    const form = new FormData()
    form.set('primary_color', portalColor)
    try {
      const result = await updateBarangayWorkspace(selected.psgc_code, form)
      setBarangays((items) => items.map((item) => item.id === result.data.id ? result.data : item))
      selectBarangay(result.data)
      setMessage(`${result.data.name} portal color saved. It will be used throughout the resident, staff, and admin portal.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the portal color.')
    } finally {
      setBusy(false)
      setBusyAction(null)
    }
  }

  if (loading) return <Spinner label="Loading barangays…" />

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {(error || message) && <Toast tone={error ? 'error' : 'success'} title={error ? 'Action could not be completed' : 'Action completed'} onDismiss={() => { setError(''); setMessage('') }}>{error || message}</Toast>}
      <header className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-blue-700 to-slate-900 p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-blue-100 uppercase"><Building2 size={15} /> Platform control</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Barangay onboarding</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Review barangay requests, approve confirmed workspaces, and prepare their identity before residents can register.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-emerald-50/80">
          <span>{statusCounts.pending.toLocaleString()} requests to review</span>
          <span>{statusCounts.unrequested.toLocaleString()} not yet requested</span>
          <span>{statusCounts.approved.toLocaleString()} verified</span>
          <span>{statusCounts.declined.toLocaleString()} declined</span>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.4fr)]">
        <div className="space-y-5">
          <Card title="Add a new barangay" subtitle="Add a barangay in Bulacan or another province and make it available for resident registration.">
            <form noValidate onSubmit={(event) => void createBarangay(event)} className="grid gap-3 p-4 sm:grid-cols-2">
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
              <div className="sm:col-span-2"><button type="submit" disabled={busy || possibleDuplicate} className="btn btn-primary">{busyAction === 'create' ? 'Adding…' : 'Add barangay'}</button></div>
            </form>
          </Card>

          <Card className="min-w-0 self-start" title={`${provinceFilter ? `Barangays in ${provinceFilter}` : 'All barangays'} (${pagination.total.toLocaleString()})`} subtitle="Requests received appear first; only approved, active workspaces show on resident registration">
          <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2">
            <input className="input w-full min-w-0 sm:col-span-2" value={search} onChange={(event) => {
              const nextSearch = event.target.value
              setSearch(nextSearch)
              const queryChanged = nextSearch.trim() !== debouncedSearch
              setListLoading(queryChanged)
              if (queryChanged) setBarangays([])
            }} placeholder="Search barangay, municipality, province, PSGC…" aria-label="Search all barangays" />
            <select className="input w-full min-w-0" value={provinceFilter} onChange={(event) => { setProvinceFilter(event.target.value); setListLoading(true); setBarangays([]) }} aria-label="Filter barangays by province">
              <option value="Bulacan">Bulacan</option>
              <option value="">All provinces</option>
            </select>
            <select className="input w-full min-w-0" value={reviewFilter} onChange={(event) => { setReviewFilter(event.target.value as typeof reviewFilter); setListLoading(true); setBarangays([]) }} aria-label="Filter barangays by review status">
              <option value="all">All statuses</option>
              <option value="unrequested">Not requested</option>
              <option value="pending">Request received</option>
              <option value="approved">Verified</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div className="max-h-152 divide-y divide-slate-100 overflow-y-auto">
            {barangays.map((barangay) => (
              <button key={barangay.id} type="button" onClick={() => { selectBarangay(barangay); setPortalColor(barangay.primary_color); setLogo(null); setError(''); setMessage('') }} className={`platform-barangay-row flex w-full items-center gap-3 px-4 py-3 text-left transition ${selected?.id === barangay.id ? 'is-selected' : ''}`}>
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-blue-700">
                  <BarangayLogo
                    src={barangay.logo_url}
                    className="size-full object-contain"
                    fallbackClassName="text-blue-700"
                    size={17}
                  />
                </span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{barangay.name}</span><span className="block truncate text-xs text-slate-500">{barangay.municipality} · {barangay.province} · {barangay.psgc_code}</span></span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${barangay.onboarding_status === 'approved' ? 'bg-emerald-50 text-emerald-800' : barangay.onboarding_status === 'declined' ? 'bg-rose-50 text-rose-700' : barangay.onboarding_status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{barangay.onboarding_status === 'approved' ? 'Approved' : barangay.onboarding_status === 'declined' ? 'Declined' : barangay.onboarding_status === 'pending' ? 'Request received' : 'Not requested'}</span>
              </button>
            ))}
            {listLoading && barangays.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Searching barangays…</p>}
            {!listLoading && barangays.length === 0 && (pagination.total === 0 && !debouncedSearch && reviewFilter === 'all'
              ? <div className="space-y-2 p-6 text-center text-sm text-slate-500"><p>The barangay directory is empty.</p><p>From the backend folder, run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">php artisan db:seed --class="Database\Seeders\PhilippinesBarangaySeeder"</code> to import the official PSGC directory.</p></div>
              : <p className="p-6 text-center text-sm text-slate-500">No matching barangay found.</p>)}
            {pagination.current_page < pagination.last_page && (
              <div className="p-3 text-center">
                <button type="button" disabled={loadingMore || listLoading} onClick={() => void loadMoreBarangays()} className="btn btn-secondary">
                  {loadingMore ? 'Loading…' : `Load more (${barangays.length.toLocaleString()} of ${pagination.total.toLocaleString()})`}
                </button>
              </div>
            )}
          </div>
        </Card>
        </div>

        {selected ? (
          <div className="space-y-5">
            <Card title={`${selected.name}, ${selected.municipality}`} subtitle={`PSGC ${selected.psgc_code} · ${selected.province}`}>
              <form noValidate onSubmit={(event) => void saveWorkspace(event)} className="grid gap-4 p-5 sm:grid-cols-2">
                <label className="field-label sm:col-span-2">Official barangay name<input name="name" required maxLength={150} defaultValue={selected.name} key={`${selected.id}-${selected.name}`} className="input mt-1.5" /></label>
                <label className="field-label">Contact email<input name="contact_email" type="email" defaultValue={selected.contact_email ?? ''} key={`${selected.id}-email`} className="input mt-1.5" /></label>
                <label className="field-label">Contact phone<input name="contact_phone" defaultValue={selected.contact_phone ?? ''} key={`${selected.id}-phone`} className="input mt-1.5" /></label>
                <label className="field-label sm:col-span-2">Barangay hall address<input name="office_address" defaultValue={selected.office_address ?? ''} key={`${selected.id}-address`} className="input mt-1.5" /></label>
                <label className="field-label">Workspace status<select name="is_active" defaultValue={selected.is_active ? '1' : '0'} key={`${selected.id}-active`} className="input mt-1.5"><option value="1">Active — residents can register</option><option value="0">Paused — new registrations disabled</option></select></label>
                <label className="field-label sm:col-span-2">Barangay logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} className="input mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700" /><span className="mt-1 block text-xs font-normal text-slate-400">PNG, JPG, or WebP · maximum 2 MB</span>{selected.logo_url && <span className="mt-3 grid size-20 place-items-center rounded-xl border border-slate-200 bg-white p-2"><BarangayLogo src={selected.logo_url} alt={`${selected.name} logo`} className="size-full object-contain" fallbackClassName="text-slate-400" size={28} /></span>}</label>
                <div className="sm:col-span-2"><button disabled={busy} className="btn btn-primary"><Save size={15} />{busyAction === 'workspace' ? 'Saving…' : 'Save workspace'}</button></div>
              </form>
            </Card>

            <Card
              title="Barangay onboarding"
              subtitle="Set this barangay's portal identity, review the request, and verify it before residents can register."
            >
              <div className="grid min-w-0 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selected.onboarding_status === 'approved' ? 'bg-emerald-50 text-emerald-800' : selected.onboarding_status === 'declined' ? 'bg-rose-50 text-rose-700' : selected.onboarding_status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                    {selected.onboarding_status === 'approved' ? 'Verified for registration' : selected.onboarding_status === 'declined' ? 'Request declined' : selected.onboarding_status === 'pending' ? 'Contact received · awaiting review' : 'No onboarding request recorded'}
                  </span>
                  {selected.onboarding_reviewed_at && <p className="mt-2 text-xs text-slate-500">Reviewed {new Date(selected.onboarding_reviewed_at).toLocaleString()}{selected.onboarding_reviewer?.name ? ` by ${selected.onboarding_reviewer.name}` : ''}</p>}
                </div>
                <div className="flex flex-wrap items-end gap-3 lg:justify-end">
                  <label className="field-label min-w-40 flex-1 sm:flex-none">Portal color
                    <span className="mt-1.5 flex items-center gap-2">
                      <input type="color" aria-label={`${selected.name} portal color`} value={portalColor} onChange={(event) => setPortalColor(event.target.value)} className="input h-11 w-16 cursor-pointer p-1.5" />
                      <span className="font-mono text-xs font-normal text-slate-500">{portalColor.toUpperCase()}</span>
                    </span>
                  </label>
                  <button type="button" disabled={busy || portalColor.toLowerCase() === selected.primary_color.toLowerCase()} onClick={() => void savePortalColor()} className="btn btn-secondary"><Palette size={15} />{busyAction === 'color' ? 'Saving…' : 'Save portal color'}</button>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2 border-t border-slate-100 pt-4 lg:col-span-2">
                  {selected.onboarding_status === 'unrequested' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('pending')} className="btn btn-secondary"><BadgeCheck size={15} />{busyAction === 'review' ? 'Updating…' : 'Record contact received'}</button>}
                  {selected.onboarding_status !== 'approved' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('approved')} className="btn btn-primary"><BadgeCheck size={15} />{busyAction === 'review' ? 'Updating…' : 'Approve for registration'}</button>}
                  {selected.onboarding_status !== 'declined' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('declined')} className="btn btn-secondary text-rose-700"><CircleX size={15} />{busyAction === 'review' ? 'Updating…' : 'Decline'}</button>}
                  {selected.onboarding_status !== 'unrequested' && <button type="button" disabled={busy} onClick={() => void reviewSelectedBarangay('unrequested')} className="btn btn-secondary"><RotateCcw size={15} />{busyAction === 'review' ? 'Updating…' : 'Return to directory'}</button>}
                </div>
              </div>
            </Card>

            {selected.onboarding_status === 'approved' && selected.is_active ? <Card title="Create workspace access" subtitle="Create the first barangay admin or add staff to this verified location.">
              <form noValidate onSubmit={(event) => void createUser(event)} className="grid gap-3 p-5 sm:grid-cols-2">
                <label className="field-label">Full name<input required maxLength={255} value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} className="input mt-1.5" /></label>
                <label className="field-label">Role<select value={adminForm.role} onChange={(event) => setAdminForm({ ...adminForm, role: event.target.value as 'admin' | 'staff' })} className="input mt-1.5"><option value="admin">Barangay admin</option><option value="staff">Staff</option></select></label>
                <label className="field-label">Email<input required type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} className="input mt-1.5" /></label>
                <label className="field-label">Temporary password<input required minLength={8} type="password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} className="input mt-1.5" /></label>
                <div className="sm:col-span-2"><button disabled={busy} className="btn btn-secondary"><ShieldPlus size={15} />{busyAction === 'account' ? 'Creating account…' : `Create ${adminForm.role}`}</button></div>
              </form>
            </Card> : <Card title="Workspace access is locked" subtitle="Verify and activate this barangay before creating local administrator or staff accounts."><p className="p-5 text-sm leading-6 text-slate-600">Once verified and active, you can create the barangay’s first administrator and prepare its portal for resident registration.</p></Card>}
            <Card title={`Registered barangay team (${workspaceUsers.length})`} subtitle={`Administrators and staff accounts assigned to ${selected.name}.`}>
              {workspaceUsersLoading ? <p className="p-5 text-sm text-slate-500">Loading registered accounts…</p>
                : workspaceUsersError ? <p className="p-5 text-sm text-rose-700">{workspaceUsersError}</p>
                  : workspaceUsers.length === 0 ? <p className="p-5 text-sm text-slate-500">No administrator or staff accounts are registered in this barangay yet.</p>
                    : <ul className="divide-y divide-slate-100">
                      {workspaceUsers.map((user) => (
                        <li key={user.id} className="space-y-3 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><Users size={16} /></span>
                              <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{user.name}</span><span className="block truncate text-xs text-slate-500">{user.email}</span></span>
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{user.role === 'admin' ? 'Barangay admin' : 'Staff'}</span>
                              <button type="button" disabled={busy} onClick={() => startEditingTeamUser(user)} className="btn btn-secondary px-2.5 py-2" aria-label={`Edit ${user.name}`}><Pencil size={14} /><span className="sr-only">Edit</span></button>
                              <button type="button" disabled={busy} onClick={() => { setDeleteConfirmationId(user.id); setEditingTeamUser(null) }} className="btn btn-secondary px-2.5 py-2 text-rose-700" aria-label={`Delete ${user.name}`}><Trash2 size={14} /><span className="sr-only">Delete</span></button>
                            </div>
                          </div>
                          {editingTeamUser?.id === user.id && <form noValidate onSubmit={(event) => void saveTeamUser(event)} className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2">
                            <label className="field-label">Full name<input required maxLength={255} value={teamForm.name} onChange={(event) => setTeamForm({ ...teamForm, name: event.target.value })} className="input mt-1.5" /></label>
                            <label className="field-label">Role<select value={teamForm.role} onChange={(event) => setTeamForm({ ...teamForm, role: event.target.value as 'admin' | 'staff' })} className="input mt-1.5"><option value="admin">Barangay admin</option><option value="staff">Staff</option></select></label>
                            <label className="field-label">Email<input required type="email" value={teamForm.email} onChange={(event) => setTeamForm({ ...teamForm, email: event.target.value })} className="input mt-1.5" /></label>
                            <label className="field-label">New password <span className="font-normal text-slate-400">(optional)</span><input minLength={8} type="password" autoComplete="new-password" value={teamForm.password} onChange={(event) => setTeamForm({ ...teamForm, password: event.target.value })} className="input mt-1.5" placeholder="Leave blank to keep current" /></label>
                            <div className="flex flex-wrap gap-2 sm:col-span-2"><button disabled={busy} className="btn btn-primary"><Save size={14} />{busyAction === 'team' ? 'Saving…' : 'Save changes'}</button><button type="button" disabled={busy} onClick={() => setEditingTeamUser(null)} className="btn btn-secondary"><X size={14} />Cancel</button></div>
                          </form>}
                          {deleteConfirmationId === user.id && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                            <p className="min-w-0 flex-1 text-sm text-rose-800">Delete this account? Accounts with existing barangay records or the barangay’s last administrator cannot be deleted.</p>
                            <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void deleteTeamUser(user)} className="btn btn-secondary text-rose-700">{busyAction === 'deleteTeam' ? 'Deleting…' : 'Confirm delete'}</button><button type="button" disabled={busy} onClick={() => setDeleteConfirmationId(null)} className="btn btn-secondary">Cancel</button></div>
                          </div>}
                        </li>
                      ))}
                    </ul>}
            </Card>
          </div>
        ) : <Card title="Select a barangay"><p className="p-5 text-sm text-slate-500">Choose a location from the barangay list.</p></Card>}
      </div>
    </div>
  )
}
