import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import RequestTable from '../../components/admin/RequestTable'
import { Alert, Card, PageHeader, Spinner } from '../../components/ui'
import { apiRequest } from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { DocumentRequest, ListResponse } from '../../shared/types'

const requestStatuses = ['pending', 'under_review', 'approved', 'rejected', 'ready_for_release', 'completed']

export default function RequestsPage() {
  const { session } = useSession()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<ListResponse<DocumentRequest>>('/admin/document-requests', { token: session.token })
      .then((result) => { if (active) setRequests(result.data) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load document requests.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session.token])

  const filteredRequests = useMemo(() => requests.filter((item) => {
    const query = search.toLowerCase()
    return (statusFilter === 'all' || item.status === statusFilter)
      && (`${item.tracking_number} ${item.user?.name ?? ''} ${item.document_type?.name ?? ''}`.toLowerCase().includes(query))
  }), [requests, search, statusFilter])

  if (loading) return <Spinner label="Loading document requests…" />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resident services"
        title="Document requests"
        description="Search and filter requests submitted by residents."
      />

      <Card title={`All requests (${filteredRequests.length})`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search requests"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tracking number, resident, document…"
              className="input pl-9"
            />
          </label>
          <select
            aria-label="Filter requests by status"
            className="input sm:w-48"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {requestStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <RequestTable requests={filteredRequests} />
      </Card>
    </div>
  )
}
