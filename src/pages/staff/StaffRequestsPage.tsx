import { useEffect, useState } from 'react'
import { ArrowRight, ClipboardList, Download, Search, ShieldCheck } from 'lucide-react'
import { Alert, Card, Spinner, StatusBadge } from '../../components/ui'
import {
  getStaffDocumentRequests,
  downloadStaffDocumentRequest,
  updateStaffDocumentRequest,
} from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DocumentRequest } from '../../shared/types'

const statuses = ['pending', 'under_review', 'approved', 'rejected', 'ready_for_pickup', 'released']

function statusLabel(status: string) {
  return ({ ready_for_pickup: 'Ready for pickup' } as Record<string, string>)[status] ?? status.replaceAll('_', ' ')
}

function localToday() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export default function StaffRequestsPage() {
  const { session } = useSession()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({})
  const [pickupDates, setPickupDates] = useState<Record<number, string>>({})
  const [releasedDates, setReleasedDates] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let active = true

    getStaffDocumentRequests()
      .then((result) => { if (active) setRequests(result.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load document requests.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  async function loadRequests() {
    const result = await getStaffDocumentRequests()
    setRequests(result.data)
  }

  async function updateStatus(request: DocumentRequest) {
    const status = selectedStatuses[request.id] ?? request.status
    const rejectionReason = rejectionReasons[request.id] ?? request.rejection_reason ?? ''
    const pickupDate = pickupDates[request.id] ?? request.ready_for_pickup_at ?? localToday()
    const releasedDate = releasedDates[request.id] ?? request.released_at ?? localToday()

    if (status === 'rejected' && !rejectionReason.trim()) {
      setError('Enter a reason before rejecting this request.')
      return
    }
    if (status === 'ready_for_pickup' && !pickupDate) {
      setError('Choose the ready-for-pickup date.')
      return
    }
    if (status === 'released' && !releasedDate) {
      setError('Choose the release date.')
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await updateStaffDocumentRequest(request.id, {
        status,
        ...(status === 'rejected' ? { rejection_reason: rejectionReason.trim() } : {}),
        ...(status === 'ready_for_pickup' ? { ready_for_pickup_at: pickupDate } : {}),
        ...(status === 'released' ? { released_at: releasedDate } : {}),
      })
      await loadRequests()
      setMessage(`Request ${request.tracking_number} was updated.`)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this request.')
    } finally {
      setBusy(false)
    }
  }

  async function downloadDocument(request: DocumentRequest) {
    setError('')
    setMessage('')
    setDownloadingId(request.id)

    try {
      await downloadStaffDocumentRequest(request.id, request.tracking_number)
      setMessage(`Printable draft for ${request.tracking_number} downloaded.`)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Unable to download the generated document.')
    } finally {
      setDownloadingId(null)
    }
  }

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const reviewCount = requests.filter((request) => request.status === 'under_review').length
  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const searchText = `${request.tracking_number} ${request.user?.name ?? ''} ${request.document_type?.name ?? ''}`
      .toLowerCase()

    return matchesStatus && searchText.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-6 py-7 text-slate-900 shadow-sm shadow-teal-950/5 sm:px-8 sm:py-9">
        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-emerald-200/45 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold text-teal-800">
              <ShieldCheck size={13} /> Service desk
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Request queue</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Welcome, {session.user.name}. Review incoming resident requests and keep each one moving.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500" /> Queue is live
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-3 border-t border-teal-900/10 pt-5">
          <QueueMetric label="Total requests" value={requests.length} />
          <QueueMetric label="Awaiting action" value={pendingCount} />
          <QueueMetric label="In review" value={reviewCount} />
        </div>
      </section>

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <Card className="border-t-2 border-t-teal-600"
        title="Resident document requests"
        subtitle="Review the request details, select a status, and save your update."
        action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{filteredRequests.length} shown</span>}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search requests"
              className="input pl-9"
              placeholder="Search tracking number, resident, document…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter requests by status"
            className="input sm:w-52"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
          </select>
        </div>
        {loading ? (
          <Spinner label="Loading requests…" />
        ) : filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><ClipboardList size={22} /></span>
            <p className="mt-4 text-sm font-semibold text-slate-800">{requests.length === 0 ? 'The queue is clear' : 'No matching requests'}</p>
            <p className="mt-1 text-sm text-slate-500">{requests.length === 0 ? 'New resident submissions will appear here.' : 'Try adjusting the search or status filter.'}</p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Tracking no.</th>
                  <th className="table-th">Resident</th>
                  <th className="table-th">Document</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Current status</th>
                  <th className="table-th">Staff actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="table-row">
                    <td className="table-td font-semibold whitespace-nowrap text-blue-700">{request.tracking_number}</td>
                    <td className="table-td font-medium text-slate-800">{request.user?.name ?? 'Resident'}</td>
                    <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
                    <td className="table-td max-w-48 text-slate-500">{request.purpose}</td>
                    <td className="table-td"><StatusBadge status={request.status} /></td>
                    <td className="table-td">
                      <div className="flex min-w-80 flex-wrap items-center gap-2">
                        <select
                          aria-label={`Status for ${request.tracking_number}`}
                          className="input py-1.5 text-xs"
                          value={selectedStatuses[request.id] ?? request.status}
                          onChange={(event) => setSelectedStatuses((current) => ({ ...current, [request.id]: event.target.value }))}
                        >
                          {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                        </select>
                        {(selectedStatuses[request.id] ?? request.status) === 'rejected' && (
                          <input
                            aria-label={`Rejection reason for ${request.tracking_number}`}
                            className="input min-w-48 py-1.5 text-xs"
                            placeholder="Reason for rejection"
                            maxLength={1000}
                            value={rejectionReasons[request.id] ?? request.rejection_reason ?? ''}
                            onChange={(event) => setRejectionReasons((current) => ({ ...current, [request.id]: event.target.value }))}
                          />
                        )}
                        {(selectedStatuses[request.id] ?? request.status) === 'ready_for_pickup' && (
                          <input
                            aria-label={`Pickup date for ${request.tracking_number}`}
                            className="input min-w-36 py-1.5 text-xs"
                            type="date"
                            value={pickupDates[request.id] ?? request.ready_for_pickup_at ?? localToday()}
                            onChange={(event) => setPickupDates((current) => ({ ...current, [request.id]: event.target.value }))}
                          />
                        )}
                        {(selectedStatuses[request.id] ?? request.status) === 'released' && (
                          <input
                            aria-label={`Release date for ${request.tracking_number}`}
                            className="input min-w-36 py-1.5 text-xs"
                            type="date"
                            value={releasedDates[request.id] ?? request.released_at ?? localToday()}
                            onChange={(event) => setReleasedDates((current) => ({ ...current, [request.id]: event.target.value }))}
                          />
                        )}
                        <button type="button" disabled={busy} onClick={() => updateStatus(request)} className="btn btn-soft btn-sm">
                          {busy ? 'Saving…' : 'Save'}
                          {!busy && <ArrowRight size={13} />}
                        </button>
                        {request.generated_document_available && request.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={downloadingId === request.id}
                            onClick={() => void downloadDocument(request)}
                            className="btn btn-secondary btn-sm"
                            title="Download and print the approved document draft"
                          >
                            <Download size={14} />
                            {downloadingId === request.id ? 'Preparing…' : 'Print PDF'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function QueueMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value.toLocaleString()}</p>
    </div>
  )
}
