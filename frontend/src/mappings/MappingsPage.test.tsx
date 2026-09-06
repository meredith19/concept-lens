import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MAPPING, installApiStub } from '../test/apiStub.ts'
import MappingsPage from './MappingsPage.tsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MappingsPage', () => {
  it('lists the mappings the API returns', async () => {
    installApiStub()
    render(<MappingsPage />)

    expect(await screen.findByText(/returns\.returnable\.valid_return_path/)).toBeInTheDocument()
    expect(screen.getByText('rel_018')).toBeInTheDocument()
    expect(screen.getByText('SAME MEANING')).toBeInTheDocument()
  })

  it('filters on fact labels resolved from the concepts', async () => {
    const user = userEvent.setup()
    installApiStub({
      mappings: [
        MAPPING,
        { ...MAPPING, id: 'rel_099', leftFactId: 'returns.returnable.within_return_window' },
      ],
    })
    render(<MappingsPage />)

    await screen.findByText('rel_018')
    await user.type(screen.getByLabelText('Filter mappings'), 'return window')

    expect(screen.queryByText('rel_018')).not.toBeInTheDocument()
    expect(screen.getByText('rel_099')).toBeInTheDocument()
  })

  it('deletes a mapping through the API once confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const stub = installApiStub()
    render(<MappingsPage />)

    await screen.findByText('rel_018')
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Mapping removed'))
    expect(stub.calls).toContainEqual(
      expect.objectContaining({ method: 'DELETE', url: '/api/mappings/rel_018' }),
    )
    await waitFor(() => expect(screen.queryByText('rel_018')).not.toBeInTheDocument())
  })

  it('does not call the API when the confirmation is dismissed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const stub = installApiStub()
    render(<MappingsPage />)

    await screen.findByText('rel_018')
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(stub.calls.some((call) => call.method === 'DELETE')).toBe(false)
    expect(screen.getByText('rel_018')).toBeInTheDocument()
  })

  it('creates a mapping from the add drawer', async () => {
    const user = userEvent.setup()
    const stub = installApiStub()
    render(<MappingsPage />)

    await screen.findByText('rel_018')
    await user.click(screen.getByRole('button', { name: '+ Add mapping' }))

    await user.selectOptions(screen.getByLabelText('SOURCE FACT'), 'Is within the return window')
    await user.selectOptions(screen.getByLabelText('TARGET FACT'), 'Return has been approved')
    await user.type(screen.getByLabelText('EVIDENCE / NOTE'), 'Same approval step.')
    await user.click(screen.getByRole('button', { name: 'Save mapping' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Mapping rel_2 saved'),
    )
    const posted = stub.calls.find((call) => call.method === 'POST')
    expect(posted?.body).toEqual({
      leftFactId: 'returns.returnable.within_return_window',
      rightFactId: 'payments.refundable.return_approved',
      type: 'SAME_MEANING',
      status: 'CONFIRMED',
      rationale: 'Same approval step.',
      reviewedBy: 'Domain reviewer',
    })
    expect(posted?.body).not.toHaveProperty('id')
  })

  it('surfaces a rejected mapping without closing the drawer', async () => {
    const user = userEvent.setup()
    installApiStub({
      failures: {
        'POST /api/mappings': {
          status: 400,
          code: 'INVALID_MAPPING',
          message: 'Both facts belong to concept returns.returnable',
        },
      },
    })
    render(<MappingsPage />)

    await user.click(await screen.findByRole('button', { name: '+ Add mapping' }))
    await user.click(screen.getByRole('button', { name: 'Save mapping' }))

    expect(await screen.findByText(/Both facts belong to concept/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save mapping' })).toBeInTheDocument()
  })

  it('opens the detail drawer with the mapping provenance', async () => {
    const user = userEvent.setup()
    installApiStub()
    render(<MappingsPage />)

    await user.click(await screen.findByRole('button', { name: 'View' }))

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByText('RETURNS · RETURNABLE')).toBeInTheDocument()
    expect(within(drawer).getByText(MAPPING.rationale)).toBeInTheDocument()
  })
})
