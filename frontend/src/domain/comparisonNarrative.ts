import type { Fact, ImplicationRow, MappingEvidence, Takeaway } from './types.ts'

/**
 * Hand-authored copy for the demo concept pairs, keyed by "<conceptA>:<conceptB>".
 *
 * The mock ships one entry per direction because the wording is directional. This will be
 * replaced by backend responses; until then it is kept verbatim from the mock.
 */

const SAME = 'Same meaning'
const NO_MATCH = 'No confirmed match'

function fact(name: string, native: string): Fact {
  return { name, native }
}

const IMPLICATION_ROWS: Record<string, ImplicationRow[]> = {
  'returnable:refundable': [
    {
      left: fact('Has a valid return path', 'Returns.valid_return_path'),
      relationship: SAME,
      right: fact('Refund path available', 'Payments.refund_path_available'),
    },
    {
      left: fact('Is within the return window', 'Returns.within_return_window'),
      relationship: NO_MATCH,
      right: null,
    },
    {
      left: fact('Is not final sale', 'Returns.not_final_sale'),
      relationship: NO_MATCH,
      right: null,
    },
    {
      left: null,
      relationship: NO_MATCH,
      right: fact('Return has been approved', 'Payments.return_approved'),
    },
    {
      left: null,
      relationship: NO_MATCH,
      right: fact('Payment was captured', 'Payments.payment_captured'),
    },
  ],
  'refundable:returnable': [
    {
      left: fact('Refund path available', 'Payments.refund_path_available'),
      relationship: SAME,
      right: fact('Has a valid return path', 'Returns.valid_return_path'),
    },
    {
      left: fact('Return has been approved', 'Payments.return_approved'),
      relationship: NO_MATCH,
      right: null,
    },
    {
      left: fact('Payment was captured', 'Payments.payment_captured'),
      relationship: NO_MATCH,
      right: null,
    },
    {
      left: null,
      relationship: NO_MATCH,
      right: fact('Is within the return window', 'Returns.within_return_window'),
    },
    {
      left: null,
      relationship: NO_MATCH,
      right: fact('Is not final sale', 'Returns.not_final_sale'),
    },
  ],
  'shipped:delivered': [
    {
      left: fact('Left the fulfillment center', 'Fulfillment.left_fulfillment_center'),
      relationship: SAME,
      right: fact('Package left fulfillment', 'Delivery.left_fulfillment_center'),
    },
    {
      left: null,
      relationship: NO_MATCH,
      right: fact('Reached the destination', 'Delivery.reached_destination'),
    },
  ],
  'delivered:shipped': [
    {
      left: fact('Package left fulfillment', 'Delivery.left_fulfillment_center'),
      relationship: SAME,
      right: fact('Left the fulfillment center', 'Fulfillment.left_fulfillment_center'),
    },
    {
      left: fact('Reached the destination', 'Delivery.reached_destination'),
      relationship: NO_MATCH,
      right: null,
    },
  ],
  'buyercountry:billingcountry': [
    {
      left: fact('Uses the payment instrument country', 'Orders.payment_instrument_country'),
      relationship: SAME,
      right: fact('Billing country', 'Payments.billing_country'),
    },
    {
      left: fact('Uses the same normalization rule', 'Orders.country_normalization'),
      relationship: SAME,
      right: fact('Country normalization', 'Payments.country_normalization'),
    },
    {
      left: fact('Has the same null behavior', 'Orders.missing_country_behavior'),
      relationship: SAME,
      right: fact('Missing-country behavior', 'Payments.missing_country_behavior'),
    },
  ],
  'billingcountry:buyercountry': [
    {
      left: fact('Billing country', 'Payments.billing_country'),
      relationship: SAME,
      right: fact('Uses the payment instrument country', 'Orders.payment_instrument_country'),
    },
    {
      left: fact('Country normalization', 'Payments.country_normalization'),
      relationship: SAME,
      right: fact('Uses the same normalization rule', 'Orders.country_normalization'),
    },
    {
      left: fact('Missing-country behavior', 'Payments.missing_country_behavior'),
      relationship: SAME,
      right: fact('Has the same null behavior', 'Orders.missing_country_behavior'),
    },
  ],
}

