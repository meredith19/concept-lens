import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App.tsx'
import { installApiStub } from './test/apiStub.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('lands on the Compare page', async () => {
    installApiStub()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Understand how concepts across systems relate.' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Returnable vs Refundable')).toBeInTheDocument()
  })

  it('restores the seeded mappings when demo data is reset', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const stub = installApiStub()
    render(
      <MemoryRouter initialEntries={['/mappings']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await waitFor(() => expect(screen.queryByText('rel_018')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }))

    expect(await screen.findByText('rel_018')).toBeInTheDocument()
    expect(screen.getByText('Demo data reset.')).toBeInTheDocument()
    expect(stub.calls).toContainEqual(
      expect.objectContaining({ method: 'POST', url: '/api/demo/reset' }),
    )
  })

  it('does not reset when the confirmation is dismissed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const stub = installApiStub()
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }))

    expect(stub.calls.some((call) => call.url === '/api/demo/reset')).toBe(false)
  })

  it('navigates to the Mappings page', async () => {
    const user = userEvent.setup()
    installApiStub()
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'Mappings' }))

    expect(screen.getByRole('heading', { name: 'Mappings' })).toBeInTheDocument()
    expect(await screen.findByText('rel_018')).toBeInTheDocument()
  })
})
