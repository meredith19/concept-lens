import { render, screen } from '@testing-library/react'
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

    expect(screen.getByRole('heading', { name: 'Compare any two concepts.' })).toBeInTheDocument()
    expect(await screen.findByText('Returnable vs Refundable')).toBeInTheDocument()
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
