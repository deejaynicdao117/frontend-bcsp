import { useEffect, useState } from 'react'
import { Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Alert, Card } from '../ui'

export type Announcement = {
  id: number
  title: string
  body: string
  type: string
  severity: string
  status: string
  location: string | null
  published_at?: string | null
}

type AnnouncementForm = {
  title: string
  body: string
  type: string
  severity: string
  status: string
  location: string
}

type AnnouncementApi = {
  get: () => Promise<{ data: Announcement[] }>
  create: (data: AnnouncementForm) => Promise<unknown>
  update: (id: number, data: AnnouncementForm) => Promise<unknown>
  remove: (id: number) => Promise<unknown>
}

const emptyForm: AnnouncementForm = {
  title: '',
  body: '',
  type: 'announcement',
  severity: 'info',
  status: 'draft',
  location: '',
}

export default function AnnouncementManager({ api }: { api: AnnouncementApi }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await api.get()
    setAnnouncements(response.data)
  }

  useEffect(() => {
    let active = true
    api.get()
      .then((response) => { if (active) setAnnouncements(response.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load announcements.')
      })
    return () => { active = false }
  }, [api.get])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (editingId === null) {
        await api.create(form)
        setMessage(form.status === 'published'
          ? 'Announcement published. Residents were notified and email delivery was started.'
          : 'Announcement draft saved.')
      } else {
        await api.update(editingId, form)
        setMessage('Announcement updated.')
      }
      resetForm()
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save announcement.')
    } finally {
      setBusy(false)
    }
  }

  function edit(item: Announcement) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      body: item.body,
      type: item.type,
      severity: item.severity,
      status: item.status,
      location: item.location ?? '',
    })
    setError('')
    setMessage('')
  }

  async function remove(item: Announcement) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.remove(item.id)
      if (editingId === item.id) resetForm()
      setMessage('Announcement deleted.')
      await load()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete announcement.')
    } finally {
      setBusy(false)
    }
  }

  function setField<Key extends keyof AnnouncementForm>(key: Key, value: AnnouncementForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <Card title="Announcements" subtitle="Create, edit, publish, archive, or remove public notices. Publishing notifies residents and sends email."
      action={<span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{announcements.length} total</span>}>
      {(error || message) && (
        <div className="px-5 pt-4">
          <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
            {error || message}
          </Alert>
        </div>
      )}

      <form onSubmit={(event) => void submit(event)} className="grid gap-3 border-b border-slate-100 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          {editingId === null ? <Plus size={15} /> : <Pencil size={15} />}
          {editingId === null ? 'Create announcement' : 'Edit announcement'}
        </div>
        <input required maxLength={255} value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Announcement title" className="input" />
        <textarea required maxLength={30000} value={form.body} onChange={(event) => setField('body', event.target.value)} placeholder="Write the message for residents" className="input resize-y" rows={4} />
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={form.type} onChange={(event) => setField('type', event.target.value)} className="input" aria-label="Announcement type">
            <option value="announcement">Announcement</option>
            <option value="advisory">Advisory</option>
            <option value="emergency">Emergency</option>
            <option value="evacuation_protocol">Evacuation protocol</option>
          </select>
          <select value={form.severity} onChange={(event) => setField('severity', event.target.value)} className="input" aria-label="Announcement severity">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
          <select value={form.status} onChange={(event) => setField('status', event.target.value)} className="input" aria-label="Announcement status">
            <option value="draft">Save as draft</option>
            <option value="published">Publish now</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <input maxLength={255} value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder="Affected area (optional)" className="input" />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy || !form.title.trim() || !form.body.trim()} className="btn btn-primary btn-sm">
            {editingId === null ? <Megaphone size={14} /> : <Pencil size={14} />}
            {busy ? 'Saving…' : editingId === null ? 'Save announcement' : 'Save changes'}
          </button>
          {editingId !== null && (
            <button type="button" disabled={busy} onClick={resetForm} className="btn btn-secondary btn-sm">
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>
        <p className="text-xs leading-5 text-slate-500">Residents receive an in-portal notification and email when a draft is published.</p>
      </form>

      {announcements.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">No announcements yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {announcements.map((item) => (
            <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <span className={`badge ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 capitalize">{item.type} · {item.severity}{item.location ? ` · ${item.location}` : ''}</p>
                <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm leading-5 text-slate-600">{item.body}</p>
                {item.published_at && <p className="mt-2 text-[11px] text-slate-400">Published {new Date(item.published_at).toLocaleString()}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" disabled={busy} onClick={() => edit(item)} className="btn btn-soft btn-sm" aria-label={`Edit ${item.title}`}>
                  <Pencil size={14} /> Edit
                </button>
                <button type="button" disabled={busy} onClick={() => void remove(item)} className="btn btn-danger-soft btn-sm" aria-label={`Delete ${item.title}`}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}
