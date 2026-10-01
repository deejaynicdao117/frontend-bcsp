import { useEffect, useState } from 'react'
import { CheckCircle2, FileClock, FileText, Send } from 'lucide-react'
import { Alert, Card, MetricCard, PageHeader, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DocumentRequest, ListResponse } from '../../shared/types'

type DocumentType = { id: number; name: string; description?: string | null }

export default function ResidentRequestsPage() {
  const { session } = useSession()
  const token = session.token
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [documentTypeId, setDocumentTypeId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      apiRequest<ListResponse<DocumentRequest>>('/resident/document-requests', { token }),
      apiRequest<DocumentType[]>('/document-types', { token }),
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
  }, [token])

  async function loadResidentRequests() {
    const result = await apiRequest<ListResponse<DocumentRequest>>('/resident/document-requests', { token })
    setRequests(result.data)
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await apiRequest('/resident/document-requests', {
        token,
        method: 'POST',
        body: { document_type_id: Number(documentTypeId), purpose },
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

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const reviewCount = requests.filter((request) => request.status === 'under_review').length

  return (
    <>
      <PageHeader
        eyebrow="Signed in as resident"
        title="Resident services"
        description={`Welcome, ${session.user.name}. Submit requests and follow their progress here.`}
        action={
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-200/80">
            <CheckCircle2 size={12} />
            Resident role verified
          </span>
        }
      />

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="My requests" value={requests.length} icon={FileText} />
        <MetricCard label="Pending" value={pendingCount} icon={FileClock} />
        <MetricCard label="Under review" value={reviewCount} icon={CheckCircle2} />
      </section>

      <Card title="Request a barangay document" subtitle="Choose a document and tell us what you need it for." padded>
        <form onSubmit={submitRequest} className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
          <label className="field-label">
            Document type
            <select
              required
              className="input mt-1.5"
              value={documentTypeId}
              onChange={(event) => setDocumentTypeId(event.target.value)}
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

          <button type="submit" disabled={busy || documentTypes.length === 0} className="btn btn-primary md:mb-0.5">
            <Send size={15} />
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </Card>

      <Card
        title="My request history"
        subtitle="Live information from the barangay portal database"
        action={<span className="text-xs text-slate-400">{requests.length} record{requests.length === 1 ? '' : 's'}</span>}
      >
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading your requests…</p>
        ) : requests.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">You have not submitted any requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Tracking number</th>
                  <th className="table-th">Document</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/70">
                    <td className="table-td font-medium text-slate-900">{request.tracking_number}</td>
                    <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
                    <td className="table-td max-w-52 text-slate-500">{request.purpose}</td>
                    <td className="table-td"><StatusBadge status={request.status} /></td>
                    <td className="table-td text-slate-500">{request.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
