import { apiClient } from './client'

export type Envelope<T> = {
  data: T
}

async function get<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path)
  return response.data
}

async function post<T>(path: string, data?: object): Promise<T> {
  const response = await apiClient.post<T>(path, data)
  return response.data
}

async function put<T>(path: string, data?: object): Promise<T> {
  const response = await apiClient.put<T>(path, data)
  return response.data
}

async function remove<T>(path: string): Promise<T> {
  const response = await apiClient.delete<T>(path)
  return response.data
}

export const residentCommunityApi = {
  getProfile: <T>() => get<Envelope<T>>('/resident/profile'),
  getComplaints: <T>() => get<Envelope<T[]>>('/resident/complaints'),
  getAssistanceRequests: <T>() => get<Envelope<T[]>>('/resident/disaster-assistance'),
  getAnnouncements: <T>() => get<Envelope<T[]>>('/community/announcements'),
  getEmergencyContacts: <T>() => get<Envelope<T[]>>('/community/emergency-contacts'),
  getEvacuationCenters: <T>() => get<Envelope<T[]>>('/community/evacuation-centers'),
  updateProfile: (data: object) => put('/resident/profile', data),
  submitComplaint: (data: object) => post('/resident/complaints', data),
  submitAssistanceRequest: (data: object) => post('/resident/disaster-assistance', data),
  resendVerificationEmail: () => post('/auth/email/verification-notification'),
}

export const staffCommunityApi = {
  getAnnouncements: <T>() => get<Envelope<T[]>>('/staff/announcements'),
  createAnnouncement: (data: object) => post('/staff/announcements', data),
  updateAnnouncement: (id: number, data: object) => put(`/staff/announcements/${id}`, data),
  deleteAnnouncement: (id: number) => remove(`/staff/announcements/${id}`),
  getHouseholds: <T>() => get<Envelope<T[]>>('/staff/households'),
  getResidents: <T>() => get<Envelope<T[]>>('/staff/residents'),
  getComplaints: <T>() => get<Envelope<T[]>>('/staff/complaints'),
  getAssistanceRequests: <T>() => get<Envelope<T[]>>('/staff/disaster-assistance'),
  getAnalytics: <T>() => get<Envelope<T>>('/staff/analytics/community'),
  verifyHousehold: (id: number, status: string) => put(`/staff/households/${id}/verification`, { status }),
  verifyResident: (id: number, status: string) => put(`/staff/residents/${id}/verification`, { status }),
  reviewComplaint: (id: number, data: object) => put(`/staff/complaints/${id}`, data),
  updateAssistanceRequest: (id: number, data: object) => put(`/staff/disaster-assistance/${id}`, data),
}

export const adminCommunityApi = {
  getAnnouncements: <T>() => get<Envelope<T[]>>('/admin/announcements'),
  getEmergencyContacts: <T>() => get<Envelope<T[]>>('/admin/emergency-contacts'),
  getEvacuationCenters: <T>() => get<Envelope<T[]>>('/admin/evacuation-centers'),
  getHouseholds: <T>() => get<Envelope<T[]>>('/admin/households'),
  getComplaints: <T>() => get<Envelope<T[]>>('/admin/complaints'),
  getAssistanceRequests: <T>() => get<Envelope<T[]>>('/admin/disaster-assistance'),
  getActivityLogs: <T>() => get<Envelope<T[]>>('/admin/activity-logs'),
  createAnnouncement: (data: object) => post('/admin/announcements', data),
  updateAnnouncement: (id: number, data: object) => put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id: number) => remove(`/admin/announcements/${id}`),
  createEmergencyContact: (data: object) => post('/admin/emergency-contacts', data),
  deleteEmergencyContact: (id: number) => remove(`/admin/emergency-contacts/${id}`),
  createEvacuationCenter: (data: object) => post('/admin/evacuation-centers', data),
  deleteEvacuationCenter: (id: number) => remove(`/admin/evacuation-centers/${id}`),
}
