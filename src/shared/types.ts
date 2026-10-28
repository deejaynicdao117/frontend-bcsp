export type Role = 'platform_admin' | 'admin' | 'staff' | 'resident'

export type ListResponse<T> = { data: T[] }

export type DataResponse<T> = { data: T }

export type PortalUser = {
  id: number
  name: string
  email: string
  role: Role
  barangay_id?: number | null
  barangay?: {
    id: number
    name: string
    municipality: string
    province: string
    logo_path?: string | null
    logo_url?: string | null
    primary_color?: string
  } | null
}

export type DocumentRequest = {
  id: number
  tracking_number: string
  purpose: string
  status: string
  remarks: string | null
  rejection_reason?: string | null
  ready_for_pickup_at?: string | null
  released_at?: string | null
  created_at: string
  generated_document_available?: boolean
  generated_document_at?: string | null
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
