import { apiClient } from './client'
import type {
  DashboardOverview,
  DocumentRequest,
  PortalNotification,
  PortalUser,
  ReportsData,
} from '../types'

export type DataResponse<T> = {
  data: T
}

export type ListResponse<T> = {
  data: T[]
}

export type DocumentType = {
  id: number
  name: string
  description: string | null
  body_template: string | null
  created_at?: string
}

export async function getDocumentTypes(): Promise<DocumentType[]> {
  const response = await apiClient.get<DocumentType[]>('/document-types')
  return response.data
}

export async function createDocumentType(data: {
  name: string
  description?: string
  body_template?: string
}): Promise<DocumentType> {
  const response = await apiClient.post<DocumentType>('/admin/document-types', data)
  return response.data
}

export async function updateDocumentType(
  id: number,
  data: { name: string; description?: string; body_template?: string },
): Promise<DocumentType> {
  const response = await apiClient.put<DocumentType>(`/admin/document-types/${id}`, data)
  return response.data
}

export async function deleteDocumentType(id: number): Promise<void> {
  await apiClient.delete(`/admin/document-types/${id}`)
}

export async function getAdminUsers(): Promise<ListResponse<PortalUser>> {
  const response = await apiClient.get<ListResponse<PortalUser>>('/admin/users')
  return response.data
}

export async function createAdminUser(data: {
  name: string
  email: string
  password: string
  role: PortalUser['role']
}): Promise<DataResponse<PortalUser>> {
  const response = await apiClient.post<DataResponse<PortalUser>>('/admin/users', data)
  return response.data
}

export async function updateAdminUser(
  id: number,
  data: Pick<PortalUser, 'name' | 'email' | 'role'>,
): Promise<DataResponse<PortalUser>> {
  const response = await apiClient.put<DataResponse<PortalUser>>(`/admin/users/${id}`, data)
  return response.data
}

export async function deleteAdminUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}

export async function getAdminDashboard(): Promise<DataResponse<DashboardOverview>> {
  const response = await apiClient.get<DataResponse<DashboardOverview>>('/admin/dashboard')
  return response.data
}

export async function getPlatformDashboard(): Promise<DataResponse<PlatformDashboard>> {
  const response = await apiClient.get<DataResponse<PlatformDashboard>>('/platform/dashboard')
  return response.data
}

export async function getPlatformReports(): Promise<DataResponse<PlatformReports>> {
  const response = await apiClient.get<DataResponse<PlatformReports>>('/platform/reports')
  return response.data
}

export async function getPlatformSettings(): Promise<DataResponse<PlatformSettings>> {
  const response = await apiClient.get<DataResponse<PlatformSettings>>('/platform/settings')
  return response.data
}

export async function updatePlatformSettings(data: PlatformSettings): Promise<DataResponse<PlatformSettings>> {
  const response = await apiClient.patch<DataResponse<PlatformSettings>>('/platform/settings', data)
  return response.data
}

export async function getAdminDocumentRequests(): Promise<ListResponse<DocumentRequest>> {
  const response = await apiClient.get<ListResponse<DocumentRequest>>('/admin/document-requests')
  return response.data
}

export async function getAdminReports(): Promise<DataResponse<ReportsData>> {
  const response = await apiClient.get<DataResponse<ReportsData>>('/admin/reports')
  return response.data
}

export async function getAdminNotifications(): Promise<ListResponse<PortalNotification>> {
  const response = await apiClient.get<ListResponse<PortalNotification>>('/admin/notifications')
  return response.data
}

export type BarangayWorkspace = {
  id: number
  psgc_code: string
  name: string
  municipality: string
  province: string
  logo_path: string | null
  logo_url: string | null
  contact_email: string | null
  contact_phone: string | null
  office_address: string | null
  primary_color: string
  is_active: boolean
  onboarding_status: 'unrequested' | 'pending' | 'approved' | 'declined'
  onboarding_reviewed_at: string | null
  onboarding_reviewed_by: number | null
  onboarding_reviewer?: { id: number; name: string } | null
}

export type PlatformBarangaysPage = ListResponse<BarangayWorkspace> & {
  meta: { current_page: number; last_page: number; per_page: number; total: number }
  status_counts: Record<BarangayWorkspace['onboarding_status'], number>
}

export type BarangayWorkspaceUser = {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
  created_at?: string
}

export type PlatformDashboard = {
  total_barangays: number
  active_barangays: number
  pending_onboarding: number
  total_users: number
  resident_count: number
  total_requests: number
  pending_requests: number
  requests_this_month: number
}

export type PlatformReports = {
  total_barangays: number
  active_barangays: number
  pending_onboarding: number
  resident_registrations: number
  resident_registrations_this_month: number
  total_requests: number
  closed_request_percent: number
  requests_by_status: Array<{ status: string; total: number }>
  monthly_requests: Array<{ month: string; total: number }>
}

export type PlatformSettings = {
  portal_name: string
  support_email: string
  primary_color: string
  welcome_message: string
  allow_new_registrations: boolean
  emergency_notices: boolean
  public_announcements: boolean
  email_verification: boolean
}

export async function getPlatformBarangays(params: {
  page?: number
  search?: string
  province?: string
  status?: 'all' | BarangayWorkspace['onboarding_status']
} = {}): Promise<PlatformBarangaysPage> {
  const response = await apiClient.get<PlatformBarangaysPage>('/platform/barangays', { params })
  return response.data
}

export async function createBarangayWorkspace(data: FormData): Promise<DataResponse<BarangayWorkspace>> {
  const response = await apiClient.post<DataResponse<BarangayWorkspace>>('/platform/barangays', data)
  return response.data
}

export async function updateBarangayWorkspace(psgcCode: string, data: FormData): Promise<DataResponse<BarangayWorkspace>> {
  const response = await apiClient.post<DataResponse<BarangayWorkspace>>(`/platform/barangays/${psgcCode}`, data)
  return response.data
}

export async function reviewBarangayOnboarding(
  barangayId: number,
  onboarding_status: BarangayWorkspace['onboarding_status'],
): Promise<{ message: string; data: BarangayWorkspace }> {
  const response = await apiClient.put<{ message: string; data: BarangayWorkspace }>(
    `/platform/barangays/${barangayId}/onboarding-review`,
    { onboarding_status },
  )
  return response.data
}

export async function createBarangayWorkspaceUser(
  barangayId: number,
  data: { name: string; email: string; password: string; role: 'admin' | 'staff' },
): Promise<DataResponse<BarangayWorkspaceUser>> {
  const response = await apiClient.post<DataResponse<BarangayWorkspaceUser>>(`/platform/barangays/${barangayId}/users`, data)
  return response.data
}

export async function getPlatformBarangayUsers(barangayId: number): Promise<ListResponse<BarangayWorkspaceUser>> {
  const response = await apiClient.get<ListResponse<BarangayWorkspaceUser>>(`/platform/barangays/${barangayId}/users`)
  return response.data
}

export async function updateBarangayWorkspaceUser(
  barangayId: number,
  userId: number,
  data: { name: string; email: string; role: 'admin' | 'staff'; password?: string },
): Promise<DataResponse<BarangayWorkspaceUser>> {
  const response = await apiClient.put<DataResponse<BarangayWorkspaceUser>>(
    `/platform/barangays/${barangayId}/users/${userId}`,
    data,
  )
  return response.data
}

export async function deleteBarangayWorkspaceUser(barangayId: number, userId: number): Promise<void> {
  await apiClient.delete(`/platform/barangays/${barangayId}/users/${userId}`)
}
