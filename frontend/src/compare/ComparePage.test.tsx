import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ToastProvider from '../components/ToastProvider.tsx'
import type { Concept, SemanticMapping } from '../api/types.ts'
import { MAPPING, NOT_ESTABLISHED, REFUNDABLE, RETURNABLE, installApiStub } from '../test/apiStub.ts'
import ComparePage from './ComparePage.tsx'

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

const BUYER_COUNTRY: Concept = {
  id: 'orders.buyercountry',
  name: 'BuyerCountry',
  sourceSystem: 'Orders',
  definition: 'Country associated with the payment instrument.',
  version: 1,
  publishedAt: '2026-01-09T13:55:00Z',
  facts: [
    {
      id: 'orders.buyercountry.payment_instrument_country',
      label: 'Uses the payment instrument country',
      description: 'The country is taken from the payment instrument.',
    },
  ],
}

const BILLING_COUNTRY: Concept = {
  id: 'payments.billingcountry',
  name: 'BillingCountry',
  sourceSystem: 'Payments',
  definition: 'Country associated with the payment instrument.',
  version: 1,
  publishedAt: '2026-01-22T16:40:00Z',
  facts: [
    {
      id: 'payments.billingcountry.billing_country',
      label: 'Billing country',
      description: 'The country associated with the payment instrument.',
    },
  ],
}

