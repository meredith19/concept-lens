import type { Mapping } from './types.ts'

/** Demo mappings from the UX mock, shown on the Mappings page. */
export const DEMO_MAPPINGS: Mapping[] = [
  {
    id: 'rel_018',
    source: 'Returns.valid_return_path',
    target: 'Payments.refund_path_available',
    connector: '↕',
    relation: 'SAME MEANING',
    tags: ['Confirmed', 'Domain reviewer', 'rel_018'],
    search: 'returns return window payments refund eligibility equivalent',
  },
  {
    id: 'rel_024',
    source: 'Fulfillment.left_fulfillment_center',
    target: 'Delivery.left_fulfillment_center',
    connector: '→',
    relation: 'IMPLIES',
    tags: ['Confirmed', 'Domain reviewer', 'rel_024'],
    search: 'fulfillment left fulfillment center delivery left fulfillment center implies',
  },
  {
    id: 'rel_031',
    source: 'Orders.payment_instrument_country',
    target: 'Payments.billing_country',
    connector: '↕',
    relation: 'SAME MEANING',
    tags: ['Confirmed', 'Domain reviewer', 'rel_031'],
    search: 'orders payment instrument country payments billing country equivalent',
  },
]

/** The mock only carries a detail view for its first example. */
export const MAPPING_WITH_DETAIL = 'rel_018'
