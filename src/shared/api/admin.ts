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

export async function getPlatformBarangays(): Promise<ListResponse<BarangayWorkspace>> {
  const response = await apiClient.get<ListResponse<BarangayWorkspace>>('/platform/barangays')
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
): Promise<DataResponse<PortalUser>> {
  const response = await apiClient.post<DataResponse<PortalUser>>(`/platform/barangays/${barangayId}/users`, data)
  return response.data
}

export async function importDefaultBarangayWorkspace(barangayId: number): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`/platform/barangays/${barangayId}/import-default-workspace`)
  return response.data
}
