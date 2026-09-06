import type { MappingDraft, SemanticMapping } from './types.ts'

/**
 * Thin wrapper over fetch for the Concept Lens API.
 *
 * Requests are relative, so the same code works in dev (Vite proxies /api to the backend on
 * :8080) and in the packaged jar, where the API and the UI share an origin.
 */

/** The error body every failed request returns: a stable code and a readable message. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`/api${path}`, init)

  if (!response.ok) {
    let code = 'UNKNOWN'
    let message = `Request failed with ${response.status}`
    try {
      const body = await response.json()
      code = body.code ?? code
      message = body.message ?? message
    } catch {
      // A response without a JSON body leaves the defaults above in place.
    }
    throw new ApiError(response.status, code, message)
  }

  return response
}

async function getJson<T>(path: string): Promise<T> {
  const response = await request(path, { method: 'GET' })
  return (await response.json()) as T
}

export const api = {
  concepts: () => getJson<import('./types.ts').Concept[]>('/concepts'),

  compare: (leftConceptId: string, rightConceptId: string) =>
    getJson<import('./types.ts').ComparisonResult>(
      `/compare?left=${encodeURIComponent(leftConceptId)}&right=${encodeURIComponent(rightConceptId)}`,
    ),

  mappings: () => getJson<SemanticMapping[]>('/mappings'),

  /** Returns the created mapping, including the id the backend assigned it. */
  createMapping: async (draft: MappingDraft): Promise<SemanticMapping> => {
    const response = await request('/mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    return (await response.json()) as SemanticMapping
  },

  deleteMapping: async (mappingId: string): Promise<void> => {
    await request(`/mappings/${encodeURIComponent(mappingId)}`, { method: 'DELETE' })
  },
}
