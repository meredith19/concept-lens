/**
 * Thin wrapper over fetch for the Concept Lens API.
 *
 * Requests are relative, so the same code works in dev (Vite proxies /api to the
 * backend on :8080) and in the packaged jar (API and UI share an origin).
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with ${response.status}`)
  }

  return (await response.json()) as T
}
