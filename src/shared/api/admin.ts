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
  created_at?: string
}

export async function getDocumentTypes(): Promise<DocumentType[]> {
  const response = await apiClient.get<DocumentType[]>('/document-types')
  return response.data
}

export async function createDocumentType(data: {
  name: string
  description?: string
}): Promise<DocumentType> {
  const response = await apiClient.post<DocumentType>('/admin/document-types', data)
  return response.data
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
