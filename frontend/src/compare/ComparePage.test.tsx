import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { installApiStub } from '../test/apiStub.ts'
import ComparePage from './ComparePage.tsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ComparePage', () => {
  it('compares the first two published concepts on load', async () => {
    const stub = installApiStub()
    render(<ComparePage />)

    expect(await screen.findByText('Returnable vs Refundable')).toBeInTheDocument()
    expect(screen.getByText('PARTIAL SHARED MEANING')).toBeInTheDocument()
    expect(stub.calls.map((call) => call.url)).toContain(
      '/api/compare?left=returns.returnable&right=payments.refundable',
    )
  })

  it('renders the matched and unmatched facts from the comparison', async () => {
    installApiStub()
    render(<ComparePage />)

    await screen.findByText('Returnable vs Refundable')

    expect(screen.getAllByText('Same meaning')).not.toHaveLength(0)
    expect(screen.getAllByText('No confirmed match')).toHaveLength(2)
    expect(screen.getByText('returns.returnable.valid_return_path')).toBeInTheDocument()
  })

  it('requests a new comparison when the concepts are swapped', async () => {
    const user = userEvent.setup()
    const stub = installApiStub()
    render(<ComparePage />)

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Swap concepts' }))

    await waitFor(() =>
      expect(stub.calls.map((call) => call.url)).toContain(
        '/api/compare?left=payments.refundable&right=returns.returnable',
      ),
    )
  })

  it('opens the mapping drawer with the real evidence', async () => {
    const user = userEvent.setup()
    installApiStub()
    render(<ComparePage />)

    await screen.findByText('Returnable vs Refundable')
    await user.click(screen.getByRole('button', { name: 'Inspect mapping' }))

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByText('rel_018')).toBeInTheDocument()
    expect(within(drawer).getByText('Domain reviewer')).toBeInTheDocument()
  })

  it('reports a failure to load concepts', async () => {
    installApiStub({
      failures: {
        'GET /api/concepts': { status: 500, code: 'INTERNAL_ERROR', message: 'Unexpected error' },
      },
    })
    render(<ComparePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load concepts')
  })
})
