import { apiClient } from './client'

export type PortalAlert = {
  id: number
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  created_at: string
}

export type PortalAlertsResponse = {
  data: PortalAlert[]
  latest_id: number
}

export async function getPortalAlerts(afterId?: number): Promise<PortalAlertsResponse> {
  const response = await apiClient.get<PortalAlertsResponse>('/notifications', {
    params: afterId === undefined ? undefined : { after_id: afterId },
  })
  return response.data
}