/** ComparePage navigates to the Mappings page, so it needs a router around it. */
function renderPage() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/compare']}>
        <Routes>
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/mappings" element={<div>Mappings page</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ComparePage', () => {
  it('compares the first two published concepts on load', async () => {
    const stub = installApiStub()
    renderPage()

    expect(await screen.findByText('Returnable vs Refundable')).toBeInTheDocument()
    expect(screen.getByText('PARTIAL SHARED MEANING')).toBeInTheDocument()
    expect(stub.calls.map((call) => call.url)).toContain(
      '/api/compare?left=returns.returnable&right=payments.refundable',
    )
  })

  it('says what the demo catalog contains and that the result is derived', async () => {
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')

    expect(screen.getByText('Demo catalog · 2 concepts across 2 systems')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Derived from 1 confirmed mapping/ })).toBeInTheDocument()
    expect(screen.getByText('Unmapped means unknown, not different.')).toBeInTheDocument()
  })

  it('labels unmatched facts as unconfirmed rather than exclusive', async () => {
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')

    expect(screen.getAllByText('NO CONFIRMED MATCH')).not.toHaveLength(0)
    expect(screen.queryByText(/RETURNABLE ONLY/)).not.toBeInTheDocument()
  })

  it('renders the matched and unmatched facts from the comparison', async () => {
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')

    expect(screen.getAllByText('Same meaning')).not.toHaveLength(0)
    expect(screen.getAllByText('No confirmed match')).toHaveLength(2)
    // The label appears in both the Venn's shared region and the table.
    expect(screen.getAllByText('Has a valid return path')).not.toHaveLength(0)
    // Raw fact ids stay out of the table; they are metadata in the Inspect drawer.
    expect(screen.queryByText('returns.returnable.valid_return_path')).not.toBeInTheDocument()
  })

  it('does not offer the other selected concept in each picker', async () => {
    installApiStub({ concepts: [RETURNABLE, REFUNDABLE, DELIVERED] })
    renderPage()

    await screen.findByText('Returnable vs Refundable')

    const left = screen.getByLabelText('CONCEPT A')
    const right = screen.getByLabelText('CONCEPT B')
    expect(within(left).queryByRole('option', { name: /Refundable/ })).not.toBeInTheDocument()
    expect(within(right).queryByRole('option', { name: /Returnable/ })).not.toBeInTheDocument()
    expect(within(left).getByRole('option', { name: /Delivered/ })).toBeInTheDocument()
    expect(within(right).getByRole('option', { name: /Delivered/ })).toBeInTheDocument()
  })

  it('requests a new comparison when a different concept is picked', async () => {
    const user = userEvent.setup()
    const stub = installApiStub({ concepts: [RETURNABLE, REFUNDABLE, DELIVERED] })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.selectOptions(screen.getByLabelText('CONCEPT B'), 'delivery.delivered')

    await waitFor(() =>
      expect(stub.calls.map((call) => call.url)).toContain(
        '/api/compare?left=returns.returnable&right=delivery.delivered',
      ),
    )
  })

  it('requests a new comparison when the concepts are swapped', async () => {
    const user = userEvent.setup()
    const stub = installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Swap concepts' }))

    await waitFor(() =>
      expect(stub.calls.map((call) => call.url)).toContain(
        '/api/compare?left=payments.refundable&right=returns.returnable',
      ),
    )
  })

  it('inspects the mapping on the row that was clicked, not the first one', async () => {
    const user = userEvent.setup()
    const second = {
      ...MAPPING,
      id: 'rel_099',
      leftFactId: RETURNABLE.facts[1].id,
      rightFactId: REFUNDABLE.facts[1].id,
      rationale: 'Second confirmed match.',
    }
    installApiStub({
      comparison: {
        ...NOT_ESTABLISHED,
        matchedFacts: [
          ...NOT_ESTABLISHED.matchedFacts,
          { leftFact: RETURNABLE.facts[1], rightFact: REFUNDABLE.facts[1], mapping: second },
        ],
        unmatchedLeftFacts: [],
        unmatchedRightFacts: [],
      },
    })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Inspect mapping rel_099' }))

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByText('rel_099')).toBeInTheDocument()
    expect(within(drawer).getByText('Second confirmed match.')).toBeInTheDocument()
    expect(within(drawer).queryByText('rel_018')).not.toBeInTheDocument()
  })

  it('leads with fact labels and keeps ids as metadata in the drawer', async () => {
    const user = userEvent.setup()
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Inspect mapping rel_018' }))

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByText('Has a valid return path')).toBeInTheDocument()
    expect(within(drawer).getByText('Confirmed mapping')).toBeInTheDocument()
    expect(within(drawer).getByText(MAPPING.rationale)).toBeInTheDocument()
  })

  it('removes a mapping from the drawer and refreshes the comparison', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const stub = installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Inspect mapping rel_018' }))
    await user.click(screen.getByRole('button', { name: 'Remove mapping' }))

    await waitFor(() =>
      expect(stub.calls).toContainEqual(
        expect.objectContaining({ method: 'DELETE', url: '/api/mappings/rel_018' }),
      ),
    )
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    // The comparison is refetched so the derived result and Venn reflect the removal.
    expect(stub.calls.filter((call) => call.url.startsWith('/api/compare')).length).toBeGreaterThan(1)
    expect(
      stub.calls.filter((call) => call.method === 'GET' && call.url.startsWith('/api/mappings'))
        .length,
    ).toBeGreaterThan(1)
  })

  it('keeps the drawer open and reports a failure if removal is rejected', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    installApiStub({
      failures: {
        'DELETE /api/mappings/rel_018': {
          status: 500,
          code: 'INTERNAL_ERROR',
          message: 'Unexpected error',
        },
      },
    })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Inspect mapping rel_018' }))
    await user.click(screen.getByRole('button', { name: 'Remove mapping' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Unexpected error')
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('heads the evidence section with how the concepts relate', async () => {
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')

    expect(screen.getByText('How they relate')).toBeInTheDocument()
    expect(
      screen.getByText('See what’s confirmed as shared and what has no confirmed match.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/^Confirmed ·/)).toBeInTheDocument()
  })

  it('navigates to the Mappings page from the evidence header', async () => {
    const user = userEvent.setup()
    installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Manage mappings →' }))

    expect(screen.getByText('Mappings page')).toBeInTheDocument()
  })

  it('highlights the suggested chip for the current pair, in either direction', async () => {
    const user = userEvent.setup()
    const stub = installApiStub()
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    const chip = screen.getByRole('button', { name: 'Returnable ↔ Refundable' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Swap concepts' }))

    // The stub returns a canned comparison, so assert on the request the swap triggered.
    await waitFor(() =>
      expect(stub.calls.map((call) => call.url)).toContain(
        '/api/compare?left=payments.refundable&right=returns.returnable',
      ),
    )
    expect(screen.getByRole('button', { name: 'Returnable ↔ Refundable' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('offers Returnable ↔ Delivered from Returnable ↔ Refundable', async () => {
    installApiStub({
      concepts: [RETURNABLE_WITH_DELIVERY, REFUNDABLE, SHIPPED, DELIVERED],
      mappings: [MAPPING, REL_024, REL_034],
    })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    expect(await screen.findByText('Related concepts')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Returnable ↔ Delivered' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Refundable ↔ Delivered' })).not.toBeInTheDocument()
  })

  it('shows the confirmed match inside the contained Shipped circle', async () => {
    installApiStub({
      concepts: [SHIPPED, DELIVERED, RETURNABLE_WITH_DELIVERY, REFUNDABLE],
      mappings: [MAPPING, REL_024, REL_034],
      comparison: {
        leftConcept: SHIPPED,
        rightConcept: DELIVERED,
        relationship: 'RIGHT_INCLUDES_LEFT',
        matchedFacts: [
          {
            leftFact: SHIPPED.facts[0],
            rightFact: DELIVERED.facts[0],
            mapping: REL_024,
          },
        ],
        unmatchedLeftFacts: [],
        unmatchedRightFacts: [DELIVERED.facts[1]],
      },
    })
    renderPage()

    await screen.findByText('Shipped vs Delivered')
    expect(screen.getByText('SHARED')).toBeInTheDocument()
    expect(screen.getAllByText('Left the fulfillment center').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reached the destination').length).toBeGreaterThan(0)
    expect(screen.queryByText('None')).not.toBeInTheDocument()
  })

  it('offers Delivered ↔ Returnable from Shipped ↔ Delivered', async () => {
    installApiStub({
      concepts: [SHIPPED, DELIVERED, RETURNABLE_WITH_DELIVERY, REFUNDABLE],
      mappings: [MAPPING, REL_024, REL_034],
      comparison: {
        leftConcept: SHIPPED,
        rightConcept: DELIVERED,
        relationship: 'RIGHT_INCLUDES_LEFT',
        matchedFacts: [
          {
            leftFact: SHIPPED.facts[0],
            rightFact: DELIVERED.facts[0],
            mapping: REL_024,
          },
        ],
        unmatchedLeftFacts: [],
        unmatchedRightFacts: [DELIVERED.facts[1]],
      },
    })
    renderPage()

    await screen.findByText('Shipped vs Delivered')
    expect(await screen.findByRole('button', { name: 'Delivered ↔ Returnable' })).toBeInTheDocument()
  })

  it('states that there are no related comparisons when the pair has no other neighbors', async () => {
    const stub = installApiStub({
      concepts: [BUYER_COUNTRY, BILLING_COUNTRY],
      mappings: [
        {
          id: 'rel_031',
          leftFactId: BUYER_COUNTRY.facts[0].id,
          rightFactId: BILLING_COUNTRY.facts[0].id,
          type: 'SAME_MEANING',
          status: 'CONFIRMED',
          rationale: 'Same country value.',
          reviewedBy: 'Domain reviewer',
        },
      ],
      comparison: {
        leftConcept: BUYER_COUNTRY,
        rightConcept: BILLING_COUNTRY,
        relationship: 'SAME_MEANING',
        matchedFacts: [
          {
            leftFact: BUYER_COUNTRY.facts[0],
            rightFact: BILLING_COUNTRY.facts[0],
            mapping: {
              id: 'rel_031',
              leftFactId: BUYER_COUNTRY.facts[0].id,
              rightFactId: BILLING_COUNTRY.facts[0].id,
              type: 'SAME_MEANING',
              status: 'CONFIRMED',
              rationale: 'Same country value.',
              reviewedBy: 'Domain reviewer',
            },
          },
        ],
        unmatchedLeftFacts: [],
        unmatchedRightFacts: [],
      },
    })
    renderPage()

    await screen.findByText('BuyerCountry vs BillingCountry')
    await waitFor(() =>
      expect(stub.calls.some((call) => call.url.startsWith('/api/mappings'))).toBe(true),
    )

    // The section still renders: having no related comparisons is a fact worth stating.
    expect(await screen.findByText('Related concepts')).toBeInTheDocument()
    expect(
      screen.getByText('No other related comparisons in this demo data.'),
    ).toBeInTheDocument()
  })

  it('selects the related pair without leaving Compare', async () => {
    const user = userEvent.setup()
    const stub = installApiStub({
      concepts: [RETURNABLE_WITH_DELIVERY, REFUNDABLE, DELIVERED],
      mappings: [MAPPING, REL_034],
    })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    await user.click(await screen.findByRole('button', { name: 'Returnable ↔ Delivered' }))

    expect(screen.getByLabelText('CONCEPT A')).toHaveValue('returns.returnable')
    expect(screen.getByLabelText('CONCEPT B')).toHaveValue('delivery.delivered')
    expect(screen.queryByText('Mappings page')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(stub.calls.map((call) => call.url)).toContain(
        '/api/compare?left=returns.returnable&right=delivery.delivered',
      ),
    )
  })

  it('shows one related chip when several mappings join the same two concepts', async () => {
    const extra: SemanticMapping = {
      ...REL_034,
      id: 'rel_099',
      leftFactId: RETURNABLE_WITH_DELIVERY.facts[0].id,
      rightFactId: DELIVERED.facts[0].id,
    }
    installApiStub({
      concepts: [RETURNABLE_WITH_DELIVERY, REFUNDABLE, DELIVERED],
      mappings: [MAPPING, REL_034, extra],
    })
    renderPage()

    await screen.findByText('Returnable vs Refundable')
    expect(await screen.findAllByRole('button', { name: 'Returnable ↔ Delivered' })).toHaveLength(1)
  })

  it('reports a failure to load concepts', async () => {
    installApiStub({
      failures: {
        'GET /api/concepts': { status: 500, code: 'INTERNAL_ERROR', message: 'Unexpected error' },
      },
    })
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load concepts')
  })
})