const CONFIRMED_BY_OWNER = 'Same meaning · Confirmed · Reviewed by domain owner'

const REVERSIBLE_PURCHASE_NOTE =
  'The shared meaning is confirmed by an explicit mapping. Other unmatched meanings have no confirmed match.'
const FULFILLMENT_NOTE =
  'Delivered carries the confirmed implication that the package has left fulfillment, and adds a destination guarantee.'
const COUNTRY_NOTE =
  'The names differ, but an explicit mapping confirms the same payment-instrument country semantics.'

const MAPPING_EVIDENCE: Record<string, MappingEvidence> = {
  'returnable:refundable': {
    path: 'Returns.valid_return_path ↔ Payments.refund_path_available',
    meta: CONFIRMED_BY_OWNER,
    note: REVERSIBLE_PURCHASE_NOTE,
  },
  'refundable:returnable': {
    path: 'Payments.refund_path_available ↔ Returns.valid_return_path',
    meta: CONFIRMED_BY_OWNER,
    note: REVERSIBLE_PURCHASE_NOTE,
  },
  'shipped:delivered': {
    path: 'Fulfillment.left_fulfillment_center → Delivery.left_fulfillment_center',
    meta: CONFIRMED_BY_OWNER,
    note: FULFILLMENT_NOTE,
  },
  'delivered:shipped': {
    path: 'Delivery.left_fulfillment_center ← Fulfillment.left_fulfillment_center',
    meta: CONFIRMED_BY_OWNER,
    note: FULFILLMENT_NOTE,
  },
  'buyercountry:billingcountry': {
    path: 'Orders.payment_instrument_country ≡ Payments.billing_country',
    meta: CONFIRMED_BY_OWNER,
    note: COUNTRY_NOTE,
  },
  'billingcountry:buyercountry': {
    path: 'Payments.billing_country ≡ Orders.payment_instrument_country',
    meta: CONFIRMED_BY_OWNER,
    note: COUNTRY_NOTE,
  },
}

const UNKNOWN_EVIDENCE: MappingEvidence = {
  path: 'No confirmed mapping for this demo pair',
  meta: 'Unknown',
  note: 'Concept Lens does not infer semantic relationships merely from similar names.',
}

const TAKEAWAYS: Record<string, Takeaway> = {
  'returnable:refundable': {
    title: 'Related, but not interchangeable.',
    copy: 'Both have a confirmed path for reversing the purchase, but Returnable and Refundable carry different additional meaning.',
  },
  'refundable:returnable': {
    title: 'Related, but not interchangeable.',
    copy: 'Both have a confirmed path for reversing the purchase, but Refundable and Returnable carry different additional meaning.',
  },
  'shipped:delivered': {
    title: 'Delivered is more specific.',
    copy: 'Delivered includes the confirmed meaning of Shipped and adds that the package reached its destination.',
  },
  'delivered:shipped': {
    title: 'Shipped captures only part of Delivered.',
    copy: 'Shipped confirms that the package left fulfillment, but does not establish that it reached its destination.',
  },
  'buyercountry:billingcountry': {
    title: 'Different names, same meaning.',
    copy: 'The two systems use different vocabulary, but all modeled meanings are confirmed as equivalent.',
  },
  'billingcountry:buyercountry': {
    title: 'Different names, same meaning.',
    copy: 'The two systems use different vocabulary, but all modeled meanings are confirmed as equivalent.',
  },
}

const UNKNOWN_TAKEAWAY: Takeaway = {
  title: 'Relationship unknown.',
  copy: 'Lens does not have enough confirmed relationships to explain this pair.',
}

function pairKey(aId: string, bId: string): string {
  return `${aId}:${bId}`
}

export function implicationRows(aId: string, bId: string): ImplicationRow[] {
  return IMPLICATION_ROWS[pairKey(aId, bId)] ?? []
}

export function mappingEvidence(aId: string, bId: string): MappingEvidence {
  return MAPPING_EVIDENCE[pairKey(aId, bId)] ?? UNKNOWN_EVIDENCE
}

export function takeaway(aId: string, bId: string): Takeaway {
  return TAKEAWAYS[pairKey(aId, bId)] ?? UNKNOWN_TAKEAWAY
}

export { NO_MATCH }
