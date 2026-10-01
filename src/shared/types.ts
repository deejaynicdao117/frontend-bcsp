export type Role = 'admin' | 'staff' | 'resident'

export type ListResponse<T> = { data: T[] }

export type DataResponse<T> = { data: T }

export type PortalUser = {
  id: number
  name: string
  email: string
  role: Role
}

export type DocumentRequest = {
  id: number
  tracking_number: string
  purpose: string
  status: string
  remarks: string | null
  created_at: string
  user?: { id: number; name: string; email?: string }
  document_type?: { id: number; name: string }
  reviewer?: { id: number; name: string } | null
}

export type DashboardOverview = {
  total_users: number
  admin_count: number
  staff_count: number
  resident_count: number
  total_requests: number
  pending_requests: number
  requests_this_month: number
  recent_requests: DocumentRequest[]
}

export type ReportsData = {
  requests_by_status: Array<{ status: string; total: number }>
  monthly_requests: Array<{ month: string; total: number }>
  total_requests: number
}

export type PortalNotification = {
  id: number
  title: string
  message: string
  status: string
  created_at: string | null
}
