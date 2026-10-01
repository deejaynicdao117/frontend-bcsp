const API_URL = import.meta.env.VITE_API_URL ?? '/api'

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

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
      body: requestBody,
    })
  } catch {
    throw new Error(`Cannot reach the API (${API_URL}). Check that the backend server is running and reachable from this device.`)
  }

  const raw = await response.text().catch(() => '')

  let data: unknown = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const payload = data as { errors?: Record<string, string[]>; message?: string } | null
    const validationErrors = payload?.errors
      ? Object.values(payload.errors).flat().join(' ')
      : ''
    throw new Error(validationErrors || payload?.message || `Request failed (${response.status})`)
  }

  if (data === null && response.status !== 204) {
    throw new Error(`The API returned a non-JSON response for ${path} (${response.status}). Check VITE_API_URL / VITE_API_PROXY in frontend-bscp/.env and make sure the backend is running.`)
  }

  return data as T
}
