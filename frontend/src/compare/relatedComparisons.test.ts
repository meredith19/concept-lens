import { describe, expect, it } from 'vitest'

import type { Concept, SemanticMapping } from '../api/types.ts'
import { MAPPING, REFUNDABLE, RETURNABLE } from '../test/apiStub.ts'
import { relatedPairs } from './relatedComparisons.ts'

const DELIVERED: Concept = {
  id: 'delivery.delivered',
  name: 'Delivered',
  sourceSystem: 'Delivery',
  definition: 'The package has reached its destination.',
  version: 1,
  publishedAt: '2026-02-05T08:30:00Z',
  facts: [
    {
      id: 'delivery.delivered.left_fulfillment_center',
      label: 'Package left fulfillment',
      description: 'The package has left the fulfillment center.',
    },
    {
      id: 'delivery.delivered.reached_destination',
      label: 'Reached the destination',
      description: 'The package arrived at the destination address.',
    },
  ],
}

const SHIPPED: Concept = {
  id: 'fulfillment.shipped',
  name: 'Shipped',
  sourceSystem: 'Fulfillment',
  definition: 'The package has left the fulfillment center.',
  version: 1,
  publishedAt: '2026-02-03T11:05:00Z',
  facts: [
    {
      id: 'fulfillment.shipped.left_fulfillment_center',
      label: 'Left the fulfillment center',
      description: 'The package has physically left the fulfillment center.',
    },
  ],
}

const RETURNABLE_WITH_DELIVERY: Concept = {
  ...RETURNABLE,
  facts: [
    ...RETURNABLE.facts,
    {
      id: 'returns.returnable.item_delivered',
      label: 'Item has been delivered',
      description: "The item's delivery has reached its destination.",
    },
  ],
}

const REL_024: SemanticMapping = {
  id: 'rel_024',
  leftFactId: 'fulfillment.shipped.left_fulfillment_center',
  rightFactId: 'delivery.delivered.left_fulfillment_center',
  type: 'SAME_MEANING',
  status: 'CONFIRMED',
  rationale: 'Same dispatch event.',
  reviewedBy: 'Domain reviewer',
}

const REL_034: SemanticMapping = {
  id: 'rel_034',
  leftFactId: 'returns.returnable.item_delivered',
  rightFactId: 'delivery.delivered.reached_destination',
  type: 'SAME_MEANING',
  status: 'CONFIRMED',
  rationale: 'Same destination event.',
  reviewedBy: 'Domain reviewer',
}

const CATALOG = [RETURNABLE_WITH_DELIVERY, REFUNDABLE, SHIPPED, DELIVERED]
const SEEDED = [MAPPING, REL_024, REL_034]

describe('relatedPairs', () => {
  it('recommends Returnable ↔ Delivered from Returnable ↔ Refundable', () => {
    expect(relatedPairs(CATALOG, SEEDED, RETURNABLE.id, REFUNDABLE.id)).toEqual([
      {
        left: RETURNABLE.id,
        right: DELIVERED.id,
        label: 'Returnable ↔ Delivered',
      },
    ])
  })

  it('recommends Delivered ↔ Returnable from Shipped ↔ Delivered', () => {
    expect(relatedPairs(CATALOG, SEEDED, SHIPPED.id, DELIVERED.id)).toEqual([
      {
        left: DELIVERED.id,
        right: RETURNABLE.id,
        label: 'Delivered ↔ Returnable',
      },
    ])
  })

  it('does not invent a transitive Refundable ↔ Delivered pair', () => {
    const pairs = relatedPairs(CATALOG, SEEDED, REFUNDABLE.id, RETURNABLE.id)

    expect(pairs.map((pair) => pair.label)).toEqual(['Returnable ↔ Delivered'])
    expect(pairs.map((pair) => `${pair.left}|${pair.right}`)).not.toContain(
      `${REFUNDABLE.id}|${DELIVERED.id}`,
    )
  })

  it('returns nothing when the current pair is the only mapped comparison', () => {
    expect(relatedPairs([RETURNABLE, REFUNDABLE], [MAPPING], RETURNABLE.id, REFUNDABLE.id)).toEqual(
      [],
    )
  })

  it('emits one chip when several mappings join the same two concepts', () => {
    const second: SemanticMapping = {
      ...REL_034,
      id: 'rel_099',
      leftFactId: RETURNABLE_WITH_DELIVERY.facts[0].id,
      rightFactId: DELIVERED.facts[0].id,
    }

    expect(
      relatedPairs(CATALOG, [...SEEDED, second], RETURNABLE.id, REFUNDABLE.id),
    ).toHaveLength(1)
  })

  it('treats a mapping as bidirectional', () => {
    const reversed: SemanticMapping = {
      ...REL_034,
      leftFactId: REL_034.rightFactId,
      rightFactId: REL_034.leftFactId,
    }

    expect(relatedPairs(CATALOG, [MAPPING, reversed], RETURNABLE.id, REFUNDABLE.id)).toEqual([
      {
        left: RETURNABLE.id,
        right: DELIVERED.id,
        label: 'Returnable ↔ Delivered',
      },
    ])
  })
})
