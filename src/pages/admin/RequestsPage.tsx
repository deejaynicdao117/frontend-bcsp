import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import RequestTable from '../../components/admin/RequestTable'
import { Alert, Card, PageHeader, Spinner } from '../../components/ui'
import { getAdminDocumentRequests } from '../../shared/api'

const requestStatuses = ['pending', 'under_review', 'approved', 'rejected', 'ready_for_pickup', 'released']

export default function RequestsPage() {
  const requestsQuery = useQuery({
    queryKey: ['admin', 'document-requests'],
    queryFn: getAdminDocumentRequests,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRequests = useMemo(() => {
    const requests = requestsQuery.data?.data ?? []
    const query = search.toLowerCase()

    return requests.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const searchText = `${item.tracking_number} ${item.user?.name ?? ''} ${item.document_type?.name ?? ''}`
        .toLowerCase()

      return matchesStatus && searchText.includes(query)
    })
  }, [requestsQuery.data, search, statusFilter])

  if (requestsQuery.isPending) return <Spinner label="Loading document requests…" />
  if (requestsQuery.error) {
    const message = requestsQuery.error instanceof Error
      ? requestsQuery.error.message
      : 'Unable to load document requests.'

    return <Alert tone="error">{message}</Alert>
  }

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
