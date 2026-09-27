const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

type ApiOptions = Omit<RequestInit, 'headers' | 'body'> & {
  token?: string
  body?: BodyInit | object | null
  headers?: HeadersInit
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, body, headers: suppliedHeaders, ...requestOptions } = options
  const headers = new Headers(suppliedHeaders)
  headers.set('Accept', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let requestBody: BodyInit | null | undefined
  if (body !== null && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  } else {
    requestBody = body as BodyInit | null | undefined
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
    body: requestBody,
  })

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    const validationErrors = data?.errors
      ? Object.values(data.errors as Record<string, string[]>).flat().join(' ')
      : ''
    throw new Error(validationErrors || data?.message || `Request failed (${response.status})`)
  }

  return data as T
}
