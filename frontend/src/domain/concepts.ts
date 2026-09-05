import type { Concept } from './types.ts'

/** Demo concepts from the UX mock. These stand in until the backend serves real ones. */
export const CONCEPTS: Record<string, Concept> = {
  returnable: {
    id: 'returnable',
    name: 'Returnable',
    system: 'Returns',
    definition: 'Whether an item can currently be returned.',
    meanings: ['Has a valid return path', 'Is within the return window', 'Is not final sale'],
  },
  refundable: {
    id: 'refundable',
    name: 'Refundable',
    system: 'Payments',
    definition: 'Whether money can currently be refunded.',
    meanings: ['Has a valid return path', 'Return has been approved', 'Payment was captured'],
  },
  shipped: {
    id: 'shipped',
    name: 'Shipped',
    system: 'Fulfillment',
    definition: 'The package has left the fulfillment center.',
    meanings: ['Left the fulfillment center'],
  },
  delivered: {
    id: 'delivered',
    name: 'Delivered',
    system: 'Delivery',
    definition: 'The package has reached its destination.',
    meanings: ['Left the fulfillment center', 'Reached the destination'],
  },
  buyercountry: {
    id: 'buyercountry',
    name: 'BuyerCountry',
    system: 'Orders',
    definition: 'Country associated with the payment instrument used for this order.',
    meanings: [
      'Uses the payment instrument country',
      'Uses the same normalization rule',
      'Has the same null behavior',
    ],
  },
  billingcountry: {
    id: 'billingcountry',
    name: 'BillingCountry',
    system: 'Payments',
    definition: 'Country associated with the payment instrument used for this order.',
    meanings: [
      'Uses the payment instrument country',
      'Uses the same normalization rule',
      'Has the same null behavior',
    ],
  },
}

export const CONCEPT_LIST = Object.values(CONCEPTS)

export const DEFAULT_PAIR = { a: 'returnable', b: 'refundable' } as const

export const SUGGESTED_COMPARISONS = [
  { a: 'returnable', b: 'refundable', label: 'Returnable ↔ Refundable' },
  { a: 'shipped', b: 'delivered', label: 'Shipped ↔ Delivered' },
  { a: 'buyercountry', b: 'billingcountry', label: 'BuyerCountry ↔ BillingCountry' },
]

export function conceptOptionLabel(concept: Concept): string {
  return `${concept.name} · ${concept.system}`
}
