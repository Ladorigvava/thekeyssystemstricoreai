export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
  }
}
export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (data.code === 'SESSION_REQUIRED')
      window.dispatchEvent(new Event('session-expired'))
    throw new APIError(
      data.error || `Request failed (${response.status}).`,
      response.status,
      data.code,
    )
  }
  return response
}
