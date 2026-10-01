import { useEffect, useState } from 'react'
import { CheckCircle2, FileClock, FileText } from 'lucide-react'
import { Alert, Card, MetricCard, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DocumentRequest, ListResponse } from '../../shared/types'

const statuses = ['pending', 'under_review', 'approved', 'rejected', 'ready_for_release', 'completed']

export default function StaffRequestsPage() {
  const { session } = useSession()
  const token = session.token
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    apiRequest<ListResponse<DocumentRequest>>('/staff/document-requests', { token })
      .then((result) => { if (active) setRequests(result.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load document requests.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [token])

  async function loadRequests() {
    const result = await apiRequest<ListResponse<DocumentRequest>>('/staff/document-requests', { token })
    setRequests(result.data)
  }

  async function updateStatus(request: DocumentRequest) {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/staff/document-requests/${request.id}`, {
        token,
        method: 'PUT',
        body: { status: selectedStatuses[request.id] ?? request.status },
      })
      await loadRequests()
      setMessage(`Request ${request.tracking_number} was updated.`)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this request.')
    } finally {
      setBusy(false)
    }
  }

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const reviewCount = requests.filter((request) => request.status === 'under_review').length

  return (
    <>
      <PageHeader
        eyebrow="Signed in as staff"
        title="Staff workspace"
        description={`Welcome, ${session.user.name}. Review and process resident document requests.`}
        action={
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-200/80">
            <CheckCircle2 size={12} />
            Staff role verified
          </span>
        }
      />

      {(error || message) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setMessage('') }}>
          {error || message}
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="All service requests" value={requests.length} icon={FileText} />
        <MetricCard label="Pending" value={pendingCount} icon={FileClock} />
        <MetricCard label="Under review" value={reviewCount} icon={CheckCircle2} />
      </section>

      <Card
        title="Resident document requests"
        subtitle="Live records from the barangay portal"
        action={<span className="text-xs text-slate-400">{requests.length} record{requests.length === 1 ? '' : 's'}</span>}
      >
        {loading ? (
          <Spinner label="Loading requests…" />
        ) : requests.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No document requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Tracking no.</th>
                  <th className="table-th">Resident</th>
                  <th className="table-th">Document</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Update status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/70">
                    <td className="table-td font-medium whitespace-nowrap text-slate-900">{request.tracking_number}</td>
                    <td className="table-td">{request.user?.name ?? 'Resident'}</td>
                    <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
                    <td className="table-td max-w-48 text-slate-500">{request.purpose}</td>
                    <td className="table-td"><StatusBadge status={request.status} /></td>
                    <td className="table-td">
                      <div className="flex min-w-56 items-center gap-2">
                        <select
                          aria-label={`Status for ${request.tracking_number}`}
                          className="input py-1.5 text-xs"
                          value={selectedStatuses[request.id] ?? request.status}
                          onChange={(event) => setSelectedStatuses((current) => ({ ...current, [request.id]: event.target.value }))}
                        >
                          {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                        </select>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(request)}
                          className="btn btn-soft btn-sm"
                        >
                          Save
                        </button>
                      </div>
                    </td>
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
