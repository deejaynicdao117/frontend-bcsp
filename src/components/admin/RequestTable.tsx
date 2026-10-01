import { EmptyState, StatusBadge } from '../ui'
import type { DocumentRequest } from '../../shared/types'
import { formatDate } from '../../shared/format'

export default function RequestTable({ requests }: { requests: DocumentRequest[] }) {
  if (requests.length === 0) return <EmptyState title="No document requests found" hint="New activity will appear here." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="table-head">
          <tr>
            <th className="table-th">Tracking no.</th>
            <th className="table-th">Resident</th>
            <th className="table-th">Document</th>
            <th className="table-th">Submitted</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((request) => (
            <tr key={request.id} className="transition hover:bg-slate-50/70">
              <td className="table-td font-medium text-slate-900">{request.tracking_number}</td>
              <td className="table-td">
                <p className="font-medium text-slate-800">{request.user?.name ?? 'Resident'}</p>
                <p className="mt-0.5 text-xs text-slate-400">{request.user?.email ?? '—'}</p>
              </td>
              <td className="table-td">{request.document_type?.name ?? 'Document'}</td>
              <td className="table-td text-xs whitespace-nowrap text-slate-500">{formatDate(request.created_at)}</td>
              <td className="table-td"><StatusBadge status={request.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
