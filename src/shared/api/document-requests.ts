import { apiClient } from './client'
import type { DocumentRequest } from '../types'
import type { ListResponse } from './admin'
export type { DocumentType } from './admin'

export async function getResidentDocumentRequests(): Promise<ListResponse<DocumentRequest>> {
  const response = await apiClient.get<ListResponse<DocumentRequest>>('/resident/document-requests')
  return response.data
}

export async function createResidentDocumentRequest(data: {
  document_type_id: number
  purpose: string
}): Promise<{ data: DocumentRequest }> {
  const response = await apiClient.post<{ data: DocumentRequest }>(
    '/resident/document-requests',
    data,
  )
  return response.data
}

export async function getStaffDocumentRequests(): Promise<ListResponse<DocumentRequest>> {
  const response = await apiClient.get<ListResponse<DocumentRequest>>('/staff/document-requests')
  return response.data
}

export async function updateStaffDocumentRequest(
  id: number,
  data: {
    status: string
    remarks?: string
    rejection_reason?: string
    ready_for_pickup_at?: string
    released_at?: string
  },
): Promise<{ data: DocumentRequest }> {
  const response = await apiClient.put<{ data: DocumentRequest }>(
    `/staff/document-requests/${id}`,
    data,
  )
  return response.data
}

export async function getResidentDocumentPreview(id: number): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/resident/document-requests/${id}/preview`, {
    responseType: 'blob',
  })
  return response.data
}

export async function downloadStaffDocumentRequest(id: number, trackingNumber: string): Promise<void> {
  const response = await apiClient.get<Blob>(`/staff/document-requests/${id}/document`, {
    responseType: 'blob',
  })
  const fileUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = fileUrl
  link.download = `${trackingNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(fileUrl)
}
