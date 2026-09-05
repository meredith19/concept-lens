import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import ComparePage from './ComparePage.tsx'

describe('ComparePage', () => {
  it('opens on the Returnable / Refundable comparison', () => {
    render(<ComparePage />)

    expect(screen.getByText('Returnable vs Refundable')).toBeInTheDocument()
    expect(screen.getByText('PARTIAL OVERLAP')).toBeInTheDocument()
    expect(screen.getByText('Related, but not interchangeable.')).toBeInTheDocument()
  })

  it('swaps the two concepts', async () => {
    const user = userEvent.setup()
    render(<ComparePage />)

    await user.click(screen.getByRole('button', { name: '⇄' }))

    expect(screen.getByText('Refundable vs Returnable')).toBeInTheDocument()
  })

  it('applies a suggested comparison and redraws the relationship', async () => {
    const user = userEvent.setup()
    render(<ComparePage />)

    await user.click(screen.getByRole('button', { name: 'Shipped ↔ Delivered' }))

    expect(screen.getByText('Shipped vs Delivered')).toBeInTheDocument()
    expect(screen.getByText('CONTAINMENT')).toBeInTheDocument()
    expect(screen.getByText('Delivered is more specific.')).toBeInTheDocument()
  })

  it('falls back to the unknown wording for an unmapped pair', async () => {
    const user = userEvent.setup()
    render(<ComparePage />)

    await user.selectOptions(screen.getByLabelText('CONCEPT B'), 'delivered')

    expect(screen.getByText('Relationship unknown.')).toBeInTheDocument()
    expect(screen.getByText('No confirmed mapping for this demo pair')).toBeInTheDocument()
  })

  it('opens the mapping detail drawer from the evidence panel', async () => {
    const user = userEvent.setup()
    render(<ComparePage />)

    await user.click(screen.getByRole('button', { name: 'Inspect mapping' }))

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByRole('heading', { name: 'Why is this shared?' })).toBeInTheDocument()
  })
})
