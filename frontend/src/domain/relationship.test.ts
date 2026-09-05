import { describe, expect, it } from 'vitest'

import { CONCEPTS } from './concepts.ts'
import { classify, summarize } from './relationship.ts'
import type { Concept } from './types.ts'

function concept(id: string, meanings: string[]): Concept {
  return { id, name: id, system: 'Test', definition: '', meanings }
}

describe('classify', () => {
  it('reports partial overlap when each concept keeps unmatched meanings', () => {
    const result = classify(CONCEPTS.returnable, CONCEPTS.refundable)

    expect(result.relationship).toBe('PARTIAL_OVERLAP')
    expect(result.shared).toEqual(['Has a valid return path'])
    expect(result.onlyA).toEqual(['Is within the return window', 'Is not final sale'])
    expect(result.onlyB).toEqual(['Return has been approved', 'Payment was captured'])
  })

  it('reports containment when one meaning set is inside the other', () => {
    expect(classify(CONCEPTS.shipped, CONCEPTS.delivered).relationship).toBe('A_SUBSET_B')
    expect(classify(CONCEPTS.delivered, CONCEPTS.shipped).relationship).toBe('B_SUBSET_A')
  })

  it('reports equivalence when the meaning sets match', () => {
    expect(classify(CONCEPTS.buyercountry, CONCEPTS.billingcountry).relationship).toBe(
      'SAME_MEANING',
    )
  })

  it('reports no overlap when nothing is shared', () => {
    const result = classify(concept('left', ['one']), concept('right', ['two']))

    expect(result.relationship).toBe('DISJOINT')
    expect(result.shared).toEqual([])
  })
})

describe('summarize', () => {
  it('names the stronger concept for containment', () => {
    const { badge, summary } = summarize('A_SUBSET_B', CONCEPTS.shipped, CONCEPTS.delivered)

    expect(badge).toBe('CONTAINMENT')
    expect(summary).toBe(
      'Everything implied by Shipped is also implied by Delivered; Delivered adds additional meanings.',
    )
  })
})
