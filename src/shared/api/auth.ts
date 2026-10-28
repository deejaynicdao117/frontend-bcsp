import { apiClient } from './client'
import type { PortalUser } from '../types'

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: PortalUser
}

export type RegistrationResponse = {
  message: string
  email: string
}

export type BarangayLocation = {
  id: number
  psgc_code: string
  name: string
  municipality: string
  province: string
  logo_url?: string | null
  primary_color?: string
}

export async function getBulacanBarangays(): Promise<BarangayLocation[]> {
  const response = await apiClient.get<{ data: BarangayLocation[] }>('/locations/bulacan/barangays')
  return response.data.data
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

export async function registerResident(data: {
  last_name: string
  first_name: string
  middle_name?: string
  sex: 'female' | 'male' | 'prefer_not_to_say'
  email: string
  password: string
  password_confirmation: string
  barangay_id: number
}): Promise<RegistrationResponse> {
  const response = await apiClient.post<RegistrationResponse>('/auth/register', data)
  return response.data
}

export async function verifyRegistrationCode(data: {
  email: string
  code: string
}): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/register/verify', data)
  return response.data
}

export async function resendRegistrationCode(email: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/register/resend-code', { email })
  return response.data
}

export async function logout(token?: string): Promise<void> {
  await apiClient.post('/auth/logout', null, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
}

export async function getCurrentUser(): Promise<{ user: PortalUser }> {
  const response = await apiClient.get<{ user: PortalUser }>('/auth/me')
  return response.data
}

export async function resendVerificationEmail(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/auth/email/verification-notification',
  )
  return response.data
}
