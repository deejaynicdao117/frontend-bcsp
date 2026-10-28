import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, CheckCircle2, Eye, FileClock, FileText, Send, Sparkles, X } from 'lucide-react'
import { Alert, Card, StatusBadge } from '../../components/ui'
import {
  createResidentDocumentRequest,
  getResidentDocumentPreview,
  getDocumentTypes,
  getResidentDocumentRequests,
} from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DocumentRequest } from '../../shared/types'
import type { DocumentType } from '../../shared/api'

export default function ResidentRequestsPage() {
  const { session } = useSession()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [documentTypeId, setDocumentTypeId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      getResidentDocumentRequests(),
      getDocumentTypes(),
    ])
      .then(([requestsResult, typesResult]) => {
        if (!active) return
        setRequests(requestsResult.data)
        setDocumentTypes(typesResult)
        if (typesResult.length > 0) setDocumentTypeId(String(typesResult[0].id))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load your requests.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!previewUrl) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewUrl(null)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function loadResidentRequests() {
    const result = await getResidentDocumentRequests()
    setRequests(result.data)
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await createResidentDocumentRequest({
        document_type_id: Number(documentTypeId),
        purpose,
      })
      setPurpose('')
      await loadResidentRequests()
      setMessage('Your document request was submitted successfully.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit the request.')
    } finally {
      setBusy(false)
    }
  }

  async function previewDocument(requestId: number) {
    setError('')
    setPreviewLoadingId(requestId)
    try {
      const documentBlob = await getResidentDocumentPreview(requestId)
      setPreviewUrl(URL.createObjectURL(documentBlob))
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Unable to preview this document.')
    } finally {
      setPreviewLoadingId(null)
    }
  }

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const reviewCount = requests.filter((request) => request.status === 'under_review').length

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-16 bottom-[-7rem] -z-10 size-64 rounded-full border-[36px] border-white/[0.06]" />
        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-50">
              <Sparkles size={13} />
              Resident portal
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome, {session.user.name.split(' ')[0]}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
              Your local services in one place. Request documents and keep track of every update.
            </p>
          </div>
          <a
            href="#new-request"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Request a document
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-blue-100">
          <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} /> Secure resident access</span>
          <span className="hidden text-white/40 sm:inline">•</span>
          <span>Track your requests from submission to release</span>
        </div>
      </section>

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <ResidentMetric label="Total requests" value={requests.length} icon={FileText} tone="blue" hint="All your submissions" />
        <ResidentMetric label="Waiting in queue" value={pendingCount} icon={FileClock} tone="amber" hint="Received by the barangay" />
        <ResidentMetric label="Under review" value={reviewCount} icon={CheckCircle2} tone="violet" hint="Being processed by staff" />
      </section>

      <Card
        title="Request a barangay document"
        subtitle="Choose the document and tell us what you need it for. Staff will update the status as it is processed."
        padded
        className="scroll-mt-28"
      >
        <div id="new-request" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
              <FileText size={21} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">A simple, trackable process</h3>
            <ol className="mt-3 space-y-3 text-xs leading-5 text-slate-600">
              <li className="flex gap-2.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>Submit your document and purpose.</li>
              <li className="flex gap-2.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>Barangay staff review your request.</li>
              <li className="flex gap-2.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">3</span>Follow its status in your request history.</li>
            </ol>
          </div>

          <form onSubmit={submitRequest} className="grid content-start gap-4 sm:grid-cols-2">
          <label className="field-label">
            Document type
            <select
              required
              className="input mt-1.5"
              value={documentTypeId}
              onChange={(event) => setDocumentTypeId(event.target.value)}
              disabled={loading || documentTypes.length === 0}
            >
              <option value="" disabled>Select a document</option>
              {documentTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </label>

          <label className="field-label">
            Purpose
            <input
              required
              maxLength={1000}
              className="input mt-1.5"
              placeholder="For employment, school, etc."
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={busy || loading || documentTypes.length === 0} className="btn btn-primary w-full py-2.5 sm:w-auto">
              <Send size={15} />
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
            {documentTypes.length === 0 && !loading && (
              <p className="mt-2 text-xs text-amber-700">No document types are available yet. Please contact barangay staff.</p>
            )}
          </div>
          </form>
        </div>
      </Card>

      <Card
        title="Your request history"
        subtitle="See the latest status and staff remarks for each submission."
        action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{requests.length} request{requests.length === 1 ? '' : 's'}</span>}
      >
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading your requests…</p>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><FileText size={22} /></span>
            <p className="mt-4 text-sm font-semibold text-slate-800">No document requests yet</p>
            <p className="mt-1 text-sm text-slate-500">Your submitted requests and their progress will appear here.</p>
            <a href="#new-request" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
              Start a request <ArrowRight size={15} />
            </a>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Tracking number</th>
                  <th className="table-th">Document</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Remarks</th>
                  <th className="table-th">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/70">
                    <td className="table-td font-semibold text-blue-700">{request.tracking_number}</td>
                    <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
                    <td className="table-td max-w-52 text-slate-500">{request.purpose}</td>
                    <td className="table-td">
                      <StatusBadge status={request.status} />
                      {request.status === 'ready_for_pickup' && request.ready_for_pickup_at && (
                        <p className="mt-1 text-xs text-slate-500">Pickup: {formatRequestDate(request.ready_for_pickup_at)}</p>
                      )}
                      {request.status === 'released' && request.released_at && (
                        <p className="mt-1 text-xs text-slate-500">Released: {formatRequestDate(request.released_at)}</p>
                      )}
                    </td>
                    <td className="table-td max-w-56 text-slate-500">
                      {request.status === 'rejected' && request.rejection_reason
                        ? request.rejection_reason
                        : request.remarks || '—'}
                    </td>
                    <td className="table-td">
                      {request.generated_document_available && ['approved', 'ready_for_pickup', 'released'].includes(request.status) ? (
                        <button
                          type="button"
                          disabled={previewLoadingId === request.id}
                          onClick={() => void previewDocument(request.id)}
                          className="btn btn-secondary btn-sm whitespace-nowrap"
                        >
                          <Eye size={14} />
                          {previewLoadingId === request.id ? 'Loading…' : 'Preview only'}
                        </button>
                      ) : <span className="text-xs text-slate-400">Not available</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-3 sm:p-6"
          onClick={(event) => { if (event.target === event.currentTarget) setPreviewUrl(null) }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="document-preview-title" className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div>
                <h2 id="document-preview-title" className="text-sm font-semibold text-slate-900">Document preview</h2>
                <p className="mt-0.5 text-xs text-slate-500">Preview only. Printing and downloading are not provided in the resident portal.</p>
              </div>
              <button type="button" aria-label="Close document preview" onClick={() => setPreviewUrl(null)} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X size={18} />
              </button>
            </header>
            <iframe
              title="Read-only document preview"
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="min-h-0 flex-1 bg-slate-100"
            />
          </section>
        </div>
      )}
    </div>
  )
}

function formatRequestDate(date: string) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(`${date.slice(0, 10)}T00:00:00`))
}

function ResidentMetric({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string
  value: number
  icon: typeof FileText
  tone: 'blue' | 'amber' | 'violet'
  hint: string
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
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
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </article>
  )
}
