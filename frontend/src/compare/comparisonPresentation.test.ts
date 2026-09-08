import { describe, expect, it } from 'vitest'

import type { ComparisonResult } from '../api/types.ts'
import { NOT_ESTABLISHED, REFUNDABLE, RETURNABLE } from '../test/apiStub.ts'
import { headline, implicationRows, takeaway, vennShape } from './comparisonPresentation.ts'

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
  it('states the partial case in one line, with no duplicate explanation', () => {
    const result = takeaway(NOT_ESTABLISHED)

    expect(result.title).toBe(
      'They share some meaning, but the overall relationship is not established.',
    )
    expect(result.copy).toBeUndefined()
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
    expect(rows[0].match?.mapping.id).toBe('rel_018')
    expect(rows[1].right).toBeNull()
    expect(rows[1].match).toBeUndefined()
    expect(rows[2].left).toBeNull()
  })
})
