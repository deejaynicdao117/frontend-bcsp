import type { AxiosRequestConfig } from 'axios'
import { apiClient } from './api/client'

type ApiOptions = Omit<AxiosRequestConfig, 'url' | 'data'> & {
  token?: string
  body?: BodyInit | object | null
}

/**
 * Compatibility helper for feature screens that still build a request from a
 * dynamic path. New API calls should live in a domain module under api/.
 */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, body, ...requestOptions } = options
  const response = await apiClient.request<T>({
    ...requestOptions,
    url: path,
    data: body,
    headers: token
      ? { ...requestOptions.headers, Authorization: `Bearer ${token}` }
      : requestOptions.headers,
  })

  return response.data
}

export * from './api/auth'
export * from './api/admin'
export * from './api/community'
export * from './api/document-requests'
