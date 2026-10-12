import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FilePlus2, FileText, Plus, ScrollText } from 'lucide-react'
import { Alert, Card, EmptyState, Spinner } from '../../components/ui'
import { createDocumentType, getDocumentTypes } from '../../shared/api'

export default function DocumentTypesPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const documentTypesQuery = useQuery({
    queryKey: ['admin', 'document-types'],
    queryFn: getDocumentTypes,
  })

  const createMutation = useMutation({
    mutationFn: createDocumentType,
    onSuccess: async (createdDocumentType) => {
      queryClient.setQueryData(
        ['admin', 'document-types'],
        (current: typeof documentTypesQuery.data) => current
          ? [...current, createdDocumentType]
          : [createdDocumentType],
      )
      await queryClient.invalidateQueries({ queryKey: ['admin', 'document-types'] })
      setName('')
      setDescription('')
      setMessage(`${createdDocumentType.name} is now available for resident requests.`)
    },
    onError: (createError) => {
      setError(createError instanceof Error ? createError.message : 'Could not add this document type.')
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
    })
  }

  if (documentTypesQuery.isPending) {
    return <Spinner label="Loading document types…" />
  }

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
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-medium text-blue-100">
          <ScrollText size={13} /> Service catalog
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Document types</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Configure the barangay documents residents can request. New types appear in the resident request form immediately.
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
        <Card title="Add a document type" subtitle="Create a request option for residents." padded>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="field-label">
              Document name
              <input
                required
                maxLength={255}
                className="input mt-1.5"
                placeholder="e.g. Barangay Clearance"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="field-label">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                maxLength={2000}
                rows={4}
                className="input mt-1.5 resize-y"
                placeholder="Briefly explain what this document is used for."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <button type="submit" disabled={createMutation.isPending || !name.trim()} className="btn btn-primary w-full py-2.5">
              <Plus size={16} />
              {createMutation.isPending ? 'Adding document type…' : 'Add document type'}
            </button>
            <p className="text-xs leading-5 text-slate-400">
              Existing resident requests keep their current document type if you add another option.
            </p>
          </form>
        </Card>

        <Card
          title="Available to residents"
          subtitle="These options appear in the document request form."
          action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{documentTypes.length} total</span>}
        >
          {documentTypes.length === 0 ? (
            <EmptyState title="Your catalog is empty" hint="Add the first document type to let residents submit requests." />
          ) : (
            <div className="divide-y divide-slate-100">
              {documentTypes.map((documentType) => (
                <article key={documentType.id} className="flex items-start gap-3.5 px-5 py-4 transition hover:bg-slate-50/70">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
                    <FilePlus2 size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-slate-800">{documentType.name}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {documentType.description || 'No description provided.'}
                    </p>
                  </div>
                  <span className="badge shrink-0 bg-emerald-50 text-emerald-700 ring-emerald-200/80">Available</span>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
