import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FilePlus2, FileText, PencilLine, Plus, ScrollText, Trash2, X } from 'lucide-react'
import { Alert, Card, EmptyState, Spinner } from '../../components/ui'
import {
  createDocumentType,
  deleteDocumentType,
  getDocumentTypes,
  updateDocumentType,
} from '../../shared/api'
import type { DocumentType } from '../../shared/api'

const defaultBodyTemplate = `TO WHOM IT MAY CONCERN:

This is to certify that [resident_name], a resident of [barangay_name], [barangay_municipality], Bulacan, has requested a [document_name].

This certification is issued upon request for the purpose of: [purpose].

Issued this [date] at [barangay_name], [barangay_municipality], Bulacan.`

const placeholders = '[resident_name], [document_name], [purpose], [barangay_name], [barangay_municipality], [resident_address], [date]'

export default function DocumentTypesPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bodyTemplate, setBodyTemplate] = useState(defaultBodyTemplate)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editBodyTemplate, setEditBodyTemplate] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const documentTypesQuery = useQuery({
    queryKey: ['admin', 'document-types'],
    queryFn: getDocumentTypes,
  })

  const createMutation = useMutation({
    mutationFn: createDocumentType,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'document-types'] })
      setName('')
      setDescription('')
      setBodyTemplate(defaultBodyTemplate)
      setMessage(`${created.name} is now available for resident requests.`)
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : 'Could not add this document type.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description: string; body_template: string } }) =>
      updateDocumentType(id, data),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'document-types'] })
      setEditingId(null)
      setEditName('')
      setEditDescription('')
      setEditBodyTemplate('')
      setMessage(`${updated.name} was updated.`)
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : 'Could not update this document type.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentType,
    onSuccess: async (_, deletedId) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'document-types'] })
      if (editingId === deletedId) setEditingId(null)
      setMessage('Document type deleted.')
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : 'Could not delete this document type.'),
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      body_template: bodyTemplate.trim(),
    })
  }

  function beginEdit(documentType: DocumentType) {
    setEditingId(documentType.id)
    setEditName(documentType.name)
    setEditDescription(documentType.description ?? '')
    setEditBodyTemplate(documentType.body_template ?? defaultBodyTemplate)
    setError('')
    setMessage('')
  }

  function saveEdit(id: number) {
    setError('')
    setMessage('')
    updateMutation.mutate({
      id,
      data: {
        name: editName.trim(),
        description: editDescription.trim(),
        body_template: editBodyTemplate.trim(),
      },
    })
  }

  if (documentTypesQuery.isPending) return <Spinner label="Loading document types…" />
  if (documentTypesQuery.error) {
    const loadError = documentTypesQuery.error instanceof Error
      ? documentTypesQuery.error.message
      : 'Could not load document types.'
    return <Alert tone="error">{loadError}</Alert>
  }

  const documentTypes = documentTypesQuery.data

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-12 -top-24 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-medium text-blue-100">
          <ScrollText size={13} /> Service catalog
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Document types</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Manage request types and edit the plain-text body used in the generated PDF.
        </p>
        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-blue-100">
          <FileText size={14} />
          {documentTypes.length} active document type{documentTypes.length === 1 ? '' : 's'}
        </div>
      </section>

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card title="Add a document type" subtitle="Create the resident request option and PDF body." padded>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="field-label">
              Document name
              <input required maxLength={255} className="input mt-1.5" placeholder="e.g. Barangay Clearance" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field-label">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <textarea maxLength={2000} rows={3} className="input mt-1.5 resize-y" placeholder="Briefly explain this document." value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <label className="field-label">
              Generated document body
              <textarea required maxLength={20000} rows={9} className="input mt-1.5 resize-y font-mono text-xs leading-5" value={bodyTemplate} onChange={(event) => setBodyTemplate(event.target.value)} />
              <span className="mt-1 block text-xs font-normal leading-5 text-slate-400">Available placeholders: {placeholders}. Plain text only.</span>
            </label>
            <button type="submit" disabled={createMutation.isPending || !name.trim() || !bodyTemplate.trim()} className="btn btn-primary w-full py-2.5">
              <Plus size={16} />{createMutation.isPending ? 'Adding document type…' : 'Add document type'}
            </button>
          </form>
        </Card>

        <Card title="Available to residents" subtitle="Edits are saved to this barangay’s document catalog." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{documentTypes.length} total</span>}>
          {documentTypes.length === 0 ? (
            <EmptyState title="Your catalog is empty" hint="Add the first document type to let residents submit requests." />
          ) : (
            <div className="divide-y divide-slate-100">
              {documentTypes.map((documentType) => (
                <article key={documentType.id} className="flex min-w-0 items-start gap-3.5 px-4 py-4 transition hover:bg-slate-50/70 sm:px-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"><FilePlus2 size={18} /></span>
                  {editingId === documentType.id ? (
                    <div className="min-w-0 flex-1 space-y-3">
                      <label className="field-label">Document name<input className="input mt-1.5" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={255} /></label>
                      <label className="field-label">Description<textarea className="input mt-1.5 resize-y" rows={3} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={2000} /></label>
                      <label className="field-label">
                        Generated document body
                        <textarea className="input mt-1.5 resize-y font-mono text-xs leading-5" rows={9} value={editBodyTemplate} onChange={(event) => setEditBodyTemplate(event.target.value)} maxLength={20000} />
                        <span className="mt-1 block text-xs font-normal leading-5 text-slate-400">Available placeholders: {placeholders}. Plain text only.</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" disabled={updateMutation.isPending || !editName.trim() || !editBodyTemplate.trim()} onClick={() => saveEdit(documentType.id)} className="btn btn-primary btn-sm"><PencilLine size={14} />Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="btn btn-soft btn-sm"><X size={14} />Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-slate-800">{documentType.name}</h2>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{documentType.description || 'No description provided.'}</p>
                        <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-slate-400">{documentType.body_template || 'Default template will be used when this document is approved.'}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button type="button" onClick={() => beginEdit(documentType)} className="btn btn-soft btn-sm"><PencilLine size={14} />Edit</button>
                        <button type="button" onClick={() => { if (window.confirm(`Delete "${documentType.name}"? This cannot be undone.`)) deleteMutation.mutate(documentType.id) }} className="btn btn-danger-soft btn-sm"><Trash2 size={14} />Delete</button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
