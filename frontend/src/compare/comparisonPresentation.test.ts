import { describe, expect, it } from 'vitest'

import type { ComparisonResult } from '../api/types.ts'
import { NOT_ESTABLISHED, REFUNDABLE, RETURNABLE } from '../test/apiStub.ts'
import { evidence, headline, implicationRows, takeaway, vennShape } from './comparisonPresentation.ts'

function withRelationship(
  relationship: ComparisonResult['relationship'],
  overrides: Partial<ComparisonResult> = {},
): ComparisonResult {
  return { ...NOT_ESTABLISHED, relationship, ...overrides }
}

describe('vennShape', () => {
  it('draws containment with the contained concept inside', () => {
    expect(vennShape(withRelationship('RIGHT_INCLUDES_LEFT'))).toBe('LEFT_INSIDE_RIGHT')
    expect(vennShape(withRelationship('LEFT_INCLUDES_RIGHT'))).toBe('RIGHT_INSIDE_LEFT')
  })

  it('draws equivalence as a single shared circle', () => {
    expect(vennShape(withRelationship('SAME_MEANING'))).toBe('SAME_MEANING')
  })

  it('separates the circles only when nothing at all is matched', () => {
    expect(vennShape(withRelationship('NOT_ESTABLISHED'))).toBe('OVERLAP')
    expect(vennShape(withRelationship('NOT_ESTABLISHED', { matchedFacts: [] }))).toBe('DISJOINT')
  })
})

describe('headline', () => {
  it('reports confirmed shared meaning without claiming a relationship', () => {
    expect(headline(NOT_ESTABLISHED).badge).toBe('PARTIAL SHARED MEANING')
    expect(headline(NOT_ESTABLISHED).summary).toContain('no confirmed match')
  })

  it('says nothing is established when no facts are matched at all', () => {
    expect(headline(withRelationship('NOT_ESTABLISHED', { matchedFacts: [] })).badge).toBe(
      'NOT ESTABLISHED',
    )
  })

  it('never labels the pair as partial overlap', () => {
    expect(headline(NOT_ESTABLISHED).badge).not.toContain('OVERLAP')
  })

  it('names the stronger concept for containment', () => {
    expect(headline(withRelationship('RIGHT_INCLUDES_LEFT')).summary).toBe(
      'Everything Returnable means is also meant by Refundable; Refundable adds more.',
    )
  })
})

describe('takeaway', () => {
  it('acknowledges confirmed shared meaning while withholding a verdict', () => {
    const result = takeaway(NOT_ESTABLISHED)

    expect(result.title).toBe('They share meaning, but the relationship is not established.')
    expect(result.copy).toContain('1 confirmed shared meaning')
    expect(result.copy).toContain('unknown, not different')
  })

  it('treats an absent mapping as unknown rather than different', () => {
    const result = takeaway(withRelationship('NOT_ESTABLISHED', { matchedFacts: [] }))

    expect(result.title).toBe('Relationship unknown.')
    expect(result.copy).toContain('absence of evidence')
  })
})

describe('implicationRows', () => {
  it('lists matched pairs first, then each side’s unmatched facts', () => {
    const rows = implicationRows(NOT_ESTABLISHED)

    expect(rows).toHaveLength(3)
    expect(rows[0].left).toEqual(RETURNABLE.facts[0])
    expect(rows[0].right).toEqual(REFUNDABLE.facts[0])
    expect(rows[0].relationship).toBe('Same meaning')
    expect(rows[1].right).toBeNull()
    expect(rows[2].left).toBeNull()
  })
})

describe('evidence', () => {
  it('cites the mapping behind the first confirmed match', () => {
    const result = evidence(NOT_ESTABLISHED)

    expect(result.path).toBe(
      'returns.returnable.valid_return_path ↔ payments.refundable.refund_path_available',
    )
    expect(result.meta).toBe('Same meaning · Confirmed · Domain reviewer')
    expect(result.mappingId).toBe('rel_018')
  })

  it('offers nothing to inspect when no mapping relates the pair', () => {
    const result = evidence(withRelationship('NOT_ESTABLISHED', { matchedFacts: [] }))

    expect(result.mappingId).toBeUndefined()
    expect(result.path).toContain('No confirmed mapping')
  })
})
