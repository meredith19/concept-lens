import { vi } from 'vitest'

import type { ComparisonResult, Concept, SemanticMapping } from '../api/types.ts'

/** Fixtures shaped exactly like the backend's seed data, used to stub the API in tests. */

export const RETURNABLE: Concept = {
  id: 'returns.returnable',
  name: 'Returnable',
  sourceSystem: 'Returns',
  definition: 'Whether an item can currently be returned.',
  version: 1,
  publishedAt: '2026-01-14T09:12:00Z',
  facts: [
    {
      id: 'returns.returnable.valid_return_path',
      label: 'Has a valid return path',
      description: 'A valid path exists for returning the item.',
    },
    {
      id: 'returns.returnable.within_return_window',
      label: 'Is within the return window',
      description: 'Still inside the return period.',
    },
  ],
}

export const REFUNDABLE: Concept = {
  id: 'payments.refundable',
  name: 'Refundable',
  sourceSystem: 'Payments',
  definition: 'Whether money can currently be refunded.',
  version: 1,
  publishedAt: '2026-01-22T16:40:00Z',
  facts: [
    {
      id: 'payments.refundable.refund_path_available',
      label: 'Refund path available',
      description: 'A valid path exists for refunding the purchase.',
    },
    {
      id: 'payments.refundable.return_approved',
      label: 'Return has been approved',
      description: 'The return was approved.',
    },
  ],
}

export const CONCEPTS: Concept[] = [RETURNABLE, REFUNDABLE]

export const MAPPING: SemanticMapping = {
  id: 'rel_018',
  leftFactId: 'returns.returnable.valid_return_path',
  rightFactId: 'payments.refundable.refund_path_available',
  type: 'SAME_MEANING',
  status: 'CONFIRMED',
  rationale: 'Both facts mean a valid path exists to reverse the purchase.',
  reviewedBy: 'Domain reviewer',
}

export const NOT_ESTABLISHED: ComparisonResult = {
  leftConcept: RETURNABLE,
  rightConcept: REFUNDABLE,
  relationship: 'NOT_ESTABLISHED',
  matchedFacts: [
    { leftFact: RETURNABLE.facts[0], rightFact: REFUNDABLE.facts[0], mapping: MAPPING },
  ],
  unmatchedLeftFacts: [RETURNABLE.facts[1]],
  unmatchedRightFacts: [REFUNDABLE.facts[1]],
}

interface StubOptions {
  concepts?: Concept[]
  mappings?: SemanticMapping[]
  comparison?: ComparisonResult
  /** Requests that should fail, keyed "METHOD /path", mapped to the API's error body. */
  failures?: Record<string, { status: number; code: string; message: string }>
}

export interface ApiStub {
  calls: { method: string; url: string; body?: unknown }[]
  mappings: SemanticMapping[]
}

/** Installs a fetch stub covering every endpoint the UI uses. */
export function installApiStub(options: StubOptions = {}): ApiStub {
  const stub: ApiStub = { calls: [], mappings: [...(options.mappings ?? [MAPPING])] }
  const concepts = options.concepts ?? CONCEPTS
  const comparison = options.comparison ?? NOT_ESTABLISHED

  const reply = (body: unknown, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })

  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    stub.calls.push({ method, url, body })

    const failure = options.failures?.[`${method} ${url.split('?')[0]}`]
    if (failure) {
      return reply({ code: failure.code, message: failure.message }, failure.status)
    }

    if (method === 'GET' && url.startsWith('/api/concepts')) {
      return reply(concepts)
    }
    if (method === 'GET' && url.startsWith('/api/compare')) {
      return reply(comparison)
    }
    if (method === 'GET' && url.startsWith('/api/mappings')) {
      return reply(stub.mappings)
    }
    if (method === 'POST' && url === '/api/mappings') {
      // Mirrors the backend: the id is assigned here, never sent by the client.
      const created = { ...(body as object), id: `rel_${stub.mappings.length + 1}` }
      stub.mappings = [...stub.mappings, created as SemanticMapping]
      return reply(created, 201)
    }
    if (method === 'DELETE' && url.startsWith('/api/mappings/')) {
      const id = decodeURIComponent(url.replace('/api/mappings/', ''))
      stub.mappings = stub.mappings.filter((mapping) => mapping.id !== id)
      return reply(undefined, 204)
    }
    return reply({ code: 'NOT_FOUND', message: `No stub for ${method} ${url}` }, 404)
  })

  return stub
}